import React, { useState } from 'react';

const PRIORITY_META = {
  high: { label: 'High', className: 'priority-high', icon: '↑↑' },
  medium: { label: 'Medium', className: 'priority-medium', icon: '→' },
  low: { label: 'Low', className: 'priority-low', icon: '↓' }
};

const STATUS_META = {
  'todo': { label: 'To Do', className: 'status-todo', next: 'in-progress', nextLabel: 'Start' },
  'in-progress': { label: 'In Progress', className: 'status-progress', next: 'completed', nextLabel: 'Complete' },
  'completed': { label: 'Done', className: 'status-done', next: 'todo', nextLabel: 'Reopen' }
};

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'completed') return false;
  return new Date() > new Date(dueDate);
};

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const [statusChanging, setStatusChanging] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const priorityMeta = PRIORITY_META[task.priority] || PRIORITY_META.medium;
  const statusMeta = STATUS_META[task.status] || STATUS_META.todo;
  const overdue = isOverdue(task.dueDate, task.status);

  const handleStatusChange = async () => {
    setStatusChanging(true);
    await onStatusChange(task._id, statusMeta.next);
    setStatusChanging(false);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    await onDelete(task._id);
    // No need to setDeleting(false) — component unmounts
  };

  return (
    <div className={`task-card ${task.status === 'completed' ? 'task-completed' : ''} ${deleting ? 'task-deleting' : ''}`}>
      {/* Card Header */}
      <div className="task-card-header">
        <span className={`status-badge ${statusMeta.className}`}>{statusMeta.label}</span>
        <span className={`priority-badge ${priorityMeta.className}`}>
          <span>{priorityMeta.icon}</span> {priorityMeta.label}
        </span>
      </div>

      {/* Title */}
      <h3 className={`task-title ${task.status === 'completed' ? 'task-title-done' : ''}`}>
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p className="task-desc">{task.description}</p>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="task-tags">
          {task.tags.map((tag, i) => (
            <span key={i} className="tag">{tag}</span>
          ))}
        </div>
      )}

      {/* Meta: Due date + Created */}
      <div className="task-meta">
        {task.dueDate && (
          <span className={`due-date ${overdue ? 'overdue' : ''}`}>
            {overdue ? '⚠ ' : '📅 '}Due {formatDate(task.dueDate)}
          </span>
        )}
        <span className="created-at">
          Created {formatDate(task.createdAt)}
        </span>
      </div>

      {/* Actions */}
      <div className="task-actions">
        <button
          className="btn-action btn-advance"
          onClick={handleStatusChange}
          disabled={statusChanging}
          title={`Move to ${statusMeta.nextLabel}`}
        >
          {statusChanging ? '...' : statusMeta.nextLabel}
        </button>
        <div className="task-actions-right">
          <button className="btn-action btn-edit" onClick={() => onEdit(task)} title="Edit task">
            ✏
          </button>
          <button className="btn-action btn-delete" onClick={handleDelete} disabled={deleting} title="Delete task">
            {deleting ? '...' : '🗑'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
