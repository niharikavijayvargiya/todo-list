const express = require('express');
const mongoose = require('mongoose');
const cron = require('node-cron');
const sendMail = require('./mailer');
const TaskLog = require('./models/TaskLog');
require('dotenv').config();
const cors = require('cors');

const app = express();

// Use CORS middleware before defining routes
app.use(cors({
  origin: 'http://127.0.0.1:5500'  // Allow only this origin
}));

// Middleware to parse JSON
app.use(express.json());

// Connect to the database
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Route to get all tasks
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await TaskLog.find();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

// Route to create a new task
app.post('/tasks', async (req, res) => {
  const { taskName, minutes } = req.body;

  const schedule = `*/${minutes} * * * *`; // Cron schedule format

  const log = new TaskLog({
    taskName: taskName,
    status: 'Pending',
    runAt: new Date(Date.now() + minutes * 60000)  // Schedule time
  });
  await log.save();

  cron.schedule(schedule, async () => {
    console.log(`Running scheduled task: ${taskName}`);

    sendMail('niharikajivijay@gmail.com', 'Reminder', `This is a scheduled reminder email for task: ${taskName}`);
    
    // Update the task status
    await TaskLog.findByIdAndUpdate(log._id, { status: 'Success', runAt: new Date() });
  });

  res.status(201).json({ message: 'Task scheduled successfully' });
});

// Route to delete a specific task
app.delete('/tasks/:id', async (req, res) => {
  try {
    await TaskLog.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task' });
  }
});

// Route to clear all tasks
app.delete('/tasks', async (req, res) => {
  try {
    await TaskLog.deleteMany({});
    res.status(200).json({ message: 'All tasks cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing tasks' });
  }
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
