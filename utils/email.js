const https = require('https');

const sendEmail = (to, subject, html, replyTo) => {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      from: 'Portfolio Contact <onboarding@resend.dev>',
      to: [to],
      subject,
      html,
      ...(replyTo && { reply_to: replyTo }),
    });

    const options = {
      hostname: 'api.resend.com',
      port: 443,
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const parsed = JSON.parse(data);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(parsed);
        } else {
          reject(new Error(`Resend error: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
};

const sendContactNotification = async ({ name, email, subject, message }) => {
  console.log('📧 Sending notification via Resend...');

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

  await sendEmail(
    process.env.NOTIFY_EMAIL,
    `📬 [Portfolio] ${subject} — from ${name}`,
    notificationHtml,
    email
  );
  console.log('✅ Notification sent to', process.env.NOTIFY_EMAIL);
};

module.exports = { sendContactNotification };