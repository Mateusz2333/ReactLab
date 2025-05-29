const API_URL = 'http://localhost:3001/api/tasks';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

const TaskAPI = {
  getAll: async () => {
    const res = await fetch(API_URL, { headers: getHeaders() });
    return res.json();
  },

  getById: async (id) => {
    const res = await fetch(`${API_URL}/${id}`, { headers: getHeaders() });
    return res.json();
  },

  create: async (task) => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(task)
    });
    return res.json();
  },

  update: async (task) => {
    const res = await fetch(`${API_URL}/${task._id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(task)
    });
    return res.json();
  },

   delete: async (id) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Delete failed: ${err}`);
    }
  }
};

export default TaskAPI;
