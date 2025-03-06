import './App.css'
import React, { useState, useEffect } from 'react';
import ProjectAPI from './project';

function App() {
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({ nazwa: '', opis: '' });
  const [editingProjectId, setEditingProjectId] = useState(null);

  useEffect(() => {
    setProjects(ProjectAPI.getAll());
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingProjectId) {
      ProjectAPI.update({ id: editingProjectId, ...formData });
      setEditingProjectId(null);
    } else {
      ProjectAPI.create({ id: Date.now(), ...formData });
    }

    setFormData({ nazwa: '', opis: '' });
    setProjects(ProjectAPI.getAll());
  };

  const handleDelete = (id) => {
    ProjectAPI.delete(id);
    setProjects(ProjectAPI.getAll());
  };

  const handleEdit = (project) => {
    setEditingProjectId(project.id);
    setFormData({ nazwa: project.nazwa, opis: project.opis });
  };

  return (
    <div style={{ margin: '0%'}}>
      <h1>MANAGMe - Projekty</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <input
          type="text"
          placeholder="Nazwa projektu"
          value={formData.nazwa}
          onChange={(e) => setFormData({ ...formData, nazwa: e.target.value })}
          required
        />
        <textarea
          placeholder="Opis projektu"
          value={formData.opis}
          onChange={(e) => setFormData({ ...formData, opis: e.target.value })}
          required
        />
        <button type="submit">
          {editingProjectId ? 'Zaktualizuj' : 'Dodaj'}
        </button>
      </form>

      <ul>
  {projects.map((project) => (
    <li key={project.id}>
      <strong>{project.nazwa}</strong>
      <p>{project.opis}</p>
      <div className="button-group">
        <button className="edit" onClick={() => handleEdit(project)}>Edytuj</button>
        <button className="delete" onClick={() => handleDelete(project.id)}>Usuń</button>
      </div>
    </li>
  ))}
</ul>

    </div>
  );
}

export default App;
