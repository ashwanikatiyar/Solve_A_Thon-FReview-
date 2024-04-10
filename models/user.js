const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,  // Ensure the password field is defined
    required: true
  }
  // Add other fields as per your requirements
});

const User = mongoose.model('User', userSchema);

module.exports = User;