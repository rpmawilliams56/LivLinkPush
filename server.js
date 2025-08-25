require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const claimRoute = require('./routes/api/claim');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files if needed (css/js)
// app.use(express.static(path.join(__dirname, 'views')));

// Serve claim.html on /claim
app.get('/claim', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'claim.html'));
});

// API route for claim
app.use('/api/claim', claimRoute);

// Health check
app.get('/', (req, res) => {
  res.send('API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
