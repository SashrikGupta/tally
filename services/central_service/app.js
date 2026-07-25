const morgan = require('morgan');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');

const app = express();

const contest_router = require('./routes/contest_router');
const user_router = require('./routes/user_router');
const query_router = require('./routes/query_router');
const catchAsync = require('./utils/catchAsync');
const errorHandler = require('./middleware/errorHandler');

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cors({ origin: CLIENT_ORIGIN }));

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.use('/contest', contest_router);
app.use('/query', query_router);
app.use('/', user_router);

// --- Mail (nodemailer) --------------------------------------------------
if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
  console.warn('GMAIL_USER / GMAIL_APP_PASSWORD not set — /mail will fail until configured in .env');
}

const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  secure: true,
  port: 465,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  tls: { rejectUnauthorized: false },
});

app.post(
  '/mail',
  catchAsync(async (req, res) => {
    const { mailId, subject, message } = req.body;
    if (!mailId || !subject || !message) {
      return res.status(400).json({ status: 'FAILED', message: 'mailId, subject and message are required' });
    }

    await mailTransport.sendMail({
      from: process.env.GMAIL_USER,
      to: mailId,
      subject,
      text: message,
    });

    res.status(200).json({ status: 'SUCCESS', data: { message: 'Email sent successfully' } });
  }),
);

app.get('/health', (req, res) => res.json({ ok: true }));

app.use((req, res) => {
  res.status(404).json({ status: 'FAILED', message: `No route for ${req.method} ${req.originalUrl}` });
});

app.use(errorHandler);

module.exports = app;
