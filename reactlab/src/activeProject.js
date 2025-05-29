class ActiveProject {
  constructor() {
    this.project = null;
  }

  get() {
    return this.project;
  }

  set(project) {
    this.project = project;
  }

  clear() {
    this.project = null;
  }
}

export default new ActiveProject();
