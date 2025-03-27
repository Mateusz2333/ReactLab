import './App.css';
import React, { useState, useEffect, useCallback } from 'react';
import ProjectAPI from './project';
import StoryAPI from './story';
import TaskAPI from './task';
import ActiveProject from './activeProject';
import users from './user';

function App() {
  // CRUD dla projektów
  const [projects, setProjects] = useState([]);
  const [projectForm, setProjectForm] = useState({ nazwa: '', opis: '' });
  const [editingProjectId, setEditingProjectId] = useState(null);

  // Aktywny projekt
  const [activeProject, setActiveProject] = useState(null);

  // CRUD dla historyjek
  const [stories, setStories] = useState([]);
  const [storyForm, setStoryForm] = useState({
    nazwa: '',
    opis: '',
    priorytet: 'niski'
  });
  const [editingStoryId, setEditingStoryId] = useState(null);
  const [storyFilter, setStoryFilter] = useState("all");

  // CRUD dla zadań
  const [tasks, setTasks] = useState([]);
  const [taskForm, setTaskForm] = useState({
    nazwa: '',
    opis: '',
    priorytet: 'niski',
    przewidywanyCzas: '',
    historyjkaId: '' // wybieramy historyjkę, do której należy zadanie
  });
  const [editingTaskId, setEditingTaskId] = useState(null);

  // Funkcja loadStories opakowana w useCallback
  const loadStories = useCallback((project) => {
    if (project) {
      const allStories = StoryAPI.getAll();
      const filtered = allStories.filter(s => s.projekt === project.id);
      setStories(filtered);
    } else {
      setStories([]);
    }
  }, []);

  // Funkcja loadTasks opakowana w useCallback
  const loadTasks = useCallback((project) => {
    if (project) {
      const allTasks = TaskAPI.getAll();
      const projectStories = StoryAPI.getAll().filter(s => s.projekt === project.id);
      const filtered = allTasks.filter(t => projectStories.some(story => story.id === t.historyjkaId));
      setTasks(filtered);
    } else {
      setTasks([]);
    }
  }, []);

  // Ładujemy dane przy starcie
  useEffect(() => {
    const allProjects = ProjectAPI.getAll();
    setProjects(allProjects);
    const ap = ActiveProject.get();
    setActiveProject(ap);
    if (ap) {
      loadStories(ap);
      loadTasks(ap);
    }
  }, [loadStories, loadTasks]);

  // Funkcje dla projektów
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
    const selectedProject = projects.find(p => p.id === projectId);
    setActiveProject(selectedProject);
    ActiveProject.set(selectedProject);
    loadStories(selectedProject);
    loadTasks(selectedProject);
  };

  // Funkcje dla historyjek
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
      wlasciciel: users.find(u => u.rola === 'admin').id
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
      wlasciciel: users.find(u => u.rola === 'admin').id
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
    storyFilter === "all" ? stories : stories.filter(s => s.stan === storyFilter);
  const todoStories = stories.filter(s => s.stan === 'todo');
  const doingStories = stories.filter(s => s.stan === 'doing');
  const doneStories = stories.filter(s => s.stan === 'done');

  // Funkcje dla zadań
  const handleTaskSubmit = (e) => {
    e.preventDefault();
    if (!activeProject) return;
    const now = new Date().toISOString();
    const newTask = {
      id: Date.now(),
      nazwa: taskForm.nazwa,
      opis: taskForm.opis,
      priorytet: taskForm.priorytet,
      przewidywanyCzas: taskForm.przewidywanyCzas,
      historyjkaId: parseInt(taskForm.historyjkaId),
      stan: 'todo',
      dataDodania: now,
      dataStartu: null,
      dataZakonczenia: null,
      odpowiedzialny: null
    };
    TaskAPI.create(newTask);
    loadTasks(activeProject);
    setTaskForm({ nazwa: '', opis: '', priorytet: 'niski', przewidywanyCzas: '', historyjkaId: '' });
  };

  const handleTaskDelete = (id) => {
    TaskAPI.delete(id);
    loadTasks(activeProject);
  };

  const handleTaskEdit = (task) => {
    setEditingTaskId(task.id);
    setTaskForm({
      nazwa: task.nazwa,
      opis: task.opis,
      priorytet: task.priorytet,
      przewidywanyCzas: task.przewidywanyCzas,
      historyjkaId: task.historyjkaId.toString()
    });
  };

  const handleTaskUpdate = (e) => {
    e.preventDefault();
    const now = new Date().toISOString();
    const updatedTask = {
      id: editingTaskId,
      nazwa: taskForm.nazwa,
      opis: taskForm.opis,
      priorytet: taskForm.priorytet,
      przewidywanyCzas: taskForm.przewidywanyCzas,
      historyjkaId: parseInt(taskForm.historyjkaId),
      stan: 'todo',
      dataDodania: now,
      dataStartu: null,
      dataZakonczenia: null,
      odpowiedzialny: null
    };
    TaskAPI.update(updatedTask);
    setEditingTaskId(null);
    setTaskForm({ nazwa: '', opis: '', priorytet: 'niski', przewidywanyCzas: '', historyjkaId: '' });
    loadTasks(activeProject);
  };

  const assignUserToTask = (task, userId) => {
    const user = users.find(u => u.id === userId && (u.rola === 'developer' || u.rola === 'devops'));
    if (!user) return;
    const now = new Date().toISOString();
    const updatedTask = { ...task, odpowiedzialny: user.id, stan: 'doing', dataStartu: now };
    TaskAPI.update(updatedTask);
    loadTasks(activeProject);
  };

  const completeTask = (task) => {
    if (!task.odpowiedzialny) return;
    const now = new Date().toISOString();
    const updatedTask = { ...task, stan: 'done', dataZakonczenia: now };
    TaskAPI.update(updatedTask);
    loadTasks(activeProject);
  };

  const tasksTodo = tasks.filter(t => t.stan === 'todo');
  const tasksDoing = tasks.filter(t => t.stan === 'doing');
  const tasksDone = tasks.filter(t => t.stan === 'done');

  return (
    <div style={{ padding: '2rem' }}>
      <h1>MANAGMe</h1>
      <p>
        Zalogowany użytkownik: {users.find(u => u.rola === 'admin').imie} {users.find(u => u.rola === 'admin').nazwisko}
      </p>

      {/* Sekcja CRUD dla projektów */}
      <section>
        <h2>Projekty</h2>
        <form onSubmit={handleProjectSubmit}>
          <input
            type="text"
            placeholder="Nazwa projektu"
            value={projectForm.nazwa}
            onChange={(e) => setProjectForm({ ...projectForm, nazwa: e.target.value })}
            required
          />
          <textarea
            placeholder="Opis projektu"
            value={projectForm.opis}
            onChange={(e) => setProjectForm({ ...projectForm, opis: e.target.value })}
            required
          />
          <button type="submit">{editingProjectId ? 'Zaktualizuj' : 'Dodaj'}</button>
        </form>
        <ul>
          {projects.map(project => (
            <li key={project.id}>
              <strong>{project.nazwa}</strong>
              <p>{project.opis}</p>
              <div className="button-group">
                <button className="edit" onClick={() => handleProjectEdit(project)}>Edytuj</button>
                <button className="delete" onClick={() => handleProjectDelete(project.id)}>Usuń</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Sekcja wyboru aktywnego projektu */}
      <section style={{ marginTop: '2rem' }}>
        <h2>Wybierz aktywny projekt</h2>
        <select value={activeProject ? activeProject.id : ''} onChange={handleActiveProjectChange}>
          <option value="" disabled>-- wybierz projekt --</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>{project.nazwa}</option>
          ))}
        </select>
      </section>

      {/* Sekcja CRUD dla historyjek */}
      {activeProject && (
        <section style={{ marginTop: '2rem' }}>
          <h2>Historyjki dla projektu: <em>{activeProject.nazwa}</em></h2>
          <form onSubmit={editingStoryId ? handleStoryUpdate : handleStorySubmit}>
            <input
              type="text"
              placeholder="Nazwa historyjki"
              value={storyForm.nazwa}
              onChange={(e) => setStoryForm({ ...storyForm, nazwa: e.target.value })}
              required
            />
            <textarea
              placeholder="Opis historyjki"
              value={storyForm.opis}
              onChange={(e) => setStoryForm({ ...storyForm, opis: e.target.value })}
              required
            />
            <select
              value={storyForm.priorytet}
              onChange={(e) => setStoryForm({ ...storyForm, priorytet: e.target.value })}
            >
              <option value="niski">Niski</option>
              <option value="średni">Średni</option>
              <option value="wysoki">Wysoki</option>
            </select>
            <button type="submit">{editingStoryId ? 'Zaktualizuj' : 'Dodaj'}</button>
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
          {storyFilter !== "all" ? (
            <div>
              <h3>Widok filtrowany: {storyFilter.toUpperCase()}</h3>
              <ul>
                {filteredStories.map(story => (
                  <li key={story.id}>
                    <strong>{story.nazwa}</strong>
                    <p>{story.opis}</p>
                    <div className="button-group">
                      <button onClick={() => handleStoryEdit(story)}>Edytuj</button>
                      <button onClick={() => handleStoryDelete(story.id)}>Usuń</button>
                      <select
                        value={story.stan}
                        onChange={(e) => handleStoryStateChange(story, e.target.value)}
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
          ) : (
            <>
              <div>
                <h3>Do zrobienia 🟥</h3>
                <ul>
                  {todoStories.map(story => (
                    <li key={story.id}>
                      <strong>{story.nazwa}</strong>
                      <p>{story.opis}</p>
                      <div className="button-group">
                        <button onClick={() => handleStoryEdit(story)}>Edytuj</button>
                        <button onClick={() => handleStoryDelete(story.id)}>Usuń</button>
                        <select
                          value={story.stan}
                          onChange={(e) => handleStoryStateChange(story, e.target.value)}
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
                  {doingStories.map(story => (
                    <li key={story.id}>
                      <strong>{story.nazwa}</strong>
                      <p>{story.opis}</p>
                      <div className="button-group">
                        <button onClick={() => handleStoryEdit(story)}>Edytuj</button>
                        <button onClick={() => handleStoryDelete(story.id)}>Usuń</button>
                        <select
                          value={story.stan}
                          onChange={(e) => handleStoryStateChange(story, e.target.value)}
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
                  {doneStories.map(story => (
                    <li key={story.id}>
                      <strong>{story.nazwa}</strong>
                      <p>{story.opis}</p>
                      <div className="button-group">
                        <button onClick={() => handleStoryEdit(story)}>Edytuj</button>
                        <button onClick={() => handleStoryDelete(story.id)}>Usuń</button>
                        <select
                          value={story.stan}
                          onChange={(e) => handleStoryStateChange(story, e.target.value)}
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
            </>
          )}
        </section>
      )}

      {/* Sekcja CRUD i Kanban dla zadań */}
      {activeProject && (
        <section style={{ marginTop: '2rem' }}>
          <h2>Zadania dla projektu (Kanban)</h2>
          <form onSubmit={editingTaskId ? handleTaskUpdate : handleTaskSubmit}>
            <input
              type="text"
              placeholder="Nazwa zadania"
              value={taskForm.nazwa}
              onChange={(e) => setTaskForm({ ...taskForm, nazwa: e.target.value })}
              required
            />
            <textarea
              placeholder="Opis zadania"
              value={taskForm.opis}
              onChange={(e) => setTaskForm({ ...taskForm, opis: e.target.value })}
              required
            />
            <select
              value={taskForm.priorytet}
              onChange={(e) => setTaskForm({ ...taskForm, priorytet: e.target.value })}
            >
              <option value="niski">Niski</option>
              <option value="średni">Średni</option>
              <option value="wysoki">Wysoki</option>
            </select>
            <input
              type="text"
              placeholder="Przewidywany czas wykonania (h)"
              value={taskForm.przewidywanyCzas}
              onChange={(e) => setTaskForm({ ...taskForm, przewidywanyCzas: e.target.value })}
              required
            />
            <select
              value={taskForm.historyjkaId}
              onChange={(e) => setTaskForm({ ...taskForm, historyjkaId: e.target.value })}
              required
            >
              <option value="" disabled>-- wybierz historyjkę --</option>
              {stories.map(story => (
                <option key={story.id} value={story.id}>{story.nazwa}</option>
              ))}
            </select>
            <button type="submit">{editingTaskId ? 'Zaktualizuj' : 'Dodaj'}</button>
          </form>
          <div style={{ marginTop: '1rem' }}>
            <h3>Kanban Board</h3>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-around' }}>
              <div className="kanban-column todo" style={{ flex: 1 }}>
                <h4>Todo</h4>
                <ul>
                  {tasksTodo.map(task => (
                    <li key={task.id}>
                      <strong>{task.nazwa}</strong>
                      <p>{task.opis}</p>
                      <p>Przewidywany czas: {task.przewidywanyCzas}h</p>
                      <p>Dodano: {task.dataDodania}</p>
                      <div className="button-group">
                        <select onChange={(e) => assignUserToTask(task, parseInt(e.target.value))} defaultValue="">
                          <option value="" disabled>Przypisz</option>
                          {users.filter(u => u.rola !== 'admin').map(u => (
                            <option key={u.id} value={u.id}>
                              {u.imie} {u.nazwisko} ({u.rola})
                            </option>
                          ))}
                        </select>
                        <button onClick={() => completeTask(task)}>Zakończ</button>
                        <button onClick={() => handleTaskEdit(task)}>Edytuj</button>
                        <button onClick={() => handleTaskDelete(task.id)}>Usuń</button>
                      </div>
                      {task.odpowiedzialny && (
                        <p>Przypisany: {users.find(u => u.id === task.odpowiedzialny)?.imie} {users.find(u => u.id === task.odpowiedzialny)?.nazwisko}</p>
                      )}
                      {task.dataStartu && <p>Start: {task.dataStartu}</p>}
                      {task.dataZakonczenia && <p>Zakończono: {task.dataZakonczenia}</p>}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="kanban-column doing" style={{ flex: 1 }}>
                <h4>Doing</h4>
                <ul>
                  {tasksDoing.map(task => (
                    <li key={task.id}>
                      <strong>{task.nazwa}</strong>
                      <p>{task.opis}</p>
                      <div className="button-group">
                        <button onClick={() => handleTaskEdit(task)}>Edytuj</button>
                        <button onClick={() => handleTaskDelete(task.id)}>Usuń</button>
                      </div>
                      {task.odpowiedzialny && (
                        <p>Przypisany: {users.find(u => u.id === task.odpowiedzialny)?.imie} {users.find(u => u.id === task.odpowiedzialny)?.nazwisko}</p>
                      )}
                      {task.dataStartu && <p>Start: {task.dataStartu}</p>}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="kanban-column done" style={{ flex: 1 }}>
                <h4>Done</h4>
                <ul>
                  {tasksDone.map(task => (
                    <li key={task.id}>
                      <strong>{task.nazwa}</strong>
                      <p>{task.opis}</p>
                      <div className="button-group">
                        <button onClick={() => handleTaskEdit(task)}>Edytuj</button>
                        <button onClick={() => handleTaskDelete(task.id)}>Usuń</button>
                      </div>
                      {task.odpowiedzialny && (
                        <p>Przypisany: {users.find(u => u.id === task.odpowiedzialny)?.imie} {users.find(u => u.id === task.odpowiedzialny)?.nazwisko}</p>
                      )}
                      {task.dataZakonczenia && <p>Zakończono: {task.dataZakonczenia}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
