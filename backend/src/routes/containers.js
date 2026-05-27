const express = require('express');
const containerService = require('../services/container.service');
const asyncHandler = require('../middlewares/asyncHandler');

const router = express.Router();

// GET /api/containers/presets  — 사용 가능한 프리셋 목록
router.get('/presets', (req, res) => {
  const presets = containerService.listPresets();
  res.json({ success: true, data: { presets } });
});

// GET /api/containers  — 현재 실행 중인 컨테이너 목록
router.get('/', asyncHandler(async (req, res) => {
  const containers = await containerService.listRunning();
  res.json({ success: true, data: { containers, total: containers.length } });
}));

// POST /api/containers/run/:presetName  — 즉시 생성 + 시작
router.post('/run/:presetName', asyncHandler(async (req, res) => {
  const result = await containerService.runContainer(req.params.presetName);
  res.status(201).json({ success: true, data: result });
}));

// POST /api/containers/kill/:dockerContainerId  — 즉시 중지 + 삭제
router.post('/kill/:dockerContainerId', asyncHandler(async (req, res) => {
  const result = await containerService.killContainer(req.params.dockerContainerId);
  res.json({ success: true, data: result });
}));

module.exports = router;
