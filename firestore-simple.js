// Simplified Firestore Service for debugging
class SimpleFirestoreService {
  constructor() {
    this.db = null;
    this.initialized = false;
    this.initPromise = this.initialize();
  }

  async initialize() {
    console.log('🔄 Initializing Firestore...');
    
    // Wait for Firebase to be available
    let attempts = 0;
    while (!window.firebase && attempts < 100) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    if (window.firebase) {
      this.db = window.firebase.db;
      this.initialized = true;
      console.log('✅ Firebase initialized successfully');
      return true;
    } else {
      console.error('❌ Firebase failed to initialize after 10 seconds');
      return false;
    }
  }

  async addTask(task) {
    await this.initPromise;
    
    if (!this.initialized) {
      console.log('Firebase not ready, using localStorage');
      return this.addTaskOffline(task);
    }

    try {
      console.log('📝 Adding task to Firestore:', task);
      
      const taskData = {
        ...task,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await window.firebase.addDoc(
        window.firebase.collection(this.db, 'tasks'), 
        taskData
      );
      
      console.log('✅ Task added successfully with ID:', docRef.id);
      return { id: docRef.id, ...taskData };
    } catch (error) {
      console.error('❌ Error adding task to Firestore:', error);
      return this.addTaskOffline(task);
    }
  }

  addTaskOffline(task) {
    console.log('💾 Adding task to localStorage');
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const newTask = { ...task, id: Date.now().toString() };
    tasks.push(newTask);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    return newTask;
  }

  async testConnection() {
    await this.initPromise;
    
    if (!this.initialized) {
      console.log('❌ Firebase not initialized');
      return false;
    }

    try {
      console.log('🧪 Testing Firestore connection...');
      
      const testDoc = {
        test: true,
        timestamp: new Date().toISOString(),
        message: 'Connection test from weekly-chores app'
      };
      
      const docRef = await window.firebase.addDoc(
        window.firebase.collection(this.db, 'test'), 
        testDoc
      );
      
      console.log('✅ Test document created with ID:', docRef.id);
      
      // Clean up
      await window.firebase.deleteDoc(
        window.firebase.doc(this.db, 'test', docRef.id)
      );
      
      console.log('✅ Test document deleted');
      return true;
    } catch (error) {
      console.error('❌ Firestore connection test failed:', error);
      return false;
    }
  }
}

// Make available globally
window.SimpleFirestoreService = SimpleFirestoreService;
