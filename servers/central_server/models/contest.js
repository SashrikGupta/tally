const mongoose = require('mongoose');

// Define the schema for the contest
const contestSchema = new mongoose.Schema(
  {
    problems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'problem', // Reference to the Problem model
        required: [true, 'A contest must have at least one problem']
      }
    ],
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', // Reference to the User model
        required: [true, 'A contest must have participants']
      }
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user', // Reference to a single User as the author
      required: [true, 'A contest must have an author']
    },
    start: {
      type: Date,
      required: [true, 'A contest must have a start time']
    },
    end: {
      type: Date,
      required: [true, 'A contest must have an end time']
    },
    name: {
      type: String,
      required: [true, 'A contest must have a name'],
      trim: true
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt timestamps
  }
);

// Define the model for the contest schema
const contest = mongoose.model('contest', contestSchema);

module.exports = contest;
