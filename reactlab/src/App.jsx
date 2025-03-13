import './App.css'
import React, { useState, useEffect } from 'react';
import ProjectAPI from './project';
import StoryAPI from './story';
import ActiveProject from './activeProject';
import User from './user';

function App() {
  
  const [projects, setProjects] = useState([]);
  const [projectForm, setProjectForm] = useState({ nazwa: '', opis: '' });
  const [editingProjectId, setEditingProjectId] = useState(null);

  
  const [activeProject, setActiveProject] = useState(null);

  
  const [stories, setStories] = useState([]);
  const [storyForm, setStoryForm] = useState({
    nazwa: '',
    opis: '',
    priorytet: 'niski'
  });
  const [editingStoryId, setEditingStoryId] = useState(null);

  
  const [storyFilter, setStoryFilter] = useState("all");

  
  useEffect(() => {
    const allProjects = ProjectAPI.getAll();
    setProjects(allProjects);
    const ap = ActiveProject.get();
    setActiveProject(ap);
    if (ap) loadStories(ap);
  }, []);

  
  const handleProjectSubmit = (e) => {
    e.preventDefault();
    if (editingProjectId) {
      ProjectAPI.update({ id: editingProjectId, ...projectForm });
      setEditingProjectId(null);
    } else {
      ProjectAPI.create({ id: Date.now(), ...projectForm });
    }
    setProjectForm({ nazwa: '', opis: '' });
    setProjects(ProjectAPI.getAll());
  };

  const handleProjectDelete = (id) => {
    ProjectAPI.delete(id);
    setProjects(ProjectAPI.getAll());
  };

  const handleProjectEdit = (project) => {
    setEditingProjectId(project.id);
    setProjectForm({ nazwa: project.nazwa, opis: project.opis });
  };

  const handleActiveProjectChange = (e) => {
    const projectId = parseInt(e.target.value);
    const selectedProject = projects.find((p) => p.id === projectId);
    setActiveProject(selectedProject);
    ActiveProject.set(selectedProject);
    loadStories(selectedProject);
  };

  
  const loadStories = (project) => {
    if (project) {
      const allStories = StoryAPI.getAll();
      const filtered = allStories.filter((s) => s.projekt === project.id);
      setStories(filtered);
    } else {
      setStories([]);
    }
  };

  const handleStorySubmit = (e) => {
    e.preventDefault();
    if (!activeProject) return;
    const newStory = {
      id: Date.now(),
      nazwa: storyForm.nazwa,
      opis: storyForm.opis,
      priorytet: storyForm.priorytet,
      projekt: activeProject.id,
      dataUtworzenia: new Date().toISOString(),
      stan: 'todo',
      wlasciciel: User.id
    };
    StoryAPI.create(newStory);
    loadStories(activeProject);
    setStoryForm({ nazwa: '', opis: '', priorytet: 'niski' });
  };

  const handleStoryDelete = (id) => {
    StoryAPI.delete(id);
    loadStories(activeProject);
  };

  const handleStoryEdit = (story) => {
    setEditingStoryId(story.id);
    setStoryForm({
      nazwa: story.nazwa,
      opis: story.opis,
      priorytet: story.priorytet
    });
  };

  const handleStoryUpdate = (e) => {
    e.preventDefault();
    if (!activeProject) return;
    const updatedStory = {
      id: editingStoryId,
      nazwa: storyForm.nazwa,
      opis: storyForm.opis,
      priorytet: storyForm.priorytet,
      projekt: activeProject.id,
      dataUtworzenia: new Date().toISOString(), 
      stan: 'todo',
      wlasciciel: User.id
    };
    StoryAPI.update(updatedStory);
    setEditingStoryId(null);
    setStoryForm({ nazwa: '', opis: '', priorytet: 'niski' });
    loadStories(activeProject);
  };

  
  const handleStoryStateChange = (story, newState) => {
    const updatedStory = { ...story, stan: newState };
    StoryAPI.update(updatedStory);
    loadStories(activeProject);
  };

  
  const filteredStories =
    storyFilter === "all" ? stories : stories.filter((s) => s.stan === storyFilter);

  
  const todoStories = stories.filter((s) => s.stan === 'todo');
  const doingStories = stories.filter((s) => s.stan === 'doing');
  const doneStories = stories.filter((s) => s.stan === 'done');

  return (
    <div style={{ padding: '2rem' }}>
      <h1>MANAGMe</h1>
      <p>
        Zalogowany użytkownik: {User.imie} {User.nazwisko}
      </p>

      
      <section>
        <h2>Projekty</h2>
        <form onSubmit={handleProjectSubmit}>
          <input
            type="text"
            placeholder="Nazwa projektu"
            value={projectForm.nazwa}
            onChange={(e) =>
              setProjectForm({ ...projectForm, nazwa: e.target.value })
            }
            required
          />
          <textarea
            placeholder="Opis projektu"
            value={projectForm.opis}
            onChange={(e) =>
              setProjectForm({ ...projectForm, opis: e.target.value })
            }
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
                <button className="edit" onClick={() => handleProjectEdit(project)}>
                  Edytuj
                </button>
                <button className="delete" onClick={() => handleProjectDelete(project.id)}>
                  Usuń
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      
      <section style={{ marginTop: '2rem' }}>
        <h2>Wybierz aktywny projekt</h2>
        <select value={activeProject ? activeProject.id : ''} onChange={handleActiveProjectChange}>
          <option value="" disabled>
            -- wybierz projekt --
          </option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.nazwa}
            </option>
          ))}
        </select>
      </section>

      
      {activeProject && (
        <section style={{ marginTop: '2rem' }}>
          <h2>
            Historyjki dla projektu: <em>{activeProject.nazwa}</em>
          </h2>
          <form onSubmit={editingStoryId ? handleStoryUpdate : handleStorySubmit}>
            <input
              type="text"
              placeholder="Nazwa historyjki"
              value={storyForm.nazwa}
              onChange={(e) =>
                setStoryForm({ ...storyForm, nazwa: e.target.value })
              }
              required
            />
            <textarea
              placeholder="Opis historyjki"
              value={storyForm.opis}
              onChange={(e) =>
                setStoryForm({ ...storyForm, opis: e.target.value })
              }
              required
            />
            <select
              value={storyForm.priorytet}
              onChange={(e) =>
                setStoryForm({ ...storyForm, priorytet: e.target.value })
              }
            >
              <option value="niski">Niski</option>
              <option value="średni">Średni</option>
              <option value="wysoki">Wysoki</option>
            </select>
            <button type="submit">
              {editingStoryId ? 'Zaktualizuj' : 'Dodaj'}
            </button>
          </form>

          
          <div style={{ marginBottom: '1rem' }}>
            <strong>Filtruj historyjki:</strong>
            <div className="button-group">
              <button onClick={() => setStoryFilter("all")}>Wszystkie</button>
              <button onClick={() => setStoryFilter("todo")}>Do zrobienia</button>
              <button onClick={() => setStoryFilter("doing")}>W trakcie</button>
              <button onClick={() => setStoryFilter("done")}>Zrobione</button>
            </div>
          </div>

          
          {storyFilter !== "all" && (
            <div>
              <h3>Widok filtrowany: {storyFilter.toUpperCase()}</h3>
              <ul>
                {filteredStories.map((story) => (
                  <li key={story.id}>
                    <strong>{story.nazwa}</strong>
                    <p>{story.opis}</p>
                    <div className="button-group">
                      <button onClick={() => handleStoryEdit(story)}>Edytuj</button>
                      <button onClick={() => handleStoryDelete(story.id)}>Usuń</button>
                      <select
                        value={story.stan}
                        onChange={(e) =>
                          handleStoryStateChange(story, e.target.value)
                        }
                      >
                        <option value="todo">Do zrobienia</option>
                        <option value="doing">W trakcie</option>
                        <option value="done">Zrobione</option>
                      </select>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          
          {storyFilter === "all" && (
            <>
              <div>
                <h3>Do zrobienia 🟥</h3>
                <ul>
                  {todoStories.map((story) => (
                    <li key={story.id}>
                      <strong>{story.nazwa}</strong>
                      <p>{story.opis}</p>
                      <div className="button-group">
                        <button onClick={() => handleStoryEdit(story)}>Edytuj</button>
                        <button onClick={() => handleStoryDelete(story.id)}>Usuń</button>
                        <select
                          value={story.stan}
                          onChange={(e) =>
                            handleStoryStateChange(story, e.target.value)
                          }
                        >
                          <option value="todo">Do zrobienia 🟥</option>
                          <option value="doing">W trakcie 🟨</option>
                          <option value="done">Zrobione 🟩</option>
                        </select>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3>W trakcie 🟨</h3>
                <ul>
                  {doingStories.map((story) => (
                    <li key={story.id}>
                      <strong>{story.nazwa}</strong>
                      <p>{story.opis}</p>
                      <div className="button-group">
                        <button onClick={() => handleStoryEdit(story)}>Edytuj</button>
                        <button onClick={() => handleStoryDelete(story.id)}>Usuń</button>
                        <select
                          value={story.stan}
                          onChange={(e) =>
                            handleStoryStateChange(story, e.target.value)
                          }
                        >
                          <option value="todo">Do zrobienia 🟥</option>
                          <option value="doing">W trakcie 🟨</option>
                          <option value="done">Zrobione 🟩</option>
                        </select>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3>Zrobione 🟩</h3>
                <ul>
                  {doneStories.map((story) => (
                    <li key={story.id}>
                      <strong>{story.nazwa}</strong>
                      <p>{story.opis}</p>
                      <div className="button-group">
                        <button onClick={() => handleStoryEdit(story)}>Edytuj</button>
                        <button onClick={() => handleStoryDelete(story.id)}>Usuń</button>
                        <select
                          value={story.stan}
                          onChange={(e) =>
                            handleStoryStateChange(story, e.target.value)
                          }
                        >
                          <option value="todo">Do zrobienia 🟥</option>
                          <option value="doing">W trakcie 🟨</option>
                          <option value="done">Zrobione 🟩</option>
                        </select>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}

export default App;
