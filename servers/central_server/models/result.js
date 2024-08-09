const mongoose = require('mongoose');

// Define the schema for the result
const resultSchema = new mongoose.Schema(
  {
    contest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'contest', // Reference to the Contest model
      required: [true, 'A result must be associated with a contest']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user', // Reference to the User model
      required: [true, 'A result must be associated with a user']
    },
    status: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'code', // Reference to the Code model for status
        required: [true, 'A result must include at least one status']
      }
    ],
    points: {
      type: Number,
      required: [true, 'A result must have points'],
      default: 0
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt timestamps
  }
);

// Define the model for the result schema
const result = mongoose.model('result', resultSchema);
module.exports = result;
