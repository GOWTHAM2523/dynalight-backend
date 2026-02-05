const Task = require('../models/Task');

// @desc    Get tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  const { status, priority } = req.query;
  const query = { user: req.user.id, isDeleted: false };

  if (status) {
    query.status = status;
  }
  if (priority) {
    query.priority = priority;
  }

  const tasks = await Task.find(query).sort({ createdAt: -1 });

  res.status(200).json(tasks);
};

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  const { title, description, priority, status } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Please add a title' });
  }

  const task = await Task.create({
    user: req.user.id,
    title,
    description,
    priority,
    status,
  });

  res.status(201).json(task);
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  // Check for user
  if (!req.user) {
    return res.status(401).json({ message: 'User not found' });
  }

  // Make sure the logged in user matches the task user
  if (task.user.toString() !== req.user.id) {
    return res.status(401).json({ message: 'User not authorized' });
  }

  if (task.isDeleted) {
     return res.status(404).json({ message: 'Task not found (deleted)' });
  }

  const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json(updatedTask);
};

// @desc    Delete task (soft)
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  // Check for user
  if (!req.user) {
    return res.status(401).json({ message: 'User not found' });
  }

  // Make sure the logged in user matches the task user
  if (task.user.toString() !== req.user.id) {
    return res.status(401).json({ message: 'User not authorized' });
  }

  task.isDeleted = true;
  await task.save();

  res.status(200).json({ id: req.params.id });
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};
