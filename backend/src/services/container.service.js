const crypto = require('crypto');
const presets = require('../config/presets');
const dockerService = require('./docker.service');
const ApiError = require('../utils/ApiError');

function generatePassword() {
  return crypto.randomBytes(12).toString('base64url').slice(0, 12);
}

function listPresets() {
  return Object.entries(presets).map(([name, spec]) => ({
    name,
    description:    spec.description,
    imageName:      spec.imageName,
    resourceLimits: spec.resourceLimits,
    exposedPorts:   spec.exposedPorts,
    cmd:            spec.cmd
  }));
}

async function runContainer(presetName) {
  const spec = presets[presetName];
  if (!spec) {
    throw new ApiError(404, 'PRESET_NOT_FOUND',
      `Preset '${presetName}' not found. Available: ${Object.keys(presets).join(', ')}`);
  }

  // 충돌 없는 고유 컨테이너 이름 생성
  const containerName = `vlab-${presetName}-${crypto.randomUUID().slice(0, 8)}`;

  // SSH 프리셋의 경우 랜덤 비밀번호 생성 후 placeholder 교체
  const password = generatePassword();
  const cmd = spec.cmd.map((part) => part.replace(/%%PASSWORD%%/g, password));

  // 1. 이미지 pull (로컬에 없으면 Docker Hub에서 다운로드)
  await dockerService.pullImage(spec.imageName);

  // 2. 컨테이너 생성
  const { dockerContainerId } = await dockerService.createContainer({
    imageName:    spec.imageName,
    containerName,
    nanoCpus:     spec.resourceLimits.nanoCpus,
    memoryMB:     spec.resourceLimits.memoryMB,
    exposedPorts: spec.exposedPorts,
    envVars:      spec.envVars,
    presetName,
    cmd
  });

  // 3. 컨테이너 시작 및 할당된 호스트 포트 수집
  await dockerService.startContainer(dockerContainerId, null);

  // 시작 후 inspect로 모든 포트 매핑 수집
  const hostPorts = {};
  if (spec.exposedPorts.length > 0) {
    const inspectData = await dockerService.inspectContainer(dockerContainerId);
    const bindings = inspectData.NetworkSettings?.Ports || {};
    for (const { containerPort, protocol = 'tcp' } of spec.exposedPorts) {
      const key = `${containerPort}/${protocol}`;
      if (bindings[key]?.[0]) {
        hostPorts[containerPort] = parseInt(bindings[key][0].HostPort);
      }
    }
  }

  return {
    dockerContainerId,
    containerName,
    presetName,
    imageName:  spec.imageName,
    hostPorts,
    password,
    startedAt:  new Date().toISOString()
  };
}

async function killContainer(dockerContainerId) {
  // inspect로 실제 존재 여부 확인
  await dockerService.inspectContainer(dockerContainerId);

  await dockerService.stopContainer(dockerContainerId);
  await dockerService.removeContainer(dockerContainerId);

  return {
    dockerContainerId,
    stoppedAt: new Date().toISOString()
  };
}


async function listRunning() {
  const raw = await dockerService.listContainers(false); // running only
  return raw.map(c => ({
    dockerContainerId: c.Id,
    containerName:     c.Names?.[0]?.replace(/^\//, '') || '',
    presetName:        c.Labels?.['vlab.presetName'] || 'unknown',
    imageName:         c.Image,
    status:            c.Status,
    createdAt:         new Date(c.Created * 1000).toISOString(),
    ports: Object.values(
        (c.Ports || []).reduce((acc, p) => {
          const key = `${p.PrivatePort}/${p.Type}`;
          if (!acc[key]) {
            acc[key] = { containerPort: p.PrivatePort, hostPort: p.PublicPort || null, protocol: p.Type };
          }
          return acc;
        }, {})
      )
  }));
}

module.exports = { listPresets, runContainer, killContainer, listRunning };
