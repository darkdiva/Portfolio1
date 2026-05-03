const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { saveMessage, markEmailSent } = require('../models/Message');
const { sendContactNotification } = require('../utils/email');

const router = express.Router();

// Rate limiter: max 5 per 15 minutes per IP
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many messages. Please wait 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const validateContact = [
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ max: 100 }),
  body('email').trim().notEmpty().withMessage('Email is required.').isEmail().withMessage('Please provide a valid email.').normalizeEmail(),
  body('subject').trim().notEmpty().withMessage('Subject is required.').isLength({ max: 200 }),
  body('message').trim().notEmpty().withMessage('Message is required.').isLength({ min: 10 }).withMessage('Message must be at least 10 characters.').isLength({ max: 5000 }),
];

// POST /api/contact
router.post('/', contactLimiter, validateContact, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Please check your input.',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }

  const { name, email, subject, message } = req.body;
  const ipAddress = req.ip || '';

  try {
    // Save to database
    const id = await saveMessage({ name, email, subject, message, ipAddress });

    // Send emails
    let emailSent = false;
    try {
      await sendContactNotification({ name, email, subject, message });
      emailSent = true;
      await markEmailSent(id);
    } catch (emailError) {
      console.error('Email failed (message saved):', emailError.message);
    }

    return res.status(201).json({
      success: true,
      message: emailSent
        ? "Message received! I'll get back to you as soon as possible."
        : 'Message received! (Email notification failed but your message is saved.)',
    });

  } catch (err) {
    console.error('Contact route error:', err);
    return res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
});

// GET /api/contact/health
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Contact API is running.' });
});

module.exports = router;
