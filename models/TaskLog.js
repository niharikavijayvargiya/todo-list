// models/TaskLog.js
const mongoose = require('mongoose');

const TaskLogSchema = new mongoose.Schema({
  taskName: String,
  status: String,
  schedule: String, // Add schedule field here
  runAt: {
    type: Date,
    default: Date.now,
  },
});

const TaskLog = mongoose.model('TaskLog', TaskLogSchema);
module.exports = TaskLog;
