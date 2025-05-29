const API_URL = 'http://localhost:3001/api/stories';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

const StoryAPI = {
  getAll: async () => {
    const res = await fetch(API_URL, { headers: getHeaders() });
    return res.json();
  },

  getById: async (id) => {
    const res = await fetch(`${API_URL}/${id}`, { headers: getHeaders() });
    return res.json();
  },

  create: async (story) => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(story)
    });
    return res.json();
  },

  update: async (story) => {
    const res = await fetch(`${API_URL}/${story._id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(story)
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

export default StoryAPI;
