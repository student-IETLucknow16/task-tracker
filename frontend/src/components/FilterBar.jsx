import React from 'react';

const FilterBar = ({ filters, onChange, onClear, taskCount }) => {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = filters.status || filters.priority || filters.search;

  return (
    <div className="filter-bar">
      <div className="search-wrap">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="input search-input"
          placeholder="Search tasks..."
          value={filters.search || ''}
          onChange={(e) => handleChange('search', e.target.value)}
        />
        {filters.search && (
          <button className="search-clear" onClick={() => handleChange('search', '')} aria-label="Clear search">✕</button>
        )}
      </div>

      <select
        className="input select filter-select"
        value={filters.status || ''}
        onChange={(e) => handleChange('status', e.target.value)}
      >
        <option value="">All Status</option>
        <option value="todo">To Do</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>

      <select
        className="input select filter-select"
        value={filters.priority || ''}
        onChange={(e) => handleChange('priority', e.target.value)}
      >
        <option value="">All Priority</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      <select
        className="input select filter-select"
        value={filters.sort || '-createdAt'}
        onChange={(e) => handleChange('sort', e.target.value)}
      >
        <option value="-createdAt">Newest First</option>
        <option value="createdAt">Oldest First</option>
        <option value="-priority">High Priority First</option>
        <option value="dueDate">Due Date (Asc)</option>
        <option value="title">Title A–Z</option>
      </select>

      {hasActiveFilters && (
        <button className="btn btn-ghost btn-sm" onClick={onClear}>
          Clear Filters
        </button>
      )}

      <span className="task-count">{taskCount} task{taskCount !== 1 ? 's' : ''}</span>
    </div>
  );
};

export default FilterBar;
