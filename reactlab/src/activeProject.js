class ActiveProject {
    constructor() {
      this.storageKey = 'activeProject';
    }
    get() {
      return JSON.parse(localStorage.getItem(this.storageKey)) || null;
    }
    set(project) {
      localStorage.setItem(this.storageKey, JSON.stringify(project));
    }
    clear() {
      localStorage.removeItem(this.storageKey);
    }
  }
  
  export default new ActiveProject();
  