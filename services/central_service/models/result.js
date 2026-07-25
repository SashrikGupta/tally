const mongoose = require('mongoose');
const resultSchema = new mongoose.Schema(
  {
    contest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'contest', 
      required: [true, 'A result must be associated with a contest']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: [true, 'A result must be associated with a user']
    },
    points: {
      type: Number,
      required: [true, 'A result must have points'],
      default: 0
    }
  },
  {
    timestamps: true 
  }
);

const result = mongoose.model('result', resultSchema);
module.exports = result;
