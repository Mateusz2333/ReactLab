// src/App.jsx
import './App.css';
import React, { useState, useEffect, useCallback, useContext } from 'react';
import ProjectAPI from './project';
import StoryAPI from './story';
import TaskAPI from './task';
import ActiveProject from './activeProject';
import users from './user';
import LoginForm from './loginForm';
import { AuthContext, AuthProvider } from './AuthContext';

function Dashboard() {
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
  const [storyFilter, setStoryFilter] = useState('all');

  // CRUD dla zadań
  const [tasks, setTasks] = useState([]);
  const [taskForm, setTaskForm] = useState({
    nazwa: '',
    opis: '',
    priorytet: 'niski',
    przewidywanyCzas: '',
    historyjkaId: ''
  });
  const [editingTaskId, setEditingTaskId] = useState(null);

  // Wczytywanie danych
  const loadStories = useCallback((project) => {
    if (project) {
      const allStories = StoryAPI.getAll();
      setStories(allStories.filter(s => s.projekt === project.id));
    } else {
      setStories([]);
    }
  }, []);

  const loadTasks = useCallback((project) => {
    if (project) {
      const allTasks = TaskAPI.getAll();
      const projStories = StoryAPI.getAll().filter(s => s.projekt === project.id);
      setTasks(allTasks.filter(t => projStories.some(st => st.id === t.historyjkaId)));
    } else {
      setTasks([]);
    }
  }, []);

  useEffect(() => {
    setProjects(ProjectAPI.getAll());
    const ap = ActiveProject.get();
    setActiveProject(ap);
    if (ap) {
      loadStories(ap);
      loadTasks(ap);
    }
  }, [loadStories, loadTasks]);

  // Projekty
  const handleProjectSubmit = e => {
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
  const handleProjectEdit = p => {
    setEditingProjectId(p.id);
    setProjectForm({ nazwa: p.nazwa, opis: p.opis });
  };
  const handleProjectDelete = id => {
    ProjectAPI.delete(id);
    setProjects(ProjectAPI.getAll());
  };
  const handleActiveProjectChange = e => {
    const id = +e.target.value;
    const sel = projects.find(p => p.id === id);
    setActiveProject(sel);
    ActiveProject.set(sel);
    loadStories(sel);
    loadTasks(sel);
  };

  // Historyjki
  const handleStorySubmit = e => {
    e.preventDefault();
    if (!activeProject) return;
    StoryAPI.create({
      id: Date.now(),
      nazwa: storyForm.nazwa,
      opis: storyForm.opis,
      priorytet: storyForm.priorytet,
      projekt: activeProject.id,
      dataUtworzenia: new Date().toISOString(),
      stan: 'todo',
      wlasciciel: users.find(u => u.rola === 'admin').id
    });
    loadStories(activeProject);
    setStoryForm({ nazwa: '', opis: '', priorytet: 'niski' });
  };
  const handleStoryEdit = s => {
    setEditingStoryId(s.id);
    setStoryForm({ nazwa: s.nazwa, opis: s.opis, priorytet: s.priorytet });
  };
  const handleStoryUpdate = e => {
    e.preventDefault();
    if (!activeProject) return;
    StoryAPI.update({
      id: editingStoryId,
      nazwa: storyForm.nazwa,
      opis: storyForm.opis,
      priorytet: storyForm.priorytet,
      projekt: activeProject.id,
      dataUtworzenia: new Date().toISOString(),
      stan: 'todo',
      wlasciciel: users.find(u => u.rola === 'admin').id
    });
    setEditingStoryId(null);
    setStoryForm({ nazwa: '', opis: '', priorytet: 'niski' });
    loadStories(activeProject);
  };
  const handleStoryDelete = id => {
    StoryAPI.delete(id);
    loadStories(activeProject);
  };
  const handleStoryStateChange = (s, newState) => {
    StoryAPI.update({ ...s, stan: newState });
    loadStories(activeProject);
  };

  const filteredStories = storyFilter === 'all'
    ? stories
    : stories.filter(s => s.stan === storyFilter);
  const todoStories = stories.filter(s => s.stan === 'todo');
  const doingStories = stories.filter(s => s.stan === 'doing');
  const doneStories = stories.filter(s => s.stan === 'done');

  // Zadania
  const handleTaskSubmit = e => {
    e.preventDefault();
    if (!activeProject) return;
    const now = new Date().toISOString();
    TaskAPI.create({
      id: Date.now(),
      nazwa: taskForm.nazwa,
      opis: taskForm.opis,
      priorytet: taskForm.priorytet,
      przewidywanyCzas: taskForm.przewidywanyCzas,
      historyjkaId: +taskForm.historyjkaId,
      stan: 'todo',
      dataDodania: now,
      dataStartu: null,
      dataZakonczenia: null,
      odpowiedzialny: null
    });
    loadTasks(activeProject);
    setTaskForm({ nazwa: '', opis: '', priorytet: 'niski', przewidywanyCzas: '', historyjkaId: '' });
  };
  const handleTaskEdit = t => {
    setEditingTaskId(t.id);
    setTaskForm({
      nazwa: t.nazwa,
      opis: t.opis,
      priorytet: t.priorytet,
      przewidywanyCzas: t.przewidywanyCzas,
      historyjkaId: String(t.historyjkaId)
    });
  };
  const handleTaskUpdate = e => {
    e.preventDefault();
    const now = new Date().toISOString();
    TaskAPI.update({
      id: editingTaskId,
      nazwa: taskForm.nazwa,
      opis: taskForm.opis,
      priorytet: taskForm.priorytet,
      przewidywanyCzas: taskForm.przewidywanyCzas,
      historyjkaId: +taskForm.historyjkaId,
      stan: 'todo',
      dataDodania: now,
      dataStartu: null,
      dataZakonczenia: null,
      odpowiedzialny: null
    });
    setEditingTaskId(null);
    setTaskForm({ nazwa: '', opis: '', priorytet: 'niski', przewidywanyCzas: '', historyjkaId: '' });
    loadTasks(activeProject);
  };
  const handleTaskDelete = id => {
    TaskAPI.delete(id);
    loadTasks(activeProject);
  };
  const assignUserToTask = (t, userId) => {
    const u = users.find(u => u.id === userId && (u.rola === 'developer' || u.rola === 'devops'));
    if (!u) return;
    const now = new Date().toISOString();
    TaskAPI.update({ ...t, odpowiedzialny: u.id, stan: 'doing', dataStartu: now });
    loadTasks(activeProject);
  };
  const completeTask = t => {
    if (!t.odpowiedzialny) return;
    const now = new Date().toISOString();
    TaskAPI.update({ ...t, stan: 'done', dataZakonczenia: now });
    loadTasks(activeProject);
  };

  const tasksTodo = tasks.filter(t => t.stan === 'todo');
  const tasksDoing = tasks.filter(t => t.stan === 'doing');
  const tasksDone = tasks.filter(t => t.stan === 'done');

  return (
    <div style={{ padding: '2rem' }}>
      <h1>MANAGMe</h1>
      <p>
        Zalogowany użytkownik: {
          users.find(u => u.rola === 'admin').imie
        } {
          users.find(u => u.rola === 'admin').nazwisko
        }
      </p>

      {/* Projekty */}
      <section>
        <h2>Projekty</h2>
        <form onSubmit={handleProjectSubmit}>
          <input
            type="text"
            placeholder="Nazwa projektu"
            value={projectForm.nazwa}
            onChange={e => setProjectForm({ ...projectForm, nazwa: e.target.value })}
            required
          />
          <textarea
            placeholder="Opis projektu"
            value={projectForm.opis}
            onChange={e => setProjectForm({ ...projectForm, opis: e.target.value })}
            required
          />
          <button type="submit">
            {editingProjectId ? 'Zaktualizuj' : 'Dodaj'}
          </button>
        </form>
        <ul>
          {projects.map(p => (
            <li key={p.id}>
              <strong>{p.nazwa}</strong>
              <p>{p.opis}</p>
              <div className="button-group">
                <button onClick={() => handleProjectEdit(p)}>Edytuj</button>
                <button onClick={() => handleProjectDelete(p.id)}>Usuń</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Wybór aktywnego projektu */}
      <section style={{ marginTop: '2rem' }}>
        <h2>Wybierz aktywny projekt</h2>
        <select
          value={activeProject?.id || ''}
          onChange={handleActiveProjectChange}
        >
          <option value="" disabled>-- wybierz projekt --</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.nazwa}</option>
          ))}
        </select>
      </section>

      {/* Historyjki */}
      {activeProject && (
        <section style={{ marginTop: '2rem' }}>
          <h2>Historyjki dla: <em>{activeProject.nazwa}</em></h2>
          <form onSubmit={editingStoryId ? handleStoryUpdate : handleStorySubmit}>
            <input
              type="text"
              placeholder="Nazwa historyjki"
              value={storyForm.nazwa}
              onChange={e => setStoryForm({ ...storyForm, nazwa: e.target.value })}
              required
            />
            <textarea
              placeholder="Opis historyjki"
              value={storyForm.opis}
              onChange={e => setStoryForm({ ...storyForm, opis: e.target.value })}
              required
            />
            <select
              value={storyForm.priorytet}
              onChange={e => setStoryForm({ ...storyForm, priorytet: e.target.value })}
            >
              <option value="niski">Niski</option>
              <option value="średni">Średni</option>
              <option value="wysoki">Wysoki</option>
            </select>
            <button type="submit">
              {editingStoryId ? 'Zaktualizuj' : 'Dodaj'}
            </button>
          </form>
          {/* Filtr historyjek */}
          <div style={{ margin: '1rem 0' }}>
            <strong>Filtr:</strong>
            {['all','todo','doing','done'].map(f => (
              <button key={f} onClick={()=>setStoryFilter(f)}>
                {f==='all'?'Wszystkie':f}
              </button>
            ))}
          </div>
          {storyFilter !== 'all' ? (
            <ul>
              {filteredStories.map(s => (
                <li key={s.id}>
                  <strong>{s.nazwa}</strong>
                  <p>{s.opis}</p>
                  <div className="button-group">
                    <button onClick={()=>handleStoryEdit(s)}>Edytuj</button>
                    <button onClick={()=>handleStoryDelete(s.id)}>Usuń</button>
                    <select
                      value={s.stan}
                      onChange={e=>handleStoryStateChange(s,e.target.value)}
                    >
                      <option value="todo">Do zrobienia</option>
                      <option value="doing">W trakcie</option>
                      <option value="done">Zrobione</option>
                    </select>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <>
              {/* Kanban historyjek: Todo, Doing, Done */}
              <div><h3>Do zrobienia</h3><ul>
                {todoStories.map(s=>(
                  <li key={s.id}>
                    <strong>{s.nazwa}</strong>
                    <p>{s.opis}</p>
                    <button onClick={()=>handleStoryEdit(s)}>Edytuj</button>
                    <button onClick={()=>handleStoryDelete(s.id)}>Usuń</button>
                    <select
                      value={s.stan}
                      onChange={e=>handleStoryStateChange(s,e.target.value)}
                    >
                       <option value="todo">TODO🟥</option>
                      <option value="doing">DOING🟨</option>
                      <option value="done">DONE🟩</option>
                    </select>
                  </li>
                ))}
              </ul></div>
              <div><h3>W trakcie</h3><ul>
                {doingStories.map(s=>(
                  <li key={s.id}>
                    <strong>{s.nazwa}</strong>
                    <p>{s.opis}</p>
                    <button onClick={()=>handleStoryEdit(s)}>Edytuj</button>
                    <button onClick={()=>handleStoryDelete(s.id)}>Usuń</button>
                    <select
                      value={s.stan}
                      onChange={e=>handleStoryStateChange(s,e.target.value)}
                    >
                      <option value="todo">TODO🟥</option>
                      <option value="doing">DOING🟨</option>
                      <option value="done">DONE🟩</option>
                    </select>
                  </li>
                ))}
              </ul></div>
              <div><h3>Zrobione</h3><ul>
                {doneStories.map(s=>(
                  <li key={s.id}>
                    <strong>{s.nazwa}</strong>
                    <p>{s.opis}</p>
                    <button onClick={()=>handleStoryEdit(s)}>Edytuj</button>
                    <button onClick={()=>handleStoryDelete(s.id)}>Usuń</button>
                    <select
                      value={s.stan}
                      onChange={e=>handleStoryStateChange(s,e.target.value)}
                    >
                      <option value="todo">TODO🟥</option>
                      <option value="doing">DOING🟨</option>
                      <option value="done">DONE🟩</option>
                    </select>
                  </li>
                ))}
              </ul></div>
            </>
          )}
        </section>
      )}

      {/* Zadania Kanban */}
      {activeProject && (
        <section style={{ marginTop: '2rem' }}>
          <h2>Zadania (Kanban)</h2>
          <form onSubmit={editingTaskId ? handleTaskUpdate : handleTaskSubmit}>
            <input
              type="text"
              placeholder="Nazwa zadania"
              value={taskForm.nazwa}
              onChange={e=>setTaskForm({...taskForm,nazwa:e.target.value})}
              required
            />
            <textarea
              placeholder="Opis zadania"
              value={taskForm.opis}
              onChange={e=>setTaskForm({...taskForm,opis:e.target.value})}
              required
            />
            <select
              value={taskForm.priorytet}
              onChange={e=>setTaskForm({...taskForm,priorytet:e.target.value})}
            >
              <option value="niski">🟩Niski</option>
              <option value="średni">🟨Średni</option>
              <option value="wysoki">🟥Wysoki</option>
            </select>
            <input
              type="text"
              placeholder="Przewidywany czas (h)"
              value={taskForm.przewidywanyCzas}
              onChange={e=>setTaskForm({...taskForm,przewidywanyCzas:e.target.value})}
              required
            />
            <select
              value={taskForm.historyjkaId}
              onChange={e=>setTaskForm({...taskForm,historyjkaId:e.target.value})}
              required
            >
              <option value="" disabled>-- wybierz historyjkę --</option>
              {stories.map(s=>(
                <option key={s.id} value={s.id}>{s.nazwa}</option>
              ))}
            </select>
            <button type="submit">
              {editingTaskId ? 'Zaktualizuj' : 'Dodaj'}
            </button>
          </form>

          <div style={{ display:'flex', gap:'1rem', marginTop:'1rem' }}>
            {['todo','doing','done'].map(status=>(
              <div key={status} style={{ flex:1 }}>
                <h4>{status.toUpperCase()}</h4>
                <ul>
                  {(status==='todo'?tasksTodo:status==='doing'?tasksDoing:tasksDone).map(t=>(
                    <li key={t.id}>
                      <strong>{t.nazwa}</strong>
                      <p>{t.opis}</p>
                      {status==='todo' && (
                        <>
                          <p>Dodano: {t.dataDodania}</p>
                          <p>Przewidywany: {t.przewidywanyCzas}h</p>
                          <select defaultValue="" onChange={e=>assignUserToTask(t,+e.target.value)}>
                            <option value="" disabled>Przypisz</option>
                            {users.filter(u=>u.rola!=='admin').map(u=>(
                              <option key={u.id} value={u.id}>
                                {u.imie} {u.nazwisko} ({u.rola})
                              </option>
                            ))}
                          </select>
                          <button onClick={()=>completeTask(t)}>Zakończ</button>
                        </>
                      )}
                      <div className="button-group">
                        <button onClick={()=>handleTaskEdit(t)}>Edytuj</button>
                        <button onClick={()=>handleTaskDelete(t.id)}>Usuń</button>
                      </div>
                      {t.odpowiedzialny && (
                        <p>Przypisany: {
                          users.find(u=>u.id===t.odpowiedzialny)?.imie
                        } {
                          users.find(u=>u.id===t.odpowiedzialny)?.nazwisko
                        }</p>
                      )}
                      {t.dataStartu && <p>Start: {t.dataStartu}</p>}
                      {t.dataZakonczenia && <p>Zakończono: {t.dataZakonczenia}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function App() {
  const { user, login } = useContext(AuthContext);

  const handleLoginSuccess = ({ token, refreshToken }) => {
    login(token, refreshToken);
  };

  return !user
    ? <LoginForm onLoginSuccess={handleLoginSuccess} />
    : <Dashboard />;
}

export default function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
