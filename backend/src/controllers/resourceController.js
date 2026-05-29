const Resource = require("../models/Resource");

// 자원 목록 조회 (retired 제외)
exports.getResources = async (req, res) => {
  try {
    const resources = await Resource.find({ status: { $ne: "retired" } })
      .populate("created_by", "name")
      .sort({ createdAt: -1 });

    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

// 특정 자원 상세 조회
exports.getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).populate(
      "created_by",
      "name"
    );

    if (!resource) {
      return res.status(404).json({ message: "자원을 찾을 수 없습니다." });
    }

    res.json(resource);
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

// 자원 등록 (관리자)
exports.createResource = async (req, res) => {
  try {
    const { lab_id, name, spec, status, operating_hours, equipment } = req.body;

    const resource = await Resource.create({
      lab_id,
      name,
      spec,
      status,
      operating_hours,
      equipment,
      created_by: req.user.id,
    });

    res.status(201).json({ message: "자원이 등록되었습니다.", resource });
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

// 자원 수정 (관리자) - spec/status/운영 시간 수정
exports.updateResource = async (req, res) => {
  try {
    const { spec, operating_hours } = req.body;

    const updateFields = {};
    if (spec) updateFields.spec = spec;
    if (operating_hours) updateFields.operating_hours = operating_hours;

    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    if (!resource) {
      return res.status(404).json({ message: "자원을 찾을 수 없습니다." });
    }

    res.json({ message: "자원 정보가 수정되었습니다.", resource });
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

// 자원 상태 변경 (관리자) - active ↔ maintenance 전환 / retired 처리
exports.updateResourceStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ["active", "maintenance", "retired"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "유효하지 않은 상태값입니다." });
    }

    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );

    if (!resource) {
      return res.status(404).json({ message: "자원을 찾을 수 없습니다." });
    }

    res.json({ message: `자원 상태가 '${status}'로 변경되었습니다.`, resource });
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};