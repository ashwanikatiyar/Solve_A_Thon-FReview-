// src/controllers/visitorController.js
const Visitor = require('../models/visitor');
const otpGenerator = require('otp-generator');
const TemporaryVisitor = require('../models/temporary');
const twilio = require('twilio');
// const moment = require('moment');
const qrcode = require('qrcode');
const moment = require('moment-timezone');



const accountSid = process.env.TWILIO_ACCOUNT_SID || "AC0c9a69cc34d9bab73053055b97954beb";
const authToken = process.env.TWILIO_AUTH_TOKEN || "cdd785b17f0e87870cf9c320137fab89" ;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || "+13344234329";

// const client = twilio(accountSid, authToken);
const client = require('twilio')(accountSid, authToken);



exports.captureDetails = async (req, res) => {
  try {
    const { name, age ,email, phoneNumber, address, purposeOfVisit , VisitorCheckOutTime } = req.body;

    const visitorCheckoutTime = VisitorCheckOutTime
    const checkInTime = moment().tz('Asia/Kolkata');

    // Generate OTP for phone verification
    const phoneVerificationOTP = otpGenerator.generate(6, { upperCase: false, specialChars: false });

    // Save visitor details to temporary collection
    const temporaryVisitor = new TemporaryVisitor({
      name,
      age,
      email,
      phoneNumber,
      address,
      purposeOfVisit,
      VisitorCheckOutTime,
      checkInTime,
      phoneVerificationOTP
    });

    await temporaryVisitor.save();

    // Send OTP to the visitor's phone number via SMS
    client.messages.create({
      body: `Your OTP for phone number verification: ${phoneVerificationOTP}`,
      from: twilioPhoneNumber,
      to: phoneNumber
    });

    res.status(200).json({ message: 'OTP sent for phone number verification', otp: phoneVerificationOTP });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};




exports.saveDetails = async (req, res) => {
  try {
    const { name, age, email, phoneNumber, address, purposeOfVisit,VisitorCheckOutTime, otp } = req.body;


    const visitorCheckoutTime = VisitorCheckOutTime
    


    // Verify OTP
    const temporaryVisitor = await TemporaryVisitor.findOne({ phoneNumber, phoneVerificationOTP: otp });

    if (!temporaryVisitor) {
      return res.status(400).json({ message: 'Invalid OTP or phone number' });
    }



    // Calculate total time remaining
    
    const currentTime = moment().tz('Asia/Kolkata');
    const expectedCheckoutTime = moment().add(6, 'hours').tz('Asia/Kolkata')
    const totalTimeRemaining = expectedCheckoutTime.diff(currentTime, 'minutes');
    const remainingTime = expectedCheckoutTime.diff(currentTime, 'minutes');
    const remainingTimeInHours = Math.floor(remainingTime / 60);
    console.log('Expected checkout time:', expectedCheckoutTime);
    console.log('Current time:', currentTime);


    // Generate passcode
    const passcode = otpGenerator.generate(6, { upperCase: false, specialChars: false });

        // Generate QR code
        const qrCodeData = passcode; // You can include additional data if needed
        const qrCodeImage = await qrcode.toDataURL(qrCodeData)

    // Send message containing passcode and total time remaining
    const message = `Your 6-digit passcode: ${passcode}. Total time remaining: ${remainingTimeInHours}(${totalTimeRemaining} minutes). 
    Here is your Checkout QR ${qrCodeImage}
    Thank you for visiting!`;
    await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: phoneNumber
    });

    // Move visitor from temporary collection to verified visitors collection
    const visitor = new Visitor({

      name,
      email,
      age,
      phoneNumber,
      address,
      purposeOfVisit,
      VisitorCheckOutTime,
      isPhoneVerified: true,
      passcode
    });

    await visitor.save();

    // Remove visitor from temporary collection
    await TemporaryVisitor.deleteOne({ _id: temporaryVisitor._id });

    // res.status(201).json({ message: 'Visitor details saved successfully' });
    res.status(201).json({ message: 'Visitor details saved successfully', passcode, remainingTimeInHours , qrCode: qrCodeImage});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};





exports.updateCheckoutTime = async (req, res) => {
  try {
    const { phoneNumber, passcode } = req.body;

    // Check if the visitor exists and the passcode matches
    const visitor = await Visitor.findOne({ phoneNumber, passcode });
    if (!visitor) {
      return res.status(404).json({ message: 'Visitor not found or invalid credentials' });
    }

    // Update the checkout time for the visitor
    visitor.VisitorCheckOutTime = moment(); // Assuming the current time is the checkout time
    visitor.checkedOut = true; // Mark the visitor as checked out
    await visitor.save();

    // Include the checkout time in the visitor object
    const updatedVisitor = await Visitor.findById(visitor._id);

    // Send thank you SMS
    const message = `Thank you for visiting! We hope to see you again soon.`;
    await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: phoneNumber
    });

    res.status(200).json({ message: 'Visitor checkout time updated successfully', visitor: updatedVisitor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};






exports.getAllVisitors = async (req, res) => {
  try {
    // Fetch all visitor data from the database
    const visitors = await Visitor.find();
    
    // Send the visitor data as JSON response
    res.status(200).json(visitors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};




// Controller function for manual checkout of visitors by name
exports.manualCheckOut = async (req, res) => {
  try {
    const { name } = req.body;

    // Find the visitor by name and update the checkedOut field to true
    const updatedVisitor = await Visitor.findOneAndUpdate({ name }, { checkedOut: true }, { new: true });

    if (!updatedVisitor) {
      return res.status(404).json({ message: 'Visitor not found' });
    }


    // Send thank you SMS
    const message = `Thank you for visiting! We hope to see you again soon. You were Manually Checked-Out`;
    await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: updatedVisitor.phoneNumber
    });

    res.status(200).json({ message: 'Visitor checked out successfully', visitor: updatedVisitor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};