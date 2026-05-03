const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

const sendContactNotification = async ({ name, email, subject, message }) => {
  // Log credentials status (not the actual values)
  console.log('📧 Email attempt:', {
    userSet: !!process.env.GMAIL_USER,
    passSet: !!process.env.GMAIL_APP_PASSWORD,
    passLength: process.env.GMAIL_APP_PASSWORD ? process.env.GMAIL_APP_PASSWORD.length : 0,
    notifyEmail: process.env.NOTIFY_EMAIL,
  });

  const transporter = createTransporter();

  // Verify connection first
  await transporter.verify();
  console.log('✅ Gmail transporter verified');

  const notificationHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="font-family:Arial,sans-serif;background:#050a0f;color:#e8f4ff;padding:20px;">
      <div style="max-width:600px;margin:0 auto;background:#0d1a26;border:1px solid rgba(0,180,255,0.2);border-radius:12px;padding:32px;">
        <h1 style="color:#00b4ff;margin-top:0;">📬 New Portfolio Message</h1>
        <p><strong style="color:#8ab0cc;">From:</strong> ${name}</p>
        <p><strong style="color:#8ab0cc;">Email:</strong> <a href="mailto:${email}" style="color:#00b4ff;">${email}</a></p>
        <p><strong style="color:#8ab0cc;">Subject:</strong> ${subject}</p>
        <div style="background:#080f18;border:1px solid rgba(0,180,255,0.1);border-radius:8px;padding:16px;margin-top:16px;">
          <p style="margin:0;white-space:pre-wrap;">${message}</p>
        </div>
        <p style="color:#4a7090;font-size:12px;margin-top:24px;">${new Date().toUTCString()}</p>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"Portfolio Contact" <${process.env.GMAIL_USER}>`,
    to: process.env.NOTIFY_EMAIL,
    subject: `📬 [Portfolio] ${subject} — from ${name}`,
    html: notificationHtml,
    replyTo: email,
  });
  console.log('✅ Notification email sent');

  const autoReplyHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="font-family:Arial,sans-serif;background:#f5f8ff;color:#1a2a3a;padding:20px;">
      <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#050a0f,#0d1a26);padding:24px;border-radius:8px;text-align:center;margin-bottom:24px;">
          <h1 style="color:#00b4ff;margin:0;">AM.</h1>
          <p style="color:#8ab0cc;margin:8px 0 0;font-size:14px;">Assil Mhadhbi — Security Specialist Aspirant</p>
        </div>
        <p>Hi <strong style="color:#0077bb;">${name}</strong>,</p>
        <p>Thank you for reaching out! I've received your message and will get back to you within 24–48 hours.</p>
        <div style="border-left:3px solid #00b4ff;padding:12px 16px;background:#f0f6ff;margin:20px 0;border-radius:0 8px 8px 0;">
          <strong>Assil Mhadhbi</strong><br>
          <span style="color:#6688aa;font-size:13px;">SOC Trainee · Aspiring Cybersecurity Specialist · Tunis, Tunisia</span>
        </div>
        <p style="color:#8899aa;font-size:12px;">This is an automated reply. © ${new Date().getFullYear()} Assil Mhadhbi</p>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"Assil Mhadhbi" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `Thanks for reaching out, ${name}! 👋`,
    html: autoReplyHtml,
  });
  console.log('✅ Auto-reply sent to', email);
};

module.exports = { sendContactNotification };
