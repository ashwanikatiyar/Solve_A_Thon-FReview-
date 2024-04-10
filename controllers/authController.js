// src/controllers/authController.js

const User = require('../models/user');

const dotenv = require('dotenv');
const fs = require('fs');



dotenv.config();

exports.signup = async (req, res) => {
    try {
      const { name, email, password } = req.body;
  
      // Check if the user already exists
      const existingUser = await User.findOne({ name });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      // Create a new user
      const newUser = new User({
        name,
        email,
        password
      });
  
      // Save the user to the database
      await newUser.save();
  
      res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  

  
  exports.login = async (req, res) => {
    try {
      const { email ,password } = req.body;
  
      // Find the user by name
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Perform simple string comparison for password validation
      if (user.password !== password) {
        return res.status(401).json({ message: 'Invalid password' });
      }
  
      // Authentication successful
      res.status(200).json({ message: 'Login successful' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
