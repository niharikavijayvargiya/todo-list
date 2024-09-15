// routes/taskRoutes.js
const express = require('express');
const cron = require('node-cron');
const TaskLog = require('../models/TaskLog');

const router = express.Router();

// Route to list all tasks
router.get('/tasks', async (req, res) => {
  const tasks = await TaskLog.find();
  res.json(tasks);
});
// Route to add a new scheduled task
router.post('/tasks', (req, res) => {
  const { name, schedule } = req.body;

  // Schedule the task using node-cron
  cron.schedule(schedule, async () => {
    console.log(`Running scheduled task: ${name}`);
    
    // Log task execution
    const log = new TaskLog({
      taskName: name,
      status: 'Success',
      schedule, // Include the schedule in the log
    });
    await log.save();
  });

  res.status(201).json({ message: 'Task scheduled successfully!' });
});


module.exports = router;
