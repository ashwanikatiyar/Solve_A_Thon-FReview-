// src/models/temporaryVisitor.js
const mongoose = require('mongoose');

const temporaryVisitorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  purposeOfVisit: {
    type: String,
    required: true
  },
  phoneVerificationOTP: {
    type: String
  }
});

const TemporaryVisitor = mongoose.model('TemporaryVisitor', temporaryVisitorSchema);

module.exports = TemporaryVisitor;
