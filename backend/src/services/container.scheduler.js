/**
 * container.scheduler.js
 * 예약 승인 시 start_time에 Docker 컨테이너를 자동 생성하는 스케줄러.
 * - schedule(reservationId, startTime, osPreset): 생성 예약
 * - cancel(reservationId): 예약 취소
 * - killReservationContainer(reservationId): 컨테이너 종료 + DB 정리
 * - restore(): 서버 재시작 시 DB에서 미생성 예약 복구
 */

const containerService = require('./container.service');
const logger = require('../utils/logger');
const os = require('os');

// reservationId(string) -> setTimeout handle
const _jobs = new Map();

function _getHostIP() {
  if (process.env.HOST_IP) return process.env.HOST_IP;
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

async function _createAndSave(reservationId, osPreset) {
  // require here to avoid circular dependency
  const Reservation = require('../models/Reservation');

  try {
    logger.info(`[Scheduler] Creating container: reservation=${reservationId}, preset=${osPreset}`);

    const result = await containerService.runContainer(osPreset);
    const host = _getHostIP();
    const sshPort = result.hostPorts?.[22] || null;
    const sshCommand = sshPort ? `ssh root@${host} -p ${sshPort}` : null;

    await Reservation.findByIdAndUpdate(reservationId, {
      container_id: result.dockerContainerId,
      container_info: {
        host,
        ports: result.hostPorts,
        preset_name: result.presetName,
        ssh_command: sshCommand,
        started_at: new Date(),
      },
    });

    _jobs.delete(reservationId);
    logger.info(`[Scheduler] Container ready: ${result.dockerContainerId} for reservation ${reservationId}`);
  } catch (err) {
    logger.error(`[Scheduler] Container creation failed for reservation ${reservationId}: ${err.message}`);
  }
}

/**
 * 예약 승인 시 호출. start_time에 컨테이너를 생성하도록 스케줄링.
 */
function schedule(reservationId, startTime, osPreset) {
  const id = reservationId.toString();

  // 기존 스케줄 있으면 취소
  if (_jobs.has(id)) {
    clearTimeout(_jobs.get(id));
    _jobs.delete(id);
  }

  const delay = new Date(startTime).getTime() - Date.now();

  if (delay <= 5000) {
    // 5초 이내(또는 이미 지난 시간)이면 즉시 생성
    _createAndSave(id, osPreset);
  } else {
    const tid = setTimeout(() => _createAndSave(id, osPreset), delay);
    _jobs.set(id, tid);
    logger.info(`[Scheduler] Scheduled: reservation=${id}, delay=${Math.round(delay / 1000)}s`);
  }
}

/**
 * 예약 취소 시 호출. 아직 생성 전이면 스케줄만 취소.
 */
function cancel(reservationId) {
  const id = reservationId.toString();
  if (_jobs.has(id)) {
    clearTimeout(_jobs.get(id));
    _jobs.delete(id);
    logger.info(`[Scheduler] Cancelled schedule for reservation ${id}`);
  }
}

/**
 * 예약 종료/취소 시 실행 중 컨테이너를 종료하고 DB를 정리.
 */
async function killReservationContainer(reservationId) {
  const Reservation = require('../models/Reservation');
  const id = reservationId.toString();

  // 대기 중인 스케줄 먼저 취소
  cancel(id);

  const res = await Reservation.findById(id).lean();
  if (!res?.container_id) return;

  try {
    await containerService.killContainer(res.container_id);
    logger.info(`[Scheduler] Killed container ${res.container_id} for reservation ${id}`);
  } catch (err) {
    // 이미 없는 컨테이너라도 DB는 정리
    logger.warn(`[Scheduler] Kill failed (${err.message}) — cleaning DB anyway`);
  }

  await Reservation.findByIdAndUpdate(id, {
    container_id: null,
    'container_info.started_at': null,
  });
}

/**
 * 서버 재시작 시 DB에서 approved 상태인데 컨테이너 미생성인 예약을 복구.
 */
async function restore() {
  const Reservation = require('../models/Reservation');
  try {
    const pending = await Reservation.find({
      status: 'reserved',
      container_id: null,
      os_preset: { $ne: null },
      end_time: { $gt: new Date() },  // 아직 끝나지 않은 예약만
    }).lean();

    if (pending.length > 0) {
      logger.info(`[Scheduler] Restoring ${pending.length} scheduled job(s)`);
      for (const r of pending) {
        schedule(r._id.toString(), r.start_time, r.os_preset);
      }
    }
  } catch (err) {
    logger.error(`[Scheduler] Restore failed: ${err.message}`);
  }
}

module.exports = { schedule, cancel, killReservationContainer, restore };
