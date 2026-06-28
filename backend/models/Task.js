const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: ''
    },
    status: {
      type: String,
      enum: {
        values: ['todo', 'in-progress', 'completed'],
        message: 'Status must be one of: todo, in-progress, completed'
      },
      default: 'todo'
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: 'Priority must be one of: low, medium, high'
      },
      default: 'medium'
    },
    dueDate: {
      type: Date,
      default: null
    },
    tags: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for faster queries
taskSchema.index({ status: 1, priority: 1 });
taskSchema.index({ createdAt: -1 });

// Virtual for overdue check
taskSchema.virtual('isOverdue').get(function () {
  if (!this.dueDate || this.status === 'completed') return false;
  return new Date() > new Date(this.dueDate);
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
