const express = require('express');
const containerService = require('../services/container.service');
const asyncHandler = require('../middlewares/asyncHandler');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/containers/presets  — 사용 가능한 프리셋 목록 (인증 불필요)
router.get('/presets', (req, res) => {
  const presets = containerService.listPresets();
  res.json({ success: true, data: { presets } });
});

// GET /api/containers  — 현재 실행 중인 컨테이너 목록 (관리자 전용)
router.get('/', verifyToken, verifyAdmin, asyncHandler(async (req, res) => {
  const containers = await containerService.listRunning();
  res.json({ success: true, data: { containers, total: containers.length } });
}));

// POST /api/containers/run/:presetName  — 즉시 생성 + 시작 (관리자 전용)
router.post('/run/:presetName', verifyToken, verifyAdmin, asyncHandler(async (req, res) => {
  const result = await containerService.runContainer(req.params.presetName);
  res.status(201).json({ success: true, data: result });
}));

// POST /api/containers/kill/:dockerContainerId  — 즉시 중지 + 삭제 (관리자 전용)
router.post('/kill/:dockerContainerId', verifyToken, verifyAdmin, asyncHandler(async (req, res) => {
  const result = await containerService.killContainer(req.params.dockerContainerId);
  res.json({ success: true, data: result });
}));

module.exports = router;
