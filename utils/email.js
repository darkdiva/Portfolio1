const nodemailer = require('nodemailer');

// Create a reusable Gmail transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

/**
 * Send a notification email to Assil when someone submits the contact form.
 * Also sends an auto-reply to the sender.
 */
const sendContactNotification = async ({ name, email, subject, message }) => {
  const transporter = createTransporter();

  // ── 1. Notification to Assil ──────────────────────────────────────────────
  const notificationHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #050a0f; color: #e8f4ff; margin: 0; padding: 0; }
        .wrapper { max-width: 600px; margin: 40px auto; background: #0d1a26; border: 1px solid rgba(0,180,255,0.2); border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #0d1a26, #112030); padding: 32px; border-bottom: 1px solid rgba(0,180,255,0.15); }
        .header h1 { margin: 0; font-size: 22px; color: #00b4ff; }
        .header p { margin: 8px 0 0; color: #8ab0cc; font-size: 14px; }
        .body { padding: 32px; }
        .field { margin-bottom: 20px; }
        .field label { display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: #4a7090; margin-bottom: 6px; }
        .field .value { font-size: 15px; color: #e8f4ff; background: #080f18; border: 1px solid rgba(0,180,255,0.1); border-radius: 8px; padding: 12px 16px; word-break: break-word; }
        .message-box { white-space: pre-wrap; line-height: 1.7; }
        .footer { padding: 20px 32px; border-top: 1px solid rgba(0,180,255,0.1); font-size: 12px; color: #4a7090; text-align: center; }
        .badge { display: inline-block; background: rgba(0,180,255,0.1); color: #00b4ff; border: 1px solid rgba(0,180,255,0.2); padding: 4px 12px; border-radius: 100px; font-size: 12px; margin-bottom: 16px; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <div class="badge">📬 New Portfolio Message</div>
          <h1>Someone reached out!</h1>
          <p>A new message was submitted via your portfolio contact form.</p>
        </div>
        <div class="body">
          <div class="field">
            <label>From</label>
            <div class="value">${name}</div>
          </div>
          <div class="field">
            <label>Email</label>
            <div class="value"><a href="mailto:${email}" style="color:#00b4ff;">${email}</a></div>
          </div>
          <div class="field">
            <label>Subject</label>
            <div class="value">${subject}</div>
          </div>
          <div class="field">
            <label>Message</label>
            <div class="value message-box">${message}</div>
          </div>
        </div>
        <div class="footer">
          Sent from your portfolio · assil-mhadhbi.dev · ${new Date().toUTCString()}
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"Portfolio Contact" <${process.env.GMAIL_USER}>`,
    to: process.env.NOTIFY_EMAIL,
    subject: `📬 [Portfolio] ${subject} — from ${name}`,
    html: notificationHtml,
    replyTo: email, // so you can just hit Reply to respond to the sender
  });

  // ── 2. Auto-reply to the sender ───────────────────────────────────────────
  const autoReplyHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f8ff; color: #1a2a3a; margin: 0; padding: 0; }
        .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #050a0f, #0d1a26); padding: 36px 32px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; color: #00b4ff; font-family: sans-serif; }
        .header p { margin: 8px 0 0; color: #8ab0cc; font-size: 14px; }
        .body { padding: 36px 32px; }
        .body p { line-height: 1.8; margin: 0 0 16px; color: #334455; }
        .highlight { color: #0077bb; font-weight: 600; }
        .divider { border: none; border-top: 1px solid #e5eaf0; margin: 24px 0; }
        .footer { padding: 20px 32px; background: #f5f8ff; font-size: 12px; color: #8899aa; text-align: center; }
        .signature { margin-top: 24px; padding: 20px; background: #f0f6ff; border-left: 3px solid #00b4ff; border-radius: 0 8px 8px 0; }
        .signature strong { color: #0a1a2a; display: block; font-size: 16px; }
        .signature span { color: #6688aa; font-size: 13px; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h1>AM.</h1>
          <p>Assil Mhadhbi — Security Specialist Aspirant</p>
        </div>
        <div class="body">
          <p>Hi <span class="highlight">${name}</span>,</p>
          <p>Thank you for reaching out through my portfolio! I've received your message and will get back to you as soon as possible — usually within 24–48 hours.</p>
          <hr class="divider">
          <p><strong>Your message:</strong></p>
          <p style="color:#556677;font-style:italic;">"${message.substring(0, 200)}${message.length > 200 ? '...' : ''}"</p>
          <hr class="divider">
          <p>In the meantime, feel free to connect with me on LinkedIn or check my Credly profile for my credentials.</p>
          <div class="signature">
            <strong>Assil Mhadhbi</strong>
            <span>SOC Trainee · Aspiring Cybersecurity Specialist · Tunis, Tunisia</span>
          </div>
        </div>
        <div class="footer">
          This is an automated reply — please do not respond directly to this email.<br>
          © ${new Date().getFullYear()} Assil Mhadhbi
        </div>
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
};

module.exports = { sendContactNotification };
