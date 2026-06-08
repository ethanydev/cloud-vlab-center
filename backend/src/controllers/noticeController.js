const Notice = require("../models/Notice");

// 공지사항 목록 조회 (전체)
exports.getAllNotices = async (req, res) => {
  try {
    const notices = await Notice.find()
      .populate("created_by", "name")
      .sort({ createdAt: -1 });

    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

// 공지사항 상세 조회
exports.getNoticeById = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id)
      .populate("created_by", "name");

    if (!notice) {
      return res.status(404).json({ message: "공지사항을 찾을 수 없습니다." });
    }

    res.json(notice);
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

// 공지사항 등록 (관리자)
exports.createNotice = async (req, res) => {
  try {
    const { title, content, is_urgent } = req.body;

    const notice = await Notice.create({
      title,
      content,
      is_urgent: is_urgent ?? false,
      created_by: req.user.id,
    });

    res.status(201).json({ message: "공지사항이 등록되었습니다.", notice });
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

// 공지사항 수정 (관리자)
exports.updateNotice = async (req, res) => {
  try {
    const { title, content, is_urgent } = req.body;

    const updateFields = {};
    if (title) updateFields.title = title;
    if (content) updateFields.content = content;
    if (typeof is_urgent === "boolean") updateFields.is_urgent = is_urgent;

    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    if (!notice) {
      return res.status(404).json({ message: "공지사항을 찾을 수 없습니다." });
    }

    res.json({ message: "공지사항이 수정되었습니다.", notice });
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

// 공지사항 삭제 (관리자)
exports.deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);

    if (!notice) {
      return res.status(404).json({ message: "공지사항을 찾을 수 없습니다." });
    }

    res.json({ message: "공지사항이 삭제되었습니다." });
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};