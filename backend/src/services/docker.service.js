const docker = require('../config/docker');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

function calculateCpuPercent(stats) {
  const cpuDelta =
    stats.cpu_stats.cpu_usage.total_usage -
    stats.precpu_stats.cpu_usage.total_usage;
  const systemDelta =
    stats.cpu_stats.system_cpu_usage -
    stats.precpu_stats.system_cpu_usage;
  const numCpus =
    stats.cpu_stats.online_cpus ||
    stats.cpu_stats.cpu_usage.percpu_usage?.length ||
    1;

  if (systemDelta > 0 && cpuDelta >= 0) {
    return (cpuDelta / systemDelta) * numCpus * 100;
  }
  return 0;
}

function computeStats(raw) {
  const memUsage = raw.memory_stats.usage || 0;
  const memLimit = raw.memory_stats.limit || 1;
  const networks = raw.networks || {};
  let rxBytes = 0;
  let txBytes = 0;
  for (const iface of Object.values(networks)) {
    rxBytes += iface.rx_bytes || 0;
    txBytes += iface.tx_bytes || 0;
  }

  const blkStats = (raw.blkio_stats?.io_service_bytes_recursive) || [];
  let blockRead = 0;
  let blockWrite = 0;
  for (const entry of blkStats) {
    if (entry.op === 'Read')  blockRead  += entry.value;
    if (entry.op === 'Write') blockWrite += entry.value;
  }

  return {
    cpuPercent:      parseFloat(calculateCpuPercent(raw).toFixed(2)),
    memoryUsageMB:   parseFloat((memUsage / 1024 / 1024).toFixed(2)),
    memoryLimitMB:   parseFloat((memLimit / 1024 / 1024).toFixed(2)),
    memoryPercent:   parseFloat(((memUsage / memLimit) * 100).toFixed(2)),
    networkRxBytes:  rxBytes,
    networkTxBytes:  txBytes,
    blockReadBytes:  blockRead,
    blockWriteBytes: blockWrite,
    pids:            raw.pids_stats?.current || 0
  };
}

async function pullImage(imageName) {
  logger.info(`Pulling image: ${imageName}`);
  return new Promise((resolve, reject) => {
    docker.pull(imageName, (err, stream) => {
      if (err) return reject(err);
      docker.modem.followProgress(stream, (err) => {
        if (err) return reject(err);
        logger.info(`Image pulled: ${imageName}`);
        resolve();
      });
    });
  });
}

async function createContainer({ imageName, containerName, nanoCpus, memoryMB, exposedPorts, envVars, presetName, cmd }) {
  try {
    const portBindings = {};
    const exposedPortsConfig = {};

    for (const { containerPort, protocol = 'tcp' } of (exposedPorts || [])) {
      const key = `${containerPort}/${protocol}`;
      exposedPortsConfig[key] = {};
      portBindings[key] = [{ HostPort: '0' }]; // Docker auto-assigns host port
    }

    const envArray = Object.entries(envVars || {}).map(([k, v]) => `${k}=${v}`);

    const createOpts = {
      Image:        imageName,
      name:         containerName,
      Labels: {
        'vlab.managed':    'true',
        'vlab.presetName': presetName || ''
      },
      ExposedPorts: exposedPortsConfig,
      Env:          envArray,
      HostConfig: {
        PortBindings: portBindings,
        // NanoCpus: 1코어 = 1_000_000_000. 미지정 시 제한 없음(0)
        NanoCpus:     Math.round((nanoCpus || 1) * 1e9),
        Memory:       (memoryMB || 1024) * 1024 * 1024,
        AutoRemove:   false
      }
    };

    // cmd가 지정된 경우에만 Cmd 필드 추가 (빈 배열이면 이미지 기본값 사용)
    if (cmd && cmd.length > 0) {
      createOpts.Cmd = cmd;
    }

    const dockerContainer = await docker.createContainer(createOpts);

    logger.info(`Container created: ${dockerContainer.id} (image: ${imageName})`);
    return { dockerContainerId: dockerContainer.id };
  } catch (err) {
    if (err.statusCode === 404) {
      throw new ApiError(404, 'DOCKER_IMAGE_NOT_FOUND', `Image not found: ${imageName}`);
    }
    if (err.statusCode === 409) {
      throw new ApiError(409, 'CONTAINER_NAME_CONFLICT', `Container name already in use: ${containerName}`);
    }
    throw err;
  }
}

async function startContainer(dockerContainerId, containerPort = null) {
  try {
    const container = docker.getContainer(dockerContainerId);
    await container.start();

    let hostPort = null;
    if (containerPort) {
      const inspectData = await container.inspect();
      const bindings = inspectData.NetworkSettings.Ports;
      const key = `${containerPort}/tcp`;
      if (bindings && bindings[key] && bindings[key][0]) {
        hostPort = parseInt(bindings[key][0].HostPort);
      }
    }

    logger.info(`Container started: ${dockerContainerId}`);
    return { hostPort };
  } catch (err) {
    if (err.statusCode === 304) {
      throw new ApiError(409, 'CONTAINER_ALREADY_RUNNING', 'Container is already running');
    }
    if (err.statusCode === 404) {
      throw new ApiError(404, 'DOCKER_CONTAINER_NOT_FOUND', 'Docker container does not exist');
    }
    throw err;
  }
}

async function stopContainer(dockerContainerId, timeoutSeconds = 10) {
  try {
    const container = docker.getContainer(dockerContainerId);
    await container.stop({ t: timeoutSeconds });
    logger.info(`Container stopped: ${dockerContainerId}`);
  } catch (err) {
    if (err.statusCode === 304) {
      // Already stopped — treat as success
      logger.warn(`Container ${dockerContainerId} was already stopped`);
      return;
    }
    if (err.statusCode === 404) {
      throw new ApiError(404, 'DOCKER_CONTAINER_NOT_FOUND', 'Docker container does not exist');
    }
    throw err;
  }
}

async function removeContainer(dockerContainerId, force = false) {
  try {
    const container = docker.getContainer(dockerContainerId);
    await container.remove({ force, v: true }); // v=true removes anonymous volumes
    logger.info(`Container removed: ${dockerContainerId}`);
  } catch (err) {
    if (err.statusCode === 404) {
      // Already removed — treat as success
      logger.warn(`Container ${dockerContainerId} already removed`);
      return;
    }
    if (err.statusCode === 409) {
      throw new ApiError(409, 'CONTAINER_RUNNING', 'Cannot remove a running container without force=true');
    }
    throw err;
  }
}

async function getContainerStats(dockerContainerId) {
  try {
    const container = docker.getContainer(dockerContainerId);
    const raw = await container.stats({ stream: false });
    return computeStats(raw);
  } catch (err) {
    if (err.statusCode === 404) {
      throw new ApiError(404, 'DOCKER_CONTAINER_NOT_FOUND', 'Docker container does not exist');
    }
    throw err;
  }
}

async function getContainerStatsStream(dockerContainerId) {
  try {
    const container = docker.getContainer(dockerContainerId);
    return await container.stats({ stream: true });
  } catch (err) {
    if (err.statusCode === 404) {
      throw new ApiError(404, 'DOCKER_CONTAINER_NOT_FOUND', 'Docker container does not exist');
    }
    throw err;
  }
}

async function inspectContainer(dockerContainerId) {
  try {
    const container = docker.getContainer(dockerContainerId);
    return await container.inspect();
  } catch (err) {
    if (err.statusCode === 404) {
      throw new ApiError(404, 'DOCKER_CONTAINER_NOT_FOUND', 'Docker container does not exist');
    }
    throw err;
  }
}

async function listContainers(all = true) {
  return docker.listContainers({
    all,
    filters: JSON.stringify({ label: ['vlab.managed=true'] })
  });
}

async function ping() {
  try {
    await docker.ping();
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  pullImage,
  createContainer,
  startContainer,
  stopContainer,
  removeContainer,
  getContainerStats,
  getContainerStatsStream,
  inspectContainer,
  listContainers,
  computeStats,
  ping
};
