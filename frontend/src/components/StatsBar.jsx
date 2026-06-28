import React from 'react';

const StatsBar = ({ stats }) => {
  const completionRate =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="stats-bar">
      <div className="stat-card stat-total">
        <span className="stat-number">{stats.total}</span>
        <span className="stat-label">Total</span>
      </div>
      <div className="stat-card stat-todo">
        <span className="stat-number">{stats.todo}</span>
        <span className="stat-label">To Do</span>
      </div>
      <div className="stat-card stat-progress">
        <span className="stat-number">{stats.inProgress}</span>
        <span className="stat-label">In Progress</span>
      </div>
      <div className="stat-card stat-done">
        <span className="stat-number">{stats.completed}</span>
        <span className="stat-label">Completed</span>
      </div>
      <div className="stat-card stat-rate">
        <span className="stat-number">{completionRate}%</span>
        <span className="stat-label">Done Rate</span>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${completionRate}%` }} />
        </div>
      </div>
    </div>
  );
};

export default StatsBar;
