// src/models/visitor.js
const mongoose = require('mongoose');
const moment = require('moment-timezone');

const visitorSchema = new mongoose.Schema({
    
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
  age :{
    type : Number,
    required : true
  },
  address: {
    type: String,
    required: true
  },
  purposeOfVisit: {
    type: String,
    required: true
  },
  checkInTime: {
    type: Date,
    default: moment().tz('Asia/Kolkata')
  },
  expectedCheckoutTime: {
    type: Date,
    default: function() {
      const checkoutTime = new Date(this.checkInTime);
      checkoutTime.setHours(checkoutTime.getHours() + 6); // Set checkout time 6 hours after check-in
      return checkoutTime;
    }
  },

  VisitorCheckOutTime: {
    type : Date , 
    required : true
  },


  phoneVerificationOTP: {
    type: String
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },

  passcode: {
    type: String
  },
   // Add a field to track if visitor has checked out
   checkedOut: {
    type: Boolean,
    default: false
  }
  
});

const Visitor = mongoose.model('Visitor', visitorSchema);

module.exports = Visitor;
