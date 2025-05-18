// src/App.jsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import ProjectAPI from './project';
import StoryAPI from './story';
import TaskAPI from './task';
import ActiveProject from './activeProject';
import users from './user';
import LoginForm from './loginForm';
import { AuthContext, AuthProvider } from './AuthContext';
import ThemeToggle from './ThemeToggle';
import Footer from './footer';
import Navbar from './Navbar';

function Dashboard() {
  // Projekty
  const [projects, setProjects] = useState([]);
  const [projectForm, setProjectForm] = useState({ nazwa: '', opis: '' });
  const [editingProjectId, setEditingProjectId] = useState(null);

  // Aktywny projekt
  const [activeProject, setActiveProject] = useState(null);

  // Historyjki
  const [stories, setStories] = useState([]);
  const [storyForm, setStoryForm] = useState({ nazwa: '', opis: '', priorytet: 'niski' });
  const [editingStoryId, setEditingStoryId] = useState(null);
  const [storyFilter, setStoryFilter] = useState('all');

  // Zadania
  const [tasks, setTasks] = useState([]);
  const [taskForm, setTaskForm] = useState({
    nazwa: '',
    opis: '',
    priorytet: 'niski',
    przewidywanyCzas: '',
    historyjkaId: ''
  });
  const [editingTaskId, setEditingTaskId] = useState(null);

  // Ładowanie danych
  const loadStories = useCallback(project => {
    if (!project) return setStories([]);
    setStories(StoryAPI.getAll().filter(s => s.projekt === project.id));
  }, []);

  const loadTasks = useCallback(project => {
    if (!project) return setTasks([]);
    const all = TaskAPI.getAll();
    const projStories = StoryAPI.getAll().filter(s => s.projekt === project.id);
    setTasks(all.filter(t => projStories.some(st => st.id === t.historyjkaId)));
  }, []);

  useEffect(() => {
    setProjects(ProjectAPI.getAll());
    const ap = ActiveProject.get();
    setActiveProject(ap);
    loadStories(ap);
    loadTasks(ap);
  }, [loadStories, loadTasks]);

  // Handlery projektów
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
    if (activeProject?.id === id) {
      setActiveProject(null);
      ActiveProject.set(null);
      loadStories(null);
      loadTasks(null);
    }
  };
  const handleActiveChange = e => {
    const id = +e.target.value;
    const sel = projects.find(p => p.id === id);
    setActiveProject(sel);
    ActiveProject.set(sel);
    loadStories(sel);
    loadTasks(sel);
  };

  // Handlery historyjek
  const handleStorySubmit = e => {
    e.preventDefault();
    if (!activeProject) return;
    StoryAPI.create({
      id: Date.now(),
      ...storyForm,
      projekt: activeProject.id,
      dataUtworzenia: new Date().toISOString(),
      stan: 'todo',
      wlasciciel: users.find(u => u.rola === 'admin').id
    });
    loadStories(activeProject);
    setStoryForm({ nazwa: '', opis: '', priorytet: 'niski' });
  };
  const handleStoryUpdate = e => {
    e.preventDefault();
    StoryAPI.update({
      id: editingStoryId,
      ...storyForm,
      projekt: activeProject.id,
      dataUtworzenia: new Date().toISOString(),
      stan: 'todo',
      wlasciciel: users.find(u => u.rola === 'admin').id
    });
    setEditingStoryId(null);
    setStoryForm({ nazwa: '', opis: '', priorytet: 'niski' });
    loadStories(activeProject);
  };
  const handleStoryEdit = s => {
    setEditingStoryId(s.id);
    setStoryForm({ nazwa: s.nazwa, opis: s.opis, priorytet: s.priorytet });
  };
  const handleStoryDelete = id => {
    StoryAPI.delete(id);
    loadStories(activeProject);
  };
  const handleStoryState = (s, stan) => {
    StoryAPI.update({ ...s, stan });
    loadStories(activeProject);
  };
  const filteredStories = storyFilter === 'all'
    ? stories
    : stories.filter(s => s.stan === storyFilter);

  // Handlery zadań
  const handleTaskSubmit = e => {
    e.preventDefault();
    if (!activeProject) return;
    TaskAPI.create({
      id: Date.now(),
      ...taskForm,
      historyjkaId: +taskForm.historyjkaId,
      stan: 'todo',
      dataDodania: new Date().toISOString(),
      dataStartu: null,
      dataZakonczenia: null,
      odpowiedzialny: null
    });
    loadTasks(activeProject);
    setTaskForm({
      nazwa: '',
      opis: '',
      priorytet: 'niski',
      przewidywanyCzas: '',
      historyjkaId: ''
    });
  };
  const handleTaskUpdate = e => {
    e.preventDefault();
    TaskAPI.update({
      id: editingTaskId,
      ...taskForm,
      historyjkaId: +taskForm.historyjkaId,
      stan: 'todo',
      dataDodania: new Date().toISOString(),
      dataStartu: null,
      dataZakonczenia: null,
      odpowiedzialny: null
    });
    setEditingTaskId(null);
    setTaskForm({
      nazwa: '',
      opis: '',
      priorytet: 'niski',
      przewidywanyCzas: '',
      historyjkaId: ''
    });
    loadTasks(activeProject);
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
  const handleTaskDelete = id => {
    TaskAPI.delete(id);
    loadTasks(activeProject);
  };
  const assignUser = (t, uid) => {
    const now = new Date().toISOString();
    TaskAPI.update({ ...t, odpowiedzialny: uid, stan: 'doing', dataStartu: now });
    loadTasks(activeProject);
  };
  const completeTask = t => {
    if (!t.odpowiedzialny) return;
    TaskAPI.update({ ...t, stan: 'done', dataZakonczenia: new Date().toISOString() });
    loadTasks(activeProject);
  };

  // Kanban widoki
  const todoStories = stories.filter(s => s.stan === 'todo');
  const doingStories = stories.filter(s => s.stan === 'doing');
  const doneStories = stories.filter(s => s.stan === 'done');
  const tasksTodo = tasks.filter(t => t.stan === 'todo');
  const tasksDoing = tasks.filter(t => t.stan === 'doing');
  const tasksDone = tasks.filter(t => t.stan === 'done');

  return (
    <div className="drawer drawer-mobile">
      <input id="dashboard-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content bg-base-200">
        <div className="container mx-auto max-w-4xl p-4 lg:p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl lg:text-3xl font-bold">MANAGMe </h1> 
            <ThemeToggle />
          </div>

          {/* Projekty */}
          <div className="card bg-base-100 shadow rounded-2xl">
            <div className="card-body p-4 lg:p-6 space-y-4">
              <h2 className="text-lg lg:text-xl font-semibold">Projekty </h2>
              <form onSubmit={handleProjectSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
                <input
                  type="text"
                  placeholder="Nazwa projektu"
                  className="input input-bordered w-full"
                  value={projectForm.nazwa}
                  onChange={e => setProjectForm({ ...projectForm, nazwa: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Opis projektu"
                  className="textarea textarea-bordered w-full"
                  value={projectForm.opis}
                  onChange={e => setProjectForm({ ...projectForm, opis: e.target.value })}
                  required
                />
                <button type="submit" className="btn btn-primary w-full">
                  {editingProjectId ? 'Zaktualizuj' : 'Dodaj'}
                </button>
              </form>
              <ul className="mt-4 space-y-2">
                {projects.map(p => (
                  <li key={p.id} className="flex justify-between items-center bg-base-200 p-3 rounded-xl">
                    <div>
                      <h3 className="font-medium">{p.nazwa}</h3>
                      <p className="text-sm text-gray-500">{p.opis}</p>
                    </div>
                  <div className="flex gap-x-4">
                  <button className="btn btn-sm btn-outline" onClick={() => handleProjectEdit(p)}>Edytuj</button>
                  <button className="btn btn-sm btn-outline btn-error" onClick={() => handleProjectDelete(p.id)}>Usuń</button>
                  
                  </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Aktywny projekt */}
          <div className="card bg-base-100 shadow rounded-2xl">
            <div className="card-body p-4 lg:p-6">
              <h2 className="text-lg lg:text-xl font-semibold mb-2">Wybierz aktywny projekt</h2>
              <select
                className="select select-bordered w-full max-w-xs"
                value={activeProject?.id || ''}
                onChange={handleActiveChange}
              >
                <option value="" disabled>-- wybierz projekt --</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.nazwa}</option>)}
              </select>
            </div>
          </div>

          {/* Historyjki */}
          {activeProject && (
            <div className="card bg-base-100 shadow rounded-2xl">
              <div className="card-body p-4 lg:p-6 space-y-4">
                <h2 className="text-lg lg:text-xl font-semibold">
                  Historyjki dla: <em>{activeProject.nazwa}</em>
                </h2>
                <form onSubmit={editingStoryId ? handleStoryUpdate : handleStorySubmit}
                      className="grid grid-cols-1 md:grid-cols-4 gap-3 lg:gap-4">
                  <input type="text" placeholder="Nazwa historyjki"
                         className="input input-bordered w-full"
                         value={storyForm.nazwa}
                         onChange={e => setStoryForm({ ...storyForm, nazwa: e.target.value })}
                         required />
                  <textarea placeholder="Opis historyjki"
                            className="textarea textarea-bordered w-full"
                            value={storyForm.opis}
                            onChange={e => setStoryForm({ ...storyForm, opis: e.target.value })}
                            required />
                  <select className="select select-bordered"
                          value={storyForm.priorytet}
                          onChange={e => setStoryForm({ ...storyForm, priorytet: e.target.value })}>
                    <option value="niski">Niski</option>
                    <option value="średni">Średni</option>
                    <option value="wysoki">Wysoki</option>
                  </select>
                  <button type="submit" className="btn btn-primary w-full">
                    {editingStoryId ? 'Zaktualizuj' : 'Dodaj'}
                  </button>
                </form>

                {/* Filtr historyjek */}
                <div className="btn-group my-4">
                  {['all', 'todo', 'doing', 'done'].map(f => (
                    <button key={f}
                            className={`btn btn-sm ${storyFilter === f ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setStoryFilter(f)}>
                      {f === 'all' ? 'Wszystkie' : f.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Kanban historyjek */}
                {storyFilter === 'all' ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[{ title: 'TO DO', data: todoStories },
                      { title: 'DOING', data: doingStories },
                      { title: 'DONE', data: doneStories }].map(col => (
                      <div key={col.title} className="bg-base-200 p-4 rounded-xl">
                        <h4 className="font-semibold mb-2">{col.title}</h4>
                        <ul className="space-y-2">
                          {col.data.map(s => (
                            <li key={s.id} className="bg-base-100 p-3 rounded-lg">
                              <h5 className="font-medium">{s.nazwa}</h5>
                              <p className="text-sm mb-2">{s.opis}</p>
                              <div className="flex gap-2">
                                <button className="btn btn-xs btn-outline"
                                        onClick={() => handleStoryEdit(s)}>Edytuj</button>
                                <button className="btn btn-xs btn-outline btn-error"
                                        onClick={() => handleStoryDelete(s.id)}>Usuń</button>
                                <select className="select select-xs select-bordered"
                                        value={s.stan}
                                        onChange={e => handleStoryState(s, e.target.value)}>
                                  <option value="todo">TODO</option>
                                  <option value="doing">DOING</option>
                                  <option value="done">DONE</option>
                                </select>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {filteredStories.map(s => (
                      <li key={s.id}
                          className="bg-base-100 p-4 rounded-lg flex justify-between items-center">
                        <div>
                          <h5 className="font-medium">{s.nazwa}</h5>
                          <p className="text-sm">{s.opis}</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="btn btn-xs btn-outline"
                                  onClick={() => handleStoryEdit(s)}>Edytuj</button>
                          <button className="btn btn-xs btn-outline btn-error"
                                  onClick={() => handleStoryDelete(s.id)}>Usuń</button>
                          <select className="select select-xs select-bordered"
                                  value={s.stan}
                                  onChange={e => handleStoryState(s, e.target.value)}>
                            <option value="todo">TODO</option>
                            <option value="doing">DOING</option>
                            <option value="done">DONE</option>
                          </select>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Zadania Kanban */}
          {activeProject && (
            <div className="card bg-base-100 shadow rounded-2xl">
              <div className="card-body p-4 lg:p-6 space-y-4">
                <h2 className="text-lg lg:text-xl font-semibold">Zadania (Kanban)</h2>
                <form onSubmit={editingTaskId ? handleTaskUpdate : handleTaskSubmit}
                      className="grid grid-cols-1 md:grid-cols-4 gap-3 lg:gap-4">
                  <input type="text" placeholder="Nazwa zadania"
                         className="input input-bordered w-full"
                         value={taskForm.nazwa}
                         onChange={e => setTaskForm({ ...taskForm, nazwa: e.target.value })}
                         required />
                  <textarea placeholder="Opis zadania"
                            className="textarea textarea-bordered w-full"
                            value={taskForm.opis}
                            onChange={e => setTaskForm({ ...taskForm, opis: e.target.value })}
                            required />
                  <input type="text" placeholder="Przewidywany czas (h)"
                         className="input input-bordered w-full"
                         value={taskForm.przewidywanyCzas}
                         onChange={e => setTaskForm({ ...taskForm, przewidywanyCzas: e.target.value })}
                         required />
                  <select className="select select-bordered w-full"
                          value={taskForm.historyjkaId}
                          onChange={e => setTaskForm({ ...taskForm, historyjkaId: e.target.value })}
                          required>
                    <option value="" disabled>-- wybierz historyjkę --</option>
                    {stories.map(s => <option key={s.id} value={s.id}>{s.nazwa}</option>)}
                  </select>
                  <select className="select select-bordered w-full"
                          value={taskForm.priorytet}
                          onChange={e => setTaskForm({ ...taskForm, priorytet: e.target.value })}>
                    <option value="niski">Niski</option>
                    <option value="średni">Średni</option>
                    <option value="wysoki">Wysoki</option>
                  </select>
                  <button type="submit" className="btn btn-primary w-full md:col-span-2">
                    {editingTaskId ? 'Zaktualizuj' : 'Dodaj'}
                  </button>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { title: 'TODO', data: tasksTodo },
                    { title: 'DOING', data: tasksDoing },
                    { title: 'DONE', data: tasksDone }
                  ].map(col => (
                    <div key={col.title} className="bg-base-200 p-4 rounded-xl">
                      <h4 className="font-semibold mb-2">{col.title}</h4>
                      <ul className="space-y-2">
                        {col.data.map(t => (
                          <li key={t.id} className="bg-base-100 p-3 rounded-lg">
                            <h5 className="font-medium">{t.nazwa}</h5>
                            <p className="text-sm mb-1">{t.opis}</p>
                            {col.title === 'TODO' && (
                              <div className="flex flex-col gap-2 mb-2">
                                <p className="text-xs">Dodano: {t.dataDodania}</p>
                                <p className="text-xs">Przewidywany: {t.przewidywanyCzas}h</p>
                                <select className="select select-xs select-bordered" defaultValue=""
                                        onChange={e => assignUser(t, +e.target.value)}>
                                  <option value="" disabled>Przypisz</option>
                                  {users.filter(u => u.rola !== 'admin').map(u => (
                                    <option key={u.id} value={u.id}>
                                      {u.imie} {u.nazwisko} ({u.rola})
                                    </option>
                                  ))}
                                </select>
                                <button className="btn btn-xs btn-success mt-1"
                                        onClick={() => completeTask(t)}>Zakończ</button>
                              </div>
                            )}
                           <div className="flex gap-x-2">
  <button className="btn btn-xs btn-outline" onClick={() => handleTaskEdit(t)}>Edytuj</button>
  <button className="btn btn-xs btn-outline btn-error" onClick={() => handleTaskDelete(t.id)}>Usuń</button>
</div>

                            {t.odpowiedzialny && (
                              <p className="text-xs mt-1">
                                Przypisany: {users.find(u => u.id === t.odpowiedzialny)?.imie}{' '}
                                {users.find(u => u.id === t.odpowiedzialny)?.nazwisko}
                              </p>
                            )}
                            {t.dataStartu && <p className="text-xs">Start: {t.dataStartu}</p>}
                            {t.dataZakonczenia && <p className="text-xs">Zakończono: {t.dataZakonczenia}</p>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="drawer-side">
        <label htmlFor="dashboard-drawer" className="drawer-overlay" />
        <ul className="menu p-4 w-56 bg-base-100">
          <li><a className="text-base">Projekty</a></li>
          {activeProject && <li><a className="text-base">Historyjki</a></li>}
          {activeProject && <li><a className="text-base">Zadania</a></li>}
        </ul>
      </div>
    </div>
  );
}

function App() {
  const { user, login } = useContext(AuthContext);

  const onLogin = ({ token, refreshToken }) => {
    login(token, refreshToken);
  };

  return (
    
    <>
    
      <Navbar />

      <main className="min-h-screen flex items-center justify-center bg-gray-300">
        {!user ? (
          <LoginForm onLoginSuccess={onLogin} />
        ) : (
          <Dashboard />
        )}
      </main>

      {user && <Footer />}
    </>
  );
}

export default function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
