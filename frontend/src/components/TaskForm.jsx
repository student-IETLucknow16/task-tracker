import React, { useState, useEffect } from 'react';

const INITIAL_FORM = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  dueDate: '',
  tags: ''
};

const ERRORS_INIT = {};

const validate = (form) => {
  const errs = {};
  if (!form.title.trim()) errs.title = 'Title is required';
  else if (form.title.trim().length < 3) errs.title = 'Title must be at least 3 characters';
  else if (form.title.trim().length > 100) errs.title = 'Title cannot exceed 100 characters';

  if (form.description.length > 500) errs.description = 'Description cannot exceed 500 characters';

  if (form.dueDate) {
    const due = new Date(form.dueDate);
    if (isNaN(due.getTime())) errs.dueDate = 'Invalid date';
  }
  return errs;
};

const TaskForm = ({ task, onSubmit, onClose, loading }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState(ERRORS_INIT);
  const [touched, setTouched] = useState({});

  const isEdit = Boolean(task);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
        tags: Array.isArray(task.tags) ? task.tags.join(', ') : ''
      });
    } else {
      setForm(INITIAL_FORM);
    }
    setErrors({});
    setTouched({});
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const errs = validate({ ...form, [name]: value });
      setErrors((prev) => ({ ...prev, [name]: errs[name] }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errs = validate(form);
    setErrors((prev) => ({ ...prev, [name]: errs[name] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = Object.keys(form).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);

    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate || null,
      tags: form.tags
        ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : []
    };

    await onSubmit(payload);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Task' : 'New Task'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Title */}
          <div className="field">
            <label className="label" htmlFor="title">
              Title <span className="required">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              className={`input ${errors.title && touched.title ? 'input-error' : ''}`}
              placeholder="What needs to be done?"
              value={form.title}
              onChange={handleChange}
              onBlur={handleBlur}
              maxLength={100}
              autoFocus
            />
            {errors.title && touched.title && (
              <span className="error-msg">{errors.title}</span>
            )}
            <span className="char-count">{form.title.length}/100</span>
          </div>

          {/* Description */}
          <div className="field">
            <label className="label" htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              className={`input textarea ${errors.description && touched.description ? 'input-error' : ''}`}
              placeholder="Add more details (optional)..."
              value={form.description}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={3}
              maxLength={500}
            />
            {errors.description && touched.description && (
              <span className="error-msg">{errors.description}</span>
            )}
            <span className="char-count">{form.description.length}/500</span>
          </div>

          {/* Status & Priority row */}
          <div className="field-row">
            <div className="field">
              <label className="label" htmlFor="status">Status</label>
              <select id="status" name="status" className="input select" value={form.status} onChange={handleChange}>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="field">
              <label className="label" htmlFor="priority">Priority</label>
              <select id="priority" name="priority" className="input select" value={form.priority} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div className="field">
            <label className="label" htmlFor="dueDate">Due Date</label>
            <input
              id="dueDate"
              name="dueDate"
              type="date"
              className={`input ${errors.dueDate && touched.dueDate ? 'input-error' : ''}`}
              value={form.dueDate}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.dueDate && touched.dueDate && (
              <span className="error-msg">{errors.dueDate}</span>
            )}
          </div>

          {/* Tags */}
          <div className="field">
            <label className="label" htmlFor="tags">Tags</label>
            <input
              id="tags"
              name="tags"
              type="text"
              className="input"
              placeholder="design, backend, urgent (comma-separated)"
              value={form.tags}
              onChange={handleChange}
            />
            <span className="hint">Separate multiple tags with commas</span>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner-sm" />
                  {isEdit ? 'Saving...' : 'Creating...'}
                </span>
              ) : (
                isEdit ? 'Save Changes' : 'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
