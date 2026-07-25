const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const { runPython, runCpp, runJava } = require('./runner');

const app = express();
const PORT = process.env.PORT || 2982;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const MAX_CONCURRENT_RUNS = Number(process.env.MAX_CONCURRENT_RUNS || 4);

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json({ limit: '256kb' }));

// A simple counting limiter — code execution is comparatively expensive, so
// this caps how many `spawn`s can be in flight at once rather than trying to
// queue unbounded requests.
let activeRuns = 0;
function withConcurrencyLimit(req, res, next) {
  if (activeRuns >= MAX_CONCURRENT_RUNS) {
    return res.status(429).json({ error: 'Too many runs in progress. Try again in a moment.' });
  }
  activeRuns += 1;
  res.on('finish', () => {
    activeRuns -= 1;
  });
  next();
}

const RUNNERS = { python: runPython, cpp: runCpp, java: runJava };

function makeHandler(language) {
  return async (req, res) => {
    const { code, input } = req.body;
    if (typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({ error: 'code is required' });
    }
    const result = await RUNNERS[language](code, typeof input === 'string' ? input : '');
    res.json(result);
  };
}

app.post('/run/python', withConcurrencyLimit, makeHandler('python'));
app.post('/run/cpp', withConcurrencyLimit, makeHandler('cpp'));
app.post('/run/java', withConcurrencyLimit, makeHandler('java'));

// Legacy aliases kept for backwards compatibility during rollout.
app.post('/py_router/', withConcurrencyLimit, makeHandler('python'));
app.post('/CPP_router/', withConcurrencyLimit, makeHandler('cpp'));
app.post('/JAVA_router/', withConcurrencyLimit, makeHandler('java'));

app.get('/health', (req, res) => res.json({ ok: true, activeRuns, maxConcurrentRuns: MAX_CONCURRENT_RUNS }));

// This service executes arbitrary user-submitted code directly on the host
// with no sandboxing (no container, no seccomp, no user namespace). It is
// safe to run only on a trusted local machine. See Context/07-known-issues.md.
app.listen(PORT, () => {
  console.log(`compilation_service listening on port ${PORT}`);
});
