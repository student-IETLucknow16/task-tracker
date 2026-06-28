import { useState, useCallback } from 'react';
import { taskAPI } from '../api/taskAPI';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, todo: 0, inProgress: 0, completed: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = () => setError(null);

  const fetchTasks = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await taskAPI.getAll(filters);
      setTasks(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await taskAPI.getStats();
      setStats(res.data);
    } catch (err) {
      console.error('Stats fetch failed:', err.message);
    }
  }, []);

  const createTask = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await taskAPI.create(data);
      setTasks((prev) => [res.data, ...prev]);
      await fetchStats();
      return { success: true, data: res.data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [fetchStats]);

  const updateTask = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await taskAPI.update(id, data);
      setTasks((prev) => prev.map((t) => (t._id === id ? res.data : t)));
      await fetchStats();
      return { success: true, data: res.data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [fetchStats]);

  const updateStatus = useCallback(async (id, status) => {
    try {
      const res = await taskAPI.updateStatus(id, status);
      setTasks((prev) => prev.map((t) => (t._id === id ? res.data : t)));
      await fetchStats();
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [fetchStats]);

  const deleteTask = useCallback(async (id) => {
    setError(null);
    try {
      await taskAPI.delete(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      await fetchStats();
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [fetchStats]);

  const deleteCompleted = useCallback(async () => {
    setError(null);
    try {
      await taskAPI.deleteCompleted();
      setTasks((prev) => prev.filter((t) => t.status !== 'completed'));
      await fetchStats();
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [fetchStats]);

  return {
    tasks,
    stats,
    loading,
    error,
    clearError,
    fetchTasks,
    fetchStats,
    createTask,
    updateTask,
    updateStatus,
    deleteTask,
    deleteCompleted
  };
};
