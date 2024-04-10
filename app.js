// src/app.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const visitorRoutes = require('./routes/visitorRoutes');
const cors = require('cors')

dotenv.config();
const app = express();


app.use(cors());


const fs = require('fs');


// Middleware
app.use(bodyParser.json());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/Solve_A_Thon", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB:', err.message);
  process.exit(1); // Exit the process if failed to connect
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/visitors', visitorRoutes);



app.get('/data', (req, res) => {
  // Read and parse the JSON file
  const jsonData = JSON.parse(fs.readFileSync('/Users/ashwanikatiyar/Documents/VS code/Solve-A-Thon/package.json', 'utf8'));


  // Send the JSON data as the response
  res.json(jsonData);
});

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
