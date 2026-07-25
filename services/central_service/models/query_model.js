const mongoose = require('mongoose');


const query_schema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user', 
  },
  
  solver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user', 
   },
  problemStatement: {
    type: String,
    required: [true, 'Problem statement is required'],
  },
  code: {
    type: String,
  },
  io: {
    type: String,
  },
  status: {
    type: String,
  },
  solution: {
    type: String,
  },
  points: {
    type: Number,
  },
  tag: {
    type: String,
    required: [true, 'Tag is required'],
  },
  title: {
    type: String,
  },
}, { timestamps: true });

const query = mongoose.model('query', query_schema);

module.exports = query;
