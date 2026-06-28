import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTasks } from './hooks/useTasks';
import TaskForm from './components/TaskForm';
import TaskCard from './components/TaskCard';
import StatsBar from './components/StatsBar';
import FilterBar from './components/FilterBar';
import Toast from './components/Toast';
import './App.css';

const DEFAULT_FILTERS = { status: '', priority: '', search: '', sort: '-createdAt' };

function App() {
  const {
    tasks, stats, loading, error, clearError,
    fetchTasks, fetchStats,
    createTask, updateTask, updateStatus,
    deleteTask, deleteCompleted
  } = useTasks();

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [toast, setToast] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking'); // checking | ok | error
  const searchDebounce = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  };

  // Initial load
  useEffect(() => {
    checkAPI();
  }, []);

  const checkAPI = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/health');
      if (res.ok) {
        setApiStatus('ok');
        fetchTasks();
        fetchStats();
      } else {
        setApiStatus('error');
      }
    } catch {
      setApiStatus('error');
    }
  };

  // Re-fetch when filters change (debounce search)
  useEffect(() => {
    if (apiStatus !== 'ok') return;
    clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      fetchTasks(cleanFilters);
    }, filters.search ? 350 : 0);
    return () => clearTimeout(searchDebounce.current);
  }, [filters, apiStatus, fetchTasks]);

  const handleCreateSubmit = async (data) => {
    const result = await createTask(data);
    if (result.success) {
      setShowForm(false);
      showToast('Task created successfully!');
    } else {
      showToast(result.error, 'error');
    }
  };

  const handleEditSubmit = async (data) => {
    const result = await updateTask(editingTask._id, data);
    if (result.success) {
      setEditingTask(null);
      showToast('Task updated!');
    } else {
      showToast(result.error, 'error');
    }
  };

  const handleStatusChange = async (id, status) => {
    const result = await updateStatus(id, status);
    if (result.success) {
      const labels = { 'todo': 'To Do', 'in-progress': 'In Progress', 'completed': 'Done' };
      showToast(`Moved to ${labels[status]}`);
    } else {
      showToast(result.error, 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await deleteTask(id);
    if (result.success) showToast('Task deleted');
    else showToast(result.error, 'error');
  };

  const handleDeleteCompleted = async () => {
    if (!window.confirm('Delete all completed tasks? This cannot be undone.')) return;
    const result = await deleteCompleted();
    if (result.success) showToast('Completed tasks cleared');
    else showToast(result.error, 'error');
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setShowForm(false);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const clearFilters = () => setFilters(DEFAULT_FILTERS);

  // Group tasks by status for kanban-style display
  const grouped = {
    todo: tasks.filter((t) => t.status === 'todo'),
    'in-progress': tasks.filter((t) => t.status === 'in-progress'),
    completed: tasks.filter((t) => t.status === 'completed')
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-inner">
          <div className="header-brand">
            <span className="brand-icon">⚡</span>
            <div>
              <h1 className="brand-name">TaskFlow</h1>
              <p className="brand-sub">MERN Stack Task Tracker</p>
            </div>
          </div>
          <div className="header-actions">
            {stats.completed > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={handleDeleteCompleted}>
                Clear Done ({stats.completed})
              </button>
            )}
            <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditingTask(null); }}>
              + New Task
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {/* API Status Banner */}
        {apiStatus === 'checking' && (
          <div className="api-banner api-checking">
            <span className="spinner" /> Connecting to backend...
          </div>
        )}
        {apiStatus === 'error' && (
          <div className="api-banner api-error">
            <strong>⚠ Backend Offline</strong> — Start your Express server on port 5000.
            <br />
            <code>cd backend && npm install && npm start</code>
            <button className="btn btn-ghost btn-sm" style={{ marginLeft: '1rem' }} onClick={checkAPI}>
              Retry
            </button>
          </div>
        )}

        {apiStatus === 'ok' && (
          <>
            {/* Stats */}
            <StatsBar stats={stats} />

            {/* Filters */}
            <FilterBar
              filters={filters}
              onChange={setFilters}
              onClear={clearFilters}
              taskCount={tasks.length}
            />

            {/* Error */}
            {error && (
              <div className="error-banner">
                {error}
                <button onClick={clearError} className="error-dismiss">✕</button>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="loading-bar">
                <div className="loading-fill" />
              </div>
            )}

            {/* Task Board */}
            {tasks.length === 0 && !loading ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>No tasks found</h3>
                <p>
                  {Object.values(filters).some(Boolean)
                    ? 'Try adjusting your filters or search terms.'
                    : 'Create your first task to get started!'}
                </p>
                {!Object.values(filters).some(Boolean) && (
                  <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                    + Create Task
                  </button>
                )}
              </div>
            ) : (
              <div className="task-board">
                {/* To Do column */}
                <div className="task-column">
                  <div className="column-header column-todo">
                    <span className="column-dot" />
                    <h3>To Do</h3>
                    <span className="column-count">{grouped.todo.length}</span>
                  </div>
                  <div className="column-body">
                    {grouped.todo.length === 0 ? (
                      <div className="column-empty">No tasks here</div>
                    ) : (
                      grouped.todo.map((task) => (
                        <TaskCard
                          key={task._id}
                          task={task}
                          onEdit={openEdit}
                          onDelete={handleDelete}
                          onStatusChange={handleStatusChange}
                        />
                      ))
                    )}
                  </div>
                </div>

                {/* In Progress column */}
                <div className="task-column">
                  <div className="column-header column-progress">
                    <span className="column-dot" />
                    <h3>In Progress</h3>
                    <span className="column-count">{grouped['in-progress'].length}</span>
                  </div>
                  <div className="column-body">
                    {grouped['in-progress'].length === 0 ? (
                      <div className="column-empty">No tasks here</div>
                    ) : (
                      grouped['in-progress'].map((task) => (
                        <TaskCard
                          key={task._id}
                          task={task}
                          onEdit={openEdit}
                          onDelete={handleDelete}
                          onStatusChange={handleStatusChange}
                        />
                      ))
                    )}
                  </div>
                </div>

                {/* Completed column */}
                <div className="task-column">
                  <div className="column-header column-done">
                    <span className="column-dot" />
                    <h3>Completed</h3>
                    <span className="column-count">{grouped.completed.length}</span>
                  </div>
                  <div className="column-body">
                    {grouped.completed.length === 0 ? (
                      <div className="column-empty">No tasks here</div>
                    ) : (
                      grouped.completed.map((task) => (
                        <TaskCard
                          key={task._id}
                          task={task}
                          onEdit={openEdit}
                          onDelete={handleDelete}
                          onStatusChange={handleStatusChange}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      {(showForm || editingTask) && (
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? handleEditSubmit : handleCreateSubmit}
          onClose={closeForm}
          loading={loading}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <footer className="app-footer">
        Built with React · Express · MongoDB &nbsp;|&nbsp; MERN Stack Demo
      </footer>
    </div>
  );
}

export default App;
