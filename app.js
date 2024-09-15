const express = require('express');
const mongoose = require('mongoose');
const cron = require('node-cron');
const sendMail = require('./mailer');
const TaskLog = require('./models/TaskLog');
require('dotenv').config();
const taskRoutes = require('./routes/taskRoutes');
const cors = require('cors');

const app = express();

// Use CORS middleware before defining routes
app.use(cors({
  origin: 'http://127.0.0.1:5500'  // Allow only this origin
}));

// Middleware to parse JSON
app.use(express.json());

// Define routes
app.use('/', taskRoutes);

// Connect to the database
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Set up a cron job to send reminder emails every minute
cron.schedule('*/1 * * * *', async () => {
  console.log('Running scheduled task: Send email');
  
  sendMail('niharikajivijay@gmail.com', 'Reminder', 'This is a scheduled reminder email.');
  
  // Log the task execution
  const log = new TaskLog({
    taskName: 'Send reminder email',
    status: 'Success',
  });
  await log.save();
});

// Basic route
app.get('/', (req, res) => {
  res.send('Task Scheduler is running!');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
