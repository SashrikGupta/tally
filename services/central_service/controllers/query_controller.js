const Query = require('../models/query_model');
const User = require('../models/users_model');
const catchAsync = require('../utils/catchAsync');
const { bumpActivity } = require('../utils/activity');

const UNSOLVED_SENTINEL = '65f9b0df8cf576d27969a832';

// Post a new query, staking `points` from the author's balance.
exports.postQuery = catchAsync(async (req, res) => {
  const authorId = req.body.author;
  const stake = Number(req.body.points);

  const author = await User.findById(authorId);
  if (!author) {
    return res.status(404).json({ status: 'FAILED', message: 'Author not found' });
  }
  if (Number.isNaN(stake) || stake <= 0) {
    return res.status(400).json({ status: 'FAILED', message: 'Points stake must be a positive number' });
  }
  if (stake > author.points) {
    return res.status(400).json({ status: 'FAILED', message: 'Not eligible to raise query. Insufficient points.' });
  }

  const created = await Query.create({ ...req.body, points: stake, solver: UNSOLVED_SENTINEL });

  author.points -= stake;
  author.queries.push(created._id);
  bumpActivity(author);
  await author.save();

  res.status(201).json({ status: 'SUCCESS', data: { query: created } });
});

// List every query, newest-highest-stake first, with author/solver usernames
// populated — avoids the N+1 "resolve every username client-side" pattern.
exports.getall = catchAsync(async (req, res) => {
  const queries = await Query.find()
    .sort({ points: -1 })
    .populate('author', 'username')
    .populate('solver', 'username');
  res.status(200).json({
    status: 'SUCCESS',
    data: { users: queries, message: 'Successfully fetched queries sorted by points' },
  });
});

exports.getone = catchAsync(async (req, res) => {
  const found = await Query.findById(req.body.id).populate('author', 'username email').populate('solver', 'username email');
  if (!found) {
    return res.status(404).json({ status: 'FAILED', message: 'Query not found' });
  }
  res.status(200).json({ status: 'SUCCESS', data: { users: found } });
});

// Mark a query solved: pay the solver double the stake, refund the author
// half, and record both parties' solutions.
exports.solve = catchAsync(async (req, res) => {
  const { sol, io, qid, uid } = req.body;

  const foundQuery = await Query.findById(qid);
  if (!foundQuery) return res.status(404).json({ status: 'FAILED', message: 'Query not found' });

  const solver = await User.findById(uid);
  const author = await User.findById(foundQuery.author);
  if (!solver || !author) {
    return res.status(404).json({ status: 'FAILED', message: 'User not found' });
  }

  foundQuery.solution = sol;
  foundQuery.io = io;
  foundQuery.status = 'solved';
  foundQuery.solver = solver._id;
  await foundQuery.save();

  author.points += foundQuery.points / 2;
  bumpActivity(author);
  await author.save();

  solver.points += foundQuery.points * 2;
  solver.queries.push(foundQuery._id);
  bumpActivity(solver);
  await solver.save();

  res.status(200).json({ status: 'SUCCESS', data: { message: 'Query solved!' } });
});
