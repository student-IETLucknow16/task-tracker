const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// Helper: build filter from query params
const buildFilter = (query) => {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;
  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: 'i' } },
      { description: { $regex: query.search, $options: 'i' } }
    ];
  }
  return filter;
};

// GET /api/tasks — Get all tasks with optional filtering & sorting
router.get('/', async (req, res) => {
  try {
    const { sort = '-createdAt', page = 1, limit = 50 } = req.query;
    const filter = buildFilter(req.query);

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Task.countDocuments(filter);
    const tasks = await Task.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: tasks.length,
      total,
      page: parseInt(page),
      data: tasks
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/tasks/stats — Aggregate stats
router.get('/stats', async (req, res) => {
  try {
    const [stats] = await Task.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          todo: { $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
          medium: { $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] } },
          low: { $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] } }
        }
      }
    ]);

    res.json({
      success: true,
      data: stats || { total: 0, todo: 0, inProgress: 0, completed: 0, high: 0, medium: 0, low: 0 }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/tasks/:id — Get single task
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: task });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid task ID' });
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/tasks — Create a new task
router.post('/', async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, tags } = req.body;

    const task = new Task({ title, description, status, priority, dueDate, tags });
    const saved = await task.save();

    res.status(201).json({ success: true, data: saved, message: 'Task created successfully' });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/tasks/:id — Full update
router.put('/:id', async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, tags } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, status, priority, dueDate, tags },
      { new: true, runValidators: true }
    );

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: task, message: 'Task updated successfully' });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }
    if (err.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid task ID' });
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/tasks/:id/status — Quick status toggle
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['todo', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const task = await Task.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    res.json({ success: true, data: task, message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/tasks/:id — Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid task ID' });
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/tasks — Delete all completed tasks
router.delete('/', async (req, res) => {
  try {
    const { status } = req.query;
    if (status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only bulk-delete completed tasks' });
    }
    const result = await Task.deleteMany({ status: 'completed' });
    res.json({ success: true, message: `Deleted ${result.deletedCount} completed tasks` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
