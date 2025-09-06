// Simplified Firestore Service for debugging
console.log('Loading firestore-simple.js...');

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

  getCurrentWeekNumber() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - start) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + start.getDay() + 1) / 7);
  }

  async addTask(task) {
    await this.initPromise;
    
    if (!this.initialized) {
      throw new Error('Firebase not initialized');
    }

    try {
      console.log('📝 Adding task to Firestore:', task);
      
      const taskData = {
        ...task,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Store in hierarchical structure: years/{year}/weeks/{week}/tasks/{taskId}
      const year = task.year || new Date().getFullYear();
      const week = task.week || this.getCurrentWeekNumber();
      
      const docRef = await window.firebase.addDoc(
        window.firebase.collection(this.db, `years/${year}/weeks/${week}/tasks`), 
        taskData
      );
      
      console.log('✅ Task added successfully with ID:', docRef.id);
      return { id: docRef.id, ...taskData };
    } catch (error) {
      console.error('❌ Error adding task to Firestore:', error);
      throw error;
    }
  }


  async updateTask(taskId, updates) {
    await this.initPromise;
    
    if (!this.initialized) {
      throw new Error('Firebase not initialized');
    }

    try {
      console.log('📝 Updating task in Firestore:', taskId, updates);
      
      // Find the task in the hierarchical structure
      const task = await this.findTaskInHierarchy(taskId);
      if (!task) {
        console.error('❌ Task not found:', taskId);
        return false;
      }
      
      const docRef = window.firebase.doc(this.db, `years/${task.year}/weeks/${task.week}/tasks`, taskId);
      await window.firebase.updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
      
      console.log('✅ Task updated successfully');
      return true;
    } catch (error) {
      console.error('❌ Error updating task in Firestore:', error);
      throw error;
    }
  }


  async deleteTask(taskId) {
    await this.initPromise;
    
    if (!this.initialized) {
      throw new Error('Firebase not initialized');
    }

    try {
      console.log('📝 Deleting task from Firestore:', taskId);
      
      // Find the task in the hierarchical structure
      const task = await this.findTaskInHierarchy(taskId);
      if (!task) {
        console.error('❌ Task not found:', taskId);
        return false;
      }
      
      const docRef = window.firebase.doc(this.db, `years/${task.year}/weeks/${task.week}/tasks`, taskId);
      await window.firebase.deleteDoc(docRef);
      
      console.log('✅ Task deleted successfully');
      return true;
    } catch (error) {
      console.error('❌ Error deleting task from Firestore:', error);
      throw error;
    }
  }


  async findTaskInHierarchy(taskId) {
    // This is a simplified version - in a real app you'd want to query more efficiently
    const years = await this.getAllYears();
    for (const year of years) {
      const weeks = await this.getWeeksForYear(year);
      for (const week of weeks) {
        const tasks = await this.getTasksForWeek(year, week);
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          return { ...task, year, week };
        }
      }
    }
    return null;
  }

  async getAllYears() {
    // This would need to be implemented based on your Firestore structure
    // For now, return current year
    return [new Date().getFullYear()];
  }

  async getWeeksForYear(year) {
    // This would need to be implemented based on your Firestore structure
    // For now, return current week
    return [this.getCurrentWeekNumber()];
  }

  async getTasksForWeek(year, week) {
    try {
      const tasksRef = window.firebase.collection(this.db, `years/${year}/weeks/${week}/tasks`);
      const snapshot = await window.firebase.getDocs(tasksRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('❌ Error getting tasks for week:', error);
      return [];
    }
  }

  async subscribeToTasks(callback) {
    await this.initPromise;
    
    if (!this.initialized) {
      throw new Error('Firebase not initialized');
    }

    try {
      // Subscribe to all tasks across all years and weeks
      const years = await this.getAllYears();
      const allTasks = [];
      
      for (const year of years) {
        const weeks = await this.getWeeksForYear(year);
        for (const week of weeks) {
          const tasksRef = window.firebase.collection(this.db, `years/${year}/weeks/${week}/tasks`);
          window.firebase.onSnapshot(tasksRef, (snapshot) => {
            const weekTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Update the specific week's tasks and trigger callback with all tasks
            this.updateTasksForWeek(year, week, weekTasks);
            callback(this.getAllTasksFromHierarchy());
          });
        }
      }
    } catch (error) {
      console.error('❌ Error setting up task subscription:', error);
      throw error;
    }
  }


  updateTasksForWeek(year, week, tasks) {
    // This would update an internal cache of tasks by year/week
    // Implementation depends on your specific needs
  }

  getAllTasksFromHierarchy() {
    // This would return all tasks from the hierarchical structure
    // Implementation depends on your specific needs
    return [];
  }

  async addPendingApproval(approval) {
    await this.initPromise;
    
    if (!this.initialized) {
      throw new Error('Firebase not initialized');
    }

    try {
      console.log('📝 Adding pending approval to Firestore:', approval);
      
      const docRef = await window.firebase.addDoc(
        window.firebase.collection(this.db, 'pendingApprovals'), 
        { ...approval, createdAt: new Date() }
      );
      
      console.log('✅ Pending approval added successfully with ID:', docRef.id);
      return { id: docRef.id, ...approval };
    } catch (error) {
      console.error('❌ Error adding pending approval to Firestore:', error);
      throw error;
    }
  }


  async removePendingApproval(approvalId) {
    await this.initPromise;
    
    if (!this.initialized) {
      throw new Error('Firebase not initialized');
    }

    try {
      console.log('📝 Removing pending approval from Firestore:', approvalId);
      
      const docRef = window.firebase.doc(this.db, 'pendingApprovals', approvalId);
      await window.firebase.deleteDoc(docRef);
      
      console.log('✅ Pending approval removed successfully');
      return true;
    } catch (error) {
      console.error('❌ Error removing pending approval from Firestore:', error);
      throw error;
    }
  }


  async subscribeToPendingApprovals(callback) {
    await this.initPromise;
    
    if (!this.initialized) {
      throw new Error('Firebase not initialized');
    }

    try {
      const approvalsRef = window.firebase.collection(this.db, 'pendingApprovals');
      window.firebase.onSnapshot(approvalsRef, (snapshot) => {
        const approvals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(approvals);
      });
    } catch (error) {
      console.error('❌ Error setting up pending approvals subscription:', error);
      throw error;
    }
  }


  async updatePoints(simonPoints, noahPoints) {
    await this.initPromise;
    
    if (!this.initialized) {
      throw new Error('Firebase not initialized');
    }

    try {
      console.log('📝 Updating points in Firestore:', { simonPoints, noahPoints });
      
      const pointsRef = window.firebase.doc(this.db, 'points', 'current');
      await window.firebase.setDoc(pointsRef, {
        simonPoints,
        noahPoints,
        updatedAt: new Date()
      }, { merge: true });
      
      console.log('✅ Points updated successfully');
      return true;
    } catch (error) {
      console.error('❌ Error updating points in Firestore:', error);
      throw error;
    }
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
console.log('SimpleFirestoreService class defined and available globally');

// Signal that the Firebase service is ready
window.firestoreServiceReady = true;
console.log('Firestore service ready flag set');
