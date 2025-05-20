// src/App.jsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import ProjectAPI from './project';
import StoryAPI from './story';
import TaskAPI from './task';
import ActiveProject from './activeProject';
import users from './user';
import LoginForm from './loginForm';
import { AuthContext, AuthProvider, useAuth } from './AuthContext';
import ThemeToggle from './ThemeToggle';
import Footer from './footer';
import Navbar from './Navbar';
import GoogleLoginButton from './GoogleLoginButton';

function Dashboard() {
  const { user } = useAuth();
  const isReadOnly = user?.rola === 'guest';

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

  // Loaders
  const loadProjects = () => setProjects(ProjectAPI.getAll());
  const loadStories = useCallback(proj => {
    if (!proj) return setStories([]);
    setStories(StoryAPI.getAll().filter(s => s.projekt === proj.id));
  }, []);
  const loadTasks = useCallback(proj => {
    if (!proj) return setTasks([]);
    const all = TaskAPI.getAll();
    const ps = StoryAPI.getAll().filter(s => s.projekt === proj.id);
    setTasks(all.filter(t => ps.some(st => st.id === t.historyjkaId)));
  }, []);

  useEffect(() => {
    loadProjects();
    const ap = ActiveProject.get();
    setActiveProject(ap);
    loadStories(ap);
    loadTasks(ap);
  }, [loadStories, loadTasks]);

  // Projekty handlers
  const handleProjectSubmit = e => {
    e.preventDefault();
    if (isReadOnly) return;
    if (editingProjectId) {
      ProjectAPI.update({ id: editingProjectId, ...projectForm });
      setEditingProjectId(null);
    } else {
      ProjectAPI.create({ id: Date.now(), ...projectForm });
    }
    setProjectForm({ nazwa: '', opis: '' });
    loadProjects();
  };
  const handleProjectEdit = p => {
    if (isReadOnly) return;
    setEditingProjectId(p.id);
    setProjectForm({ nazwa: p.nazwa, opis: p.opis });
  };
  const handleProjectDelete = id => {
    if (isReadOnly) return;
    ProjectAPI.delete(id);
    loadProjects();
    if (activeProject?.id === id) {
      setActiveProject(null);
      ActiveProject.set(null);
      loadStories(null);
      loadTasks(null);
    }
  };
  const handleActiveChange = e => {
    const sel = projects.find(p => p.id === +e.target.value);
    setActiveProject(sel);
    ActiveProject.set(sel);
    loadStories(sel);
    loadTasks(sel);
  };

  // Historyjki handlers
  const handleStorySubmit = e => {
    e.preventDefault();
    if (isReadOnly || !activeProject) return;
    StoryAPI.create({
      id: Date.now(),
      ...storyForm,
      projekt: activeProject.id,
      dataUtworzenia: new Date().toISOString(),
      stan: 'todo',
      wlasciciel: users.find(u => u.rola === 'admin').id
    });
    setStoryForm({ nazwa: '', opis: '', priorytet: 'niski' });
    loadStories(activeProject);
  };
  const handleStoryUpdate = e => {
    e.preventDefault();
    if (isReadOnly) return;
    StoryAPI.update({ id: editingStoryId, ...storyForm });
    setEditingStoryId(null);
    setStoryForm({ nazwa: '', opis: '', priorytet: 'niski' });
    loadStories(activeProject);
  };
  const handleStoryEdit = s => {
    if (isReadOnly) return;
    setEditingStoryId(s.id);
    setStoryForm({ nazwa: s.nazwa, opis: s.opis, priorytet: s.priorytet });
  };
  const handleStoryDelete = id => {
    if (isReadOnly) return;
    StoryAPI.delete(id);
    loadStories(activeProject);
  };
  const handleStoryState = (s, stan) => {
    if (isReadOnly) return;
    StoryAPI.update({ ...s, stan });
    loadStories(activeProject);
  };
  const filteredStories = storyFilter === 'all'
    ? stories
    : stories.filter(s => s.stan === storyFilter);

  // Zadania handlers
  const handleTaskSubmit = e => {
    e.preventDefault();
    if (isReadOnly || !activeProject) return;
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
    setTaskForm({
      nazwa: '',
      opis: '',
      priorytet: 'niski',
      przewidywanyCzas: '',
      historyjkaId: ''
    });
    loadTasks(activeProject);
  };
  const handleTaskUpdate = e => {
    e.preventDefault();
    if (isReadOnly) return;
    TaskAPI.update({ id: editingTaskId, ...taskForm, historyjkaId: +taskForm.historyjkaId });
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
    if (isReadOnly) return;
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
    if (isReadOnly) return;
    TaskAPI.delete(id);
    loadTasks(activeProject);
  };
  const assignUser = (t, uid) => {
    if (isReadOnly) return;
    TaskAPI.update({ ...t, odpowiedzialny: uid, stan: 'doing', dataStartu: new Date().toISOString() });
    loadTasks(activeProject);
  };
  const completeTask = t => {
    if (isReadOnly || !t.odpowiedzialny) return;
    TaskAPI.update({ ...t, stan: 'done', dataZakonczenia: new Date().toISOString() });
    loadTasks(activeProject);
  };

  const todoStories = stories.filter(s => s.stan === 'todo');
  const doingStories = stories.filter(s => s.stan === 'doing');
  const doneStories = stories.filter(s => s.stan === 'done');
  const tasksTodo = tasks.filter(t => t.stan === 'todo');
  const tasksDoing = tasks.filter(t => t.stan === 'doing');
  const tasksDone = tasks.filter(t => t.stan === 'done');

  return (
    <div className="drawer drawer-mobile">
      <input id="dashboard-drawer" type="checkbox" className="drawer-toggle"/>
      <div className="drawer-content bg-base-200 min-h-screen">
        <div className="container mx-auto max-w-4xl p-4 lg:p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl lg:text-3xl font-bold">MANAGMe</h1>
            <ThemeToggle/>
          </div>

          {/* Projekty */}
          <div className="card bg-base-100 shadow rounded-2xl">
            <div className="card-body p-4 lg:p-6 space-y-4">
              <h2 className="text-lg lg:text-xl font-semibold">Projekty</h2>
              {!isReadOnly && (
                <form onSubmit={handleProjectSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
                  <input type="text" placeholder="Nazwa projektu" className="input input-bordered w-full" value={projectForm.nazwa} onChange={e => setProjectForm({...projectForm,nazwa:e.target.value})} required/>
                  <textarea placeholder="Opis projektu" className="textarea textarea-bordered w-full" value={projectForm.opis} onChange={e => setProjectForm({...projectForm,opis:e.target.value})} required/>
                  <button type="submit" className="btn btn-primary w-full">{editingProjectId?'Zaktualizuj':'Dodaj'}</button>
                </form>
              )}
              <ul className="mt-4 space-y-2">
                {projects.map(p=>(
                  <li key={p.id} className="flex justify-between items-center bg-base-200 p-3 rounded-xl">
                    <div><h3 className="font-medium">{p.nazwa}</h3><p className="text-sm text-gray-500">{p.opis}</p></div>
                    {!isReadOnly&&(
                      <div className="flex gap-x-4">
                        <button className="btn btn-sm btn-outline" onClick={()=>handleProjectEdit(p)}>Edytuj</button>
                        <button className="btn btn-sm btn-error btn-outline" onClick={()=>handleProjectDelete(p.id)}>Usuń</button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Aktywny projekt */}
          <div className="card bg-base-100 shadow rounded-2xl">
            <div className="card-body p-4 lg:p-6">
              <h2 className="text-lg lg:text-xl font-semibold mb-2">Wybierz aktywny projekt</h2>
              <select className="select select-bordered w-full max-w-xs" value={activeProject?.id||''} onChange={handleActiveChange}>
                <option value="" disabled>-- wybierz projekt --</option>
                {projects.map(p=><option key={p.id} value={p.id}>{p.nazwa}</option>)}
              </select>
            </div>
          </div>

          {/* Historyjki & Zadania */}
          {activeProject && (
            <>
              <div className="card bg-base-100 shadow rounded-2xl">
                <div className="card-body p-4 lg:p-6 space-y-4">
                  <h2 className="text-lg lg:text-xl font-semibold">Historyjki dla: <em>{activeProject.nazwa}</em></h2>
                  {!isReadOnly && (
                    <form onSubmit={editingStoryId?handleStoryUpdate:handleStorySubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 lg:gap-4">
                      <input type="text" placeholder="Nazwa historyjki" className="input input-bordered w-full" value={storyForm.nazwa} onChange={e=>setStoryForm({...storyForm,nazwa:e.target.value})} required/>
                      <textarea placeholder="Opis historyjki" className="textarea textarea-bordered w-full" value={storyForm.opis} onChange={e=>setStoryForm({...storyForm,opis:e.target.value})} required/>
                      <select className="select select-bordered" value={storyForm.priorytet} onChange={e=>setStoryForm({...storyForm,priorytet:e.target.value})}>
                        <option value="niski">Niski</option>
                        <option value="średni">Średni</option>
                        <option value="wysoki">Wysoki</option>
                      </select>
                      <button type="submit" className="btn btn-primary w-full">{editingStoryId?'Zaktualizuj':'Dodaj'}</button>
                    </form>
                  )}
                  <div className="btn-group my-4">
                    {['all','todo','doing','done'].map(f=>(
                      <button key={f} className={`btn btn-sm ${storyFilter===f?'btn-primary':'btn-outline'}`} onClick={()=>setStoryFilter(f)}>
                        {f==='all'?'Wszystkie':f.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  {storyFilter==='all'?(
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[{title:'TO DO',data:todoStories},{title:'DOING',data:doingStories},{title:'DONE',data:doneStories}].map(col=>(
                        <div key={col.title} className="bg-base-200 p-4 rounded-xl">
                          <h4 className="font-semibold mb-2">{col.title}</h4>
                          <ul className="space-y-2">
                            {col.data.map(s=>(
                              <li key={s.id} className="bg-base-100 p-3 rounded-lg">
                                <h5 className="font-medium">{s.nazwa}</h5>
                                <p className="text-sm mb-2">{s.opis}</p>
                                {!isReadOnly&&(
                                  <div className="flex gap-2">
                                    <button className="btn btn-xs btn-outline" onClick={()=>handleStoryEdit(s)}>Edytuj</button>
                                    <button className="btn btn-xs btn-error btn-outline" onClick={()=>handleStoryDelete(s.id)}>Usuń</button>
                                    <select className="select select-xs select-bordered" value={s.stan} onChange={e=>handleStoryState(s,e.target.value)}>
                                      <option value="todo">TODO</option>
                                      <option value="doing">DOING</option>
                                      <option value="done">DONE</option>
                                    </select>
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ):(
                    <ul className="space-y-2">
                      {filteredStories.map(s=>(
                        <li key={s.id} className="bg-base-100 p-4 rounded-lg flex justify-between items-center">
                          <div><h5 className="font-medium">{s.nazwa}</h5><p className="text-sm">{s.opis}</p></div>
                          {!isReadOnly&&(
                            <div className="flex gap-2">
                              <button className="btn btn-xs btn-outline" onClick={()=>handleStoryEdit(s)}>Edytuj</button>
                              <button className="btn btn-xs btn-error btn-outline" onClick={()=>handleStoryDelete(s.id)}>Usuń</button>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="card bg-base-100 shadow rounded-2xl">
                <div className="card-body p-4 lg:p-6 space-y-4">
                  <h2 className="text-lg lg:text-xl font-semibold">Zadania (Kanban)</h2>
                  {!isReadOnly&&(
                    <form onSubmit={editingTaskId?handleTaskUpdate:handleTaskSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 lg:gap-4">
                      <input type="text" placeholder="Nazwa zadania" className="input input-bordered w-full" value={taskForm.nazwa} onChange={e=>setTaskForm({...taskForm,nazwa:e.target.value})} required/>
                      <textarea placeholder="Opis zadania" className="textarea textarea-bordered w-full" value={taskForm.opis} onChange={e=>setTaskForm({...taskForm,opis:e.target.value})} required/>
                      <input type="text" placeholder="Przewidywany czas (h)" className="input input-bordered w-full" value={taskForm.przewidywanyCzas} onChange={e=>setTaskForm({...taskForm,przewidywanyCzas:e.target.value})} required/>
                      <select className="select select-bordered w-full" value={taskForm.historyjkaId} onChange={e=>setTaskForm({...taskForm,historyjkaId:e.target.value})} required>
                        <option value="" disabled>-- wybierz historyjkę --</option>
                        {stories.map(s=><option key={s.id} value={s.id}>{s.nazwa}</option>)}
                      </select>
                      <select className="select select-bordered w-full" value={taskForm.priorytet} onChange={e=>setTaskForm({...taskForm,priorytet:e.target.value})}>
                        <option value="niski">Niski</option>
                        <option value="średni">Średni</option>
                        <option value="wysoki">Wysoki</option>
                      </select>
                      <button type="submit" className="btn btn-primary w-full md:col-span-2">{editingTaskId?'Zaktualizuj':'Dodaj'}</button>
                    </form>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[{title:'TODO',data:tasksTodo},{title:'DOING',data:tasksDoing},{title:'DONE',data:tasksDone}].map(col=>(
                      <div key={col.title} className="bg-base-200 p-4 rounded-xl">
                        <h4 className="font-semibold mb-2">{col.title}</h4>
                        <ul className="space-y-2">
                          {col.data.map(t=>(
                            <li key={t.id} className="bg-base-100 p-3 rounded-lg">
                              <h5 className="font-medium">{t.nazwa}</h5>
                              <p className="text-sm mb-1">{t.opis}</p>
                              {col.title==='TODO'&&!isReadOnly&&(
                                <div className="flex flex-col gap-2 mb-2">
                                  <p className="text-xs">Dodano: {t.dataDodania}</p>
                                  <p className="text-xs">Przewidywany: {t.przewidywanyCzas}h</p>
                                  <select className="select select-xs select-bordered" defaultValue="" onChange={e=>assignUser(t,+e.target.value)}>
                                    <option value="" disabled>Przypisz</option>
                                    {users.filter(u=>u.rola!=='admin').map(u=><option key={u.id} value={u.id}>{u.imie} {u.nazwisko} ({u.rola})</option>)}
                                  </select>
                                  <button className="btn btn-xs btn-success mt-1" onClick={()=>completeTask(t)}>Zakończ</button>
                                </div>
                              )}
                              {!isReadOnly&&col.title!=='TODO'&&(
                                <div className="flex gap-x-2">
                                  <button className="btn btn-xs btn-outline" onClick={()=>handleTaskEdit(t)}>Edytuj</button>
                                  <button className="btn btn-xs btn-error btn-outline" onClick={()=>handleTaskDelete(t.id)}>Usuń</button>
                                </div>
                              )}
                              {t.odpowiedzialny&&<p className="text-xs mt-1">Przypisany: {users.find(u=>u.id===t.odpowiedzialny)?.imie} {users.find(u=>u.id===t.odpowiedzialny)?.nazwisko}</p>}
                              {t.dataStartu&&<p className="text-xs">Start: {t.dataStartu}</p>}
                              {t.dataZakonczenia&&<p className="text-xs">Zakończono: {t.dataZakonczenia}</p>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="drawer-side">
        <label htmlFor="dashboard-drawer" className="drawer-overlay"/>
        <ul className="menu p-4 w-56 bg-base-100">
          <li><a>Projekty</a></li>
          {activeProject && <li><a>Historyjki</a></li>}
          {activeProject && <li><a>Zadania</a></li>}
        </ul>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, login, loading, logout } = useContext(AuthContext);
  const onLoginSuccess = ({ token, refreshToken }) => login(token, refreshToken);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Ładowanie…</div>;

  return (
    <>
      <Navbar user={user} onLogout={logout}/>
      <main className="min-h-screen flex items-center justify-center bg-gray-300">
        {!user ? (
          <div className="space-y-6">
            <LoginForm onLoginSuccess={onLoginSuccess}/>
            <div className="text-center opacity-70">— lub —</div>
            <GoogleLoginButton/>
          </div>
        ) : <Dashboard/>}
      </main>
      {user && <Footer/>}
    </>
  );
}

export default function AppWrapper() {
  return (
    <AuthProvider>
      <AppContent/>
    </AuthProvider>
  );
}