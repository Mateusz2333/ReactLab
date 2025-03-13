class StoryAPI {
    constructor() {
      this.storageKey = 'stories';
      if (!localStorage.getItem(this.storageKey)) {
        localStorage.setItem(this.storageKey, JSON.stringify([]));
      }
    }
  
    getAll() {
      return JSON.parse(localStorage.getItem(this.storageKey)) || [];
    }
  
    getById(id) {
      return this.getAll().find((story) => story.id === id);
    }
  
    create(story) {
      const stories = this.getAll();
      stories.push(story);
      localStorage.setItem(this.storageKey, JSON.stringify(stories));
      return story;
    }
  
    update(updatedStory) {
      const stories = this.getAll();
      const index = stories.findIndex((s) => s.id === updatedStory.id);
      if (index !== -1) {
        stories[index] = updatedStory;
        localStorage.setItem(this.storageKey, JSON.stringify(stories));
        return updatedStory;
      }
      return null;
    }
  
    delete(id) {
      const stories = this.getAll().filter((s) => s.id !== id);
      localStorage.setItem(this.storageKey, JSON.stringify(stories));
    }
  }
  
  export default new StoryAPI();
  