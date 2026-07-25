/**
 * Drop every CodeConnect collection, leaving an empty database.
 *
 *   npm run reset-db          # prompts for confirmation
 *   npm run reset-db -- --yes # no prompt (what dev.py --reset-db uses)
 *
 * Lives here rather than in dev.py because this service owns the schema — the
 * list of collections to drop should sit next to the models that define them,
 * so adding a model and forgetting the reset script isn't possible from a
 * different directory.
 *
 * Only the collections listed below are touched. A blanket dropDatabase() would
 * be a live grenade the day someone points DATABASE at a shared instance.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const readline = require('readline');

dotenv.config({ path: './.env' });

// Mongoose pluralises model names for collection names; these are the six the
// models in ../models/ produce.
const OWNED_COLLECTIONS = ['users', 'problems', 'queries', 'contests', 'results', 'codes'];

// Databases that are never ours, whatever the connection string says.
const PROTECTED_DATABASES = new Set(['admin', 'local', 'config', 'test']);

function databaseName(uri) {
  const match = /^mongodb(\+srv)?:\/\/[^/]+\/([^/?]+)/.exec(uri || '');
  return match ? decodeURIComponent(match[2]) : null;
}

function confirm(question) {
  // A non-interactive stdin (CI, or dev.py's piped child) can't answer, so it
  // must pass --yes rather than hang forever on a prompt nobody can see.
  if (!process.stdin.isTTY) return Promise.resolve(false);
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'yes');
    });
  });
}

async function main() {
  const uri = process.env.DATABASE;
  const assumeYes = process.argv.includes('--yes') || process.argv.includes('-y');

  if (!uri) {
    console.error('DATABASE is not set. Copy .env.example to .env first.');
    process.exit(1);
  }

  const dbName = databaseName(uri);
  if (!dbName) {
    console.error(
      'DATABASE must include a database name, e.g. mongodb://localhost:27017/codeconnect — ' +
        'refusing to reset the server default.',
    );
    process.exit(1);
  }
  if (PROTECTED_DATABASES.has(dbName)) {
    console.error(`Refusing to reset "${dbName}" — that is a shared/system database, not this app's.`);
    process.exit(1);
  }

  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const existing = (await db.listCollections().toArray()).map((c) => c.name);
  const targets = OWNED_COLLECTIONS.filter((name) => existing.includes(name));

  const counts = {};
  let totalDocs = 0;
  for (const name of targets) {
    counts[name] = await db.collection(name).countDocuments();
    totalDocs += counts[name];
  }

  if (targets.length === 0) {
    console.log(`Database "${dbName}" is already empty — nothing to drop.`);
    await mongoose.disconnect();
    return;
  }

  console.log(`About to drop ${targets.length} collection(s) from "${dbName}" (${totalDocs} documents):`);
  for (const name of targets) console.log(`  ${name}: ${counts[name]}`);

  const foreign = existing.filter((name) => !OWNED_COLLECTIONS.includes(name));
  if (foreign.length > 0) {
    console.log(`Leaving ${foreign.length} collection(s) that are not CodeConnect's: ${foreign.join(', ')}`);
  }

  if (!assumeYes) {
    const ok = await confirm('Type "yes" to confirm: ');
    if (!ok) {
      console.log('Aborted — nothing was dropped.');
      await mongoose.disconnect();
      process.exit(1);
    }
  }

  for (const name of targets) {
    await db.collection(name).drop();
    console.log(`  dropped ${name}`);
  }

  console.log(`Database "${dbName}" reset.`);
  // The browser still holds the deleted account in localStorage. A refresh
  // fixes it — POST /user/sync re-creates the row from the Auth0 identity — but
  // say so, because the gap looks like a bug if you aren't expecting it.
  console.log('Reload the app in your browser; your account is recreated on the next sign-in sync.');
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('Reset failed:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
