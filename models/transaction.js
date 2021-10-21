const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Defining a mongoose model for the transactions.
const transactionSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: 'Enter a name for transaction',
  },
  value: {
    type: Number,
    required: 'Enter an amount',
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Assign the model to a variable and extract it.
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
