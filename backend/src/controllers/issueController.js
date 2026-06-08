const Issue = require("../models/Issue");

// 전체 이슈 목록 조회 (관리자)
exports.getAllIssues = async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate("created_by", "name student_id")
      .populate("resolved_by", "name")
      .sort({ createdAt: -1 });

    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

// 내 이슈 목록 조회 (학생)
exports.getMyIssues = async (req, res) => {
  try {
    const issues = await Issue.find({ created_by: req.user.id })
      .sort({ createdAt: -1 });

    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

// 이슈 등록 (학생)
exports.createIssue = async (req, res) => {
  try {
    const { title, content } = req.body;

    const issue = await Issue.create({
      title,
      content,
      created_by: req.user.id,
    });

    res.status(201).json({ message: "이슈가 등록되었습니다.", issue });
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

// 이슈 상태 변경 (관리자)
exports.updateIssueStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowed = ["waiting", "in_progress", "resolved"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "유효하지 않은 상태값입니다." });
    }

    const updateFields = { status };
    if (status === "resolved") {
      updateFields.resolved_by = req.user.id;
    }

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    if (!issue) {
      return res.status(404).json({ message: "이슈를 찾을 수 없습니다." });
    }

    res.json({ message: "이슈 상태가 변경되었습니다.", issue });
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

// 이슈 삭제 (관리자)
exports.deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: "이슈를 찾을 수 없습니다." });
    }

    res.json({ message: "이슈가 삭제되었습니다." });
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};