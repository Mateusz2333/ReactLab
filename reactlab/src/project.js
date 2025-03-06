class ProjectAPI {
    constructor() {
      this.storageKey = 'projects';
      if (!localStorage.getItem(this.storageKey)) {
        localStorage.setItem(this.storageKey, JSON.stringify([]));
      }
    }
  
    getAll() {
      return JSON.parse(localStorage.getItem(this.storageKey)) || [];
    }
  
    getById(id) {
      return this.getAll().find((project) => project.id === id);
    }
  
    create(project) {
      const projects = this.getAll();
      projects.push(project);
      localStorage.setItem(this.storageKey, JSON.stringify(projects));
      return project;
    }
  
    update(updatedProject) {
      const projects = this.getAll();
      const index = projects.findIndex((p) => p.id === updatedProject.id);
      if (index !== -1) {
        projects[index] = updatedProject;
        localStorage.setItem(this.storageKey, JSON.stringify(projects));
        return updatedProject;
      }
      return null;
    }
  
    delete(id) {
      const projects = this.getAll().filter((p) => p.id !== id);
      localStorage.setItem(this.storageKey, JSON.stringify(projects));
    }
  }
  
  export default new ProjectAPI();
  