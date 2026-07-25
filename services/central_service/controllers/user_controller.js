const user = require('../models/users_model');
const query = require('../models/query_model');
const catchAsync = require('../utils/catchAsync');
const { activityStats } = require('../utils/activity');

// Create a new user.
exports.putone = catchAsync(async (req, res) => {
  const created = await user.create(req.body);
  res.status(201).json({
    status: 'SUCCESS',
    data: { user: created._id },
  });
});

/** Derives a URL-safe username stem from an email local part or display name. */
function usernameStem(source) {
  const stem = String(source || '')
    .split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 20);
  return stem || 'coder';
}

/**
 * Upsert the account backing an authenticated identity.
 *
 * The client used to do this as check-email-then-create, which had two
 * problems: a duplicate account could be created if the two calls interleaved,
 * and every new user got a random 4-character suffix on their username whether
 * or not the stem was actually taken. This does the whole thing server-side in
 * one idempotent call — same email in, same account out, always.
 */
exports.syncUser = catchAsync(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ status: 'FAILED', message: 'An email address is required' });
  }

  const existing = await user.findOne({ email });
  if (existing) {
    // Keep the provider avatar fresh, but never overwrite profile fields the
    // user has edited here.
    if (req.body.picture && existing.picture !== req.body.picture) {
      existing.picture = req.body.picture;
      await existing.save();
    }
    return res.status(200).json({ status: 'SUCCESS', data: { user: existing, created: false } });
  }

  const stem = usernameStem(req.body.name || email);
  const payload = {
    email,
    nickname: req.body.name || stem,
    picture: req.body.picture || '',
  };

  // Only suffix the username when the plain one is actually taken. Ten tries
  // is far beyond what collisions realistically need; past that, fall back to
  // a timestamp so signup can never hard-fail on a name clash.
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const username = attempt === 0 ? stem : `${stem}${attempt + 1}`;
    try {
      const created = await user.create({ ...payload, username });
      return res.status(201).json({ status: 'SUCCESS', data: { user: created, created: true } });
    } catch (err) {
      if (err.code !== 11000) throw err;
      // A concurrent request may have created this exact email in the gap
      // between the findOne above and this insert — adopt that account.
      if (err.keyPattern?.email) {
        const raced = await user.findOne({ email });
        if (raced) return res.status(200).json({ status: 'SUCCESS', data: { user: raced, created: false } });
      }
    }
  }

  const created = await user.create({ ...payload, username: `${stem}_${Date.now().toString(36)}` });
  res.status(201).json({ status: 'SUCCESS', data: { user: created, created: true } });
});

// Update the editable fields of a user's own profile.
exports.updateUser = catchAsync(async (req, res) => {
  const { id, nickname, description, year } = req.body;
  if (!id) {
    return res.status(400).json({ status: 'FAILED', message: 'User id is required' });
  }

  // Only these three are user-editable. Everything else on the document —
  // points, rating, username, following — is derived from activity and must
  // not be settable by spreading the request body into the patch.
  const patch = {};
  if (nickname !== undefined) patch.nickname = String(nickname).trim().slice(0, 60);
  if (description !== undefined) patch.description = String(description).trim().slice(0, 500);
  if (year !== undefined) patch.year = String(year).trim().slice(0, 40);

  const updated = await user.findByIdAndUpdate(id, patch, { new: true, runValidators: true });
  if (!updated) {
    return res.status(404).json({ status: 'FAILED', message: 'User not found' });
  }

  res.status(200).json({ status: 'SUCCESS', data: { user: updated, message: 'Profile updated' } });
});

/**
 * Toggle a follow relationship.
 *
 * Both sides of the edge are written together: `following` on the actor and
 * `followed` on the target. Previously this only ever added, so the UI had no
 * way to undo a mis-click and the button had to be permanently disabled once
 * pressed.
 */
exports.follow = catchAsync(async (req, res) => {
  const { f1, f2 } = req.body;
  if (!f1 || !f2) {
    return res.status(400).json({ status: 'FAILED', message: 'Both user ids are required' });
  }
  if (String(f1) === String(f2)) {
    return res.status(400).json({ status: 'FAILED', message: 'You cannot follow yourself' });
  }

  const sender = await user.findById(f1);
  const receiver = await user.findById(f2);
  if (!sender) return res.status(404).json({ status: 'FAILED', message: 'Sender not found' });
  if (!receiver) return res.status(404).json({ status: 'FAILED', message: 'Receiver not found' });

  const alreadyFollowing = sender.following.some((id) => id.equals(receiver._id));

  if (alreadyFollowing) {
    sender.following.pull(receiver._id);
    receiver.followed.pull(sender._id);
  } else {
    sender.following.addToSet(receiver._id);
    receiver.followed.addToSet(sender._id);
  }

  await sender.save();
  await receiver.save();

  res.status(200).json({
    status: 'SUCCESS',
    data: {
      following: !alreadyFollowing,
      followerCount: receiver.followed.length,
      message: alreadyFollowing ? 'Unfollowed' : 'Following',
    },
  });
});

// Calculate a user's global rank.
exports.rank = catchAsync(async (req, res) => {
  const userId = req.body.id;
  if (!userId) {
    return res.status(400).json({ status: 'FAILED', message: 'User ID is required' });
  }
  const ranking = await user.getRank(userId);
  res.status(200).json({
    status: 'SUCCESS',
    data: { rank: ranking, message: 'Success in ranking' },
  });
});

// Get a single user.
exports.getuser = catchAsync(async (req, res) => {
  const found = await user.findById(req.body.id);
  if (!found) {
    return res.status(404).json({ status: 'FAILED', message: 'User not found' });
  }
  res.status(200).json({
    status: 'SUCCESS',
    data: { user: found, message: 'Successfully sent user details' },
  });
});

// Get every query asked or solved by a user, plus per-tag counts.
exports.getUserQuery = catchAsync(async (req, res) => {
  const userId = req.body.id;
  const found = await user.findById(userId).populate('queries');
  if (!found) {
    return res.status(404).json({ status: 'FAILED', message: 'User not found' });
  }

  let totalAskedQueries = 0;
  let totalSolvedQueries = 0;
  const tagCounts = {
    competetive: 0,
    'web dev': 0,
    acedemic: 0,
    'machine learning': 0,
    'cyber security': 0,
    others: 0,
  };

  found.queries.forEach((q) => {
    if (q.tag in tagCounts) tagCounts[q.tag] += 1;
    if (q.author?.toString() === userId) totalAskedQueries += 1;
    if (q.solver?.toString() === userId) totalSolvedQueries += 1;
  });

  res.status(200).json({
    status: 'SUCCESS',
    data: {
      totalQueries: found.queries.length,
      totalAskedQueries,
      totalSolvedQueries,
      queries: found.queries,
      tagCounts,
      message: 'Successfully sent user query stats',
    },
  });
});

/**
 * A user's day-by-day activity plus derived streak stats.
 *
 * Split out from `getuser` because the profile heatmap is the only consumer of
 * the full 365-day array, and every other screen that loads a user was paying
 * for it. Streaks are computed here rather than in the client so the number is
 * the same everywhere it appears — see utils/activity.js on why "current"
 * tolerates a one-day gap.
 */
exports.getUserActivity = catchAsync(async (req, res) => {
  const found = await user.findById(req.params.id).select('activity username');
  if (!found) {
    return res.status(404).json({ status: 'FAILED', message: 'User not found' });
  }

  const activity = (found.activity || []).map((a) => ({ date: a.date, value: a.value }));

  res.status(200).json({
    status: 'SUCCESS',
    data: { activity, stats: activityStats(activity) },
  });
});

// List every user, sorted by points descending.
exports.getAllUsersSortedByPoints = catchAsync(async (req, res) => {
  const users = await user.find().sort({ points: -1 });
  res.status(200).json({
    status: 'SUCCESS',
    data: { users, message: 'Successfully fetched users sorted by points' },
  });
});

// Check whether an email is already registered.
//
// Superseded by syncUser for the sign-in path — kept only because it is a
// harmless read and removing a public route is a breaking change for anything
// still pointed at it. New code should call /user/sync.
exports.checkEmailIfExists = catchAsync(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const existing = await user.findOne({ email });

  if (existing) {
    return res.status(200).json({ status: 'SUCCESS', exists: true, userId: existing._id });
  }
  res.status(200).json({ status: 'SUCCESS', exists: false, userId: null });
});
