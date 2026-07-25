const mongoose = require('mongoose');

// Define the schema for the problem
const problemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A problem must have a name'],
      trim: true
    },
    tag: {
      type: String,
      required: [true, 'A problem must have a tag'],
      trim: true
    },
    difficulty: {
      type: String,
      required: [true, 'A problem must have a difficulty level'],
      trim: true
    },
    desc: {
      type: String,
      required: [true, 'A problem must have a description'],
      trim: true
    },
    testcase_input: {
      type: [String], // Array of strings for multiple test case inputs
      default: []
    },
    testcase_output: {
      type: [String], // Array of strings for multiple test case outputs
      default: []
    },
    points: {
      type: Number,
      required: [true, 'A problem must have points'],
      default: 0
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt timestamps
  }
);

// Define the model for the problem schema
const problem = mongoose.model('problem', problemSchema);

module.exports = problem;
