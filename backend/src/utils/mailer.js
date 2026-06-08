const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendVerificationEmail = async (email, code) => {
  await transporter.sendMail({
    from: `"가상 실습실 예약 센터" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "[가상 실습실] 이메일 인증 코드",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto;">
        <h2>이메일 인증</h2>
        <p>아래 인증 코드를 입력해주세요.</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 8px;">
          ${code}
        </div>
        <p style="color: #888; font-size: 13px;">인증 코드는 5분간 유효합니다.</p>
      </div>
    `,
  });
};