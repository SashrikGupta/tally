const mongoose = require('mongoose');
const dotenv = require('dotenv');
const moment = require('moment');

dotenv.config({ path: './.env' });

const app = require('./app');

const PORT = process.env.PORT || 1934;
const DATABASE = process.env.DATABASE;

if (!DATABASE) {
  console.error('DATABASE is not set. Copy .env.example to .env and fill in your MongoDB connection string.');
  process.exit(1);
}

// A connection string with no database path lands in MongoDB's default `test`
// database, which on a shared dev machine means CodeConnect's collections sit
// next to every other project's. Fail loudly instead of quietly co-mingling.
if (!/^mongodb(\+srv)?:\/\/[^/]+\/[^/?]+/.test(DATABASE)) {
  console.error(
    'DATABASE must include a database name, e.g. mongodb://localhost:27017/codeconnect — ' +
      'without one, Mongo falls back to the shared `test` database.',
  );
  process.exit(1);
}

mongoose
  .connect(DATABASE)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

app.listen(PORT, () => {
  console.log(`central_service listening on port ${PORT} (started ${moment().format('YYYY-MM-DD HH:mm:ss')})`);
});
