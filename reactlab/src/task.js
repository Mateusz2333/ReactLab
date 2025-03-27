class TaskAPI {
    constructor() {
        this.storageKey = 'tasks';
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify([]));
        }
    }
    getAll() {
        return JSON.parse(localStorage.getItem(this.storageKey)) || [];
    }
    getById(id) {
        return this.getAll().find((task) => task.id === id);
    }
   create(task) {
    const tasks = this.getAll();
    tasks.push(task);
    localStorage.setItem(this.storageKey, JSON.stringify(tasks));
    return task;
   }
   update(updatedTask) {
    const tasks = this.getAll();
    const index = tasks.findIndex((t) => t.id === updatedTask.id);
    if (index !== -1) {
        tasks[index] = updatedTask;
        localStorage.setItem(this.storageKey, JSON.stringify(tasks));
        return updatedTask;
    }
    return null;
   }
   delete(id) {
    const tasks = this.getAll().filter((t) => t.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(tasks));
   }
   
   
}

export default new TaskAPI();