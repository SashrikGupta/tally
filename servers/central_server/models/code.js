const mongoose = require('mongoose');

// Define the schema for the code
const codeSchema = new mongoose.Schema(
  {
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'problem', // Reference to the Problem model
      required: [true, 'A code must be associated with a problem']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user', // Reference to the User model
      required: [true, 'A code must be associated with a user']
    },
    code: {
      type: String,
      required: [true, 'A code must be provided'],
      trim: true
    },
    solve: {
      type: Boolean,
      required: [true, 'Solve status must be provided']
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt timestamps
  }
);


const code = mongoose.model('code', codeSchema);
module.exports = code;
