// Simplified Firestore Service
import { firebaseUtils } from './firebase-config.js';
import { Task, PendingApproval, SimpleFirestoreService as ISimpleFirestoreService } from './firebase-types.js';

export class SimpleFirestoreService implements ISimpleFirestoreService {
  private db: any;
  private initialized: boolean = false;
  private initPromise: Promise<boolean>;

  constructor() {
    this.db = null;
    this.initialized = false;
    this.initPromise = this.initialize();
  }

  async initialize(): Promise<boolean> {
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

  getCurrentWeekNumber(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + start.getDay() + 1) / 7);
    console.log('📅 FirestoreService week calculation - Date:', now, 'Start of year:', start, 'Days since start:', days, 'Start day of year:', start.getDay(), 'Calculated week:', weekNumber);
    return weekNumber;
  }

  async addTask(task: Omit<Task, 'id'>): Promise<Task> {
    await this.initPromise;
    
    if (!this.initialized) {
      throw new Error('Firebase not initialized');
    }

    try {
      console.log('📝 Adding task to Firestore:', task);
      
      // Store in hierarchical structure: years/{year}/weeks/{week}/tasks/{taskId}
      const year = task.year || new Date().getFullYear();
      const week = task.week || this.getCurrentWeekNumber();
      
      const taskData = {
        ...task,
        year: year,
        week: week,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await firebaseUtils.addDoc(
        firebaseUtils.collection(this.db, `years/${year}/weeks/${week}/tasks`), 
        taskData
      );
      
      console.log('✅ Task added successfully with ID:', docRef.id);
      return { id: docRef.id, ...taskData, year, week };
    } catch (error) {
      console.error('❌ Error adding task to Firestore:', error);
      throw error;
    }
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<boolean> {
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
      
      const docRef = firebaseUtils.doc(this.db, `years/${task.year}/weeks/${task.week}/tasks`, taskId);
      await firebaseUtils.updateDoc(docRef, {
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

  async deleteTask(taskId: string): Promise<boolean> {
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
      
      const docRef = firebaseUtils.doc(this.db, `years/${task.year}/weeks/${task.week}/tasks`, taskId);
      await firebaseUtils.deleteDoc(docRef);
      
      console.log('✅ Task deleted successfully');
      return true;
    } catch (error) {
      console.error('❌ Error deleting task from Firestore:', error);
      throw error;
    }
  }

  async findTaskInHierarchy(taskId: string): Promise<(Task & { year: number; week: number }) | null> {
    // First, try to find the task in the current week (most common case)
    const currentYear = new Date().getFullYear();
    const currentWeek = this.getCurrentWeekNumber();
    
    try {
      const tasks = await this.getTasksForWeek(currentYear, currentWeek);
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        // Use the year and week from the task data if available
        const year = task.year || currentYear;
        const week = task.week || currentWeek;
        return { ...task, year, week };
      }
    } catch (error) {
      console.log('Task not found in current week, searching more broadly...');
    }
    
    // If not found, try to search in other weeks of the current year
    // This is a simplified search - in production you'd want a more comprehensive approach
    console.warn(`Task ${taskId} not found in current week. This might be a data consistency issue.`);
    return null;
  }

  async getTasksForWeek(year: number, week: number): Promise<Task[]> {
    try {
      const tasksRef = firebaseUtils.collection(this.db, `years/${year}/weeks/${week}/tasks`);
      const snapshot = await firebaseUtils.getDocs(tasksRef);
      return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Task));
    } catch (error) {
      console.error('❌ Error getting tasks for week:', error);
      return [];
    }
  }

  async subscribeToTasks(callback: (tasks: Task[]) => void): Promise<void> {
    await this.initPromise;
    
    if (!this.initialized) {
      throw new Error('Firebase not initialized');
    }

    try {
      // Subscribe to current year and week only for now
      const year = new Date().getFullYear();
      const week = this.getCurrentWeekNumber();
      
      console.log('📡 Setting up task subscription for year:', year, 'week:', week);
      console.log('📡 Collection path: years/${year}/weeks/${week}/tasks');
      
      const tasksRef = firebaseUtils.collection(this.db, `years/${year}/weeks/${week}/tasks`);
      console.log('📡 Tasks reference created:', tasksRef);
      
      firebaseUtils.onSnapshot(tasksRef, (snapshot: any) => {
        console.log('📡 Firestore snapshot received:', snapshot);
        console.log('📡 Snapshot size:', snapshot.size);
        console.log('📡 Snapshot empty:', snapshot.empty);
        console.log('📡 Snapshot docs:', snapshot.docs);
        
        const tasks = snapshot.docs.map((doc: any) => {
          const taskData = { id: doc.id, ...doc.data() };
          console.log('📡 Mapped task:', taskData);
          return taskData as Task;
        });
        
        console.log('📡 Final tasks array:', tasks);
        callback(tasks);
      }, (error: any) => {
        console.error('❌ Firestore subscription error:', error);
      });
    } catch (error) {
      console.error('❌ Error setting up task subscription:', error);
      throw error;
    }
  }

  async subscribeToTasksForWeek(year: number, week: number, callback: (tasks: Task[]) => void): Promise<void> {
    await this.initPromise;
    
    if (!this.initialized) {
      throw new Error('Firebase not initialized');
    }

    try {
      console.log('📡 Setting up task subscription for year:', year, 'week:', week);
      console.log('📡 Collection path: years/${year}/weeks/${week}/tasks');
      
      const tasksRef = firebaseUtils.collection(this.db, `years/${year}/weeks/${week}/tasks`);
      console.log('📡 Tasks reference created:', tasksRef);
      
      firebaseUtils.onSnapshot(tasksRef, (snapshot: any) => {
        console.log('📡 Firestore snapshot received for week', week, ':', snapshot);
        console.log('📡 Snapshot size:', snapshot.size);
        console.log('📡 Snapshot empty:', snapshot.empty);
        console.log('📡 Snapshot docs:', snapshot.docs);
        
        const tasks = snapshot.docs.map((doc: any) => {
          const taskData = { id: doc.id, ...doc.data() };
          console.log('📡 Mapped task from week', week, ':', taskData);
          return taskData as Task;
        });
        
        console.log('📡 Final tasks array for week', week, ':', tasks);
        callback(tasks);
      }, (error: any) => {
        console.error('❌ Firestore subscription error for week', week, ':', error);
      });
    } catch (error) {
      console.error('❌ Error setting up task subscription for week', week, ':', error);
      throw error;
    }
  }

  async addPendingApproval(approval: Omit<PendingApproval, 'id'>): Promise<PendingApproval> {
    await this.initPromise;
    
    if (!this.initialized) {
      throw new Error('Firebase not initialized');
    }

    try {
      console.log('📝 Adding pending approval to Firestore:', approval);
      
      const docRef = await firebaseUtils.addDoc(
        firebaseUtils.collection(this.db, 'pendingApprovals'), 
        { ...approval, createdAt: new Date() }
      );
      
      console.log('✅ Pending approval added successfully with ID:', docRef.id);
      return { id: docRef.id, ...approval };
    } catch (error) {
      console.error('❌ Error adding pending approval to Firestore:', error);
      throw error;
    }
  }

  async removePendingApproval(approvalId: string): Promise<boolean> {
    await this.initPromise;
    
    if (!this.initialized) {
      throw new Error('Firebase not initialized');
    }

    try {
      console.log('📝 Removing pending approval from Firestore:', approvalId);
      
      const docRef = firebaseUtils.doc(this.db, 'pendingApprovals', approvalId);
      await firebaseUtils.deleteDoc(docRef);
      
      console.log('✅ Pending approval removed successfully');
      return true;
    } catch (error) {
      console.error('❌ Error removing pending approval from Firestore:', error);
      throw error;
    }
  }

  async subscribeToPendingApprovals(callback: (approvals: PendingApproval[]) => void): Promise<void> {
    await this.initPromise;
    
    if (!this.initialized) {
      throw new Error('Firebase not initialized');
    }

    try {
      const approvalsRef = firebaseUtils.collection(this.db, 'pendingApprovals');
      firebaseUtils.onSnapshot(approvalsRef, (snapshot: any) => {
        const approvals = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as PendingApproval));
        callback(approvals);
      });
    } catch (error) {
      console.error('❌ Error setting up pending approvals subscription:', error);
      throw error;
    }
  }

  async updatePoints(simonPoints: number, noahPoints: number): Promise<boolean> {
    await this.initPromise;
    
    if (!this.initialized) {
      throw new Error('Firebase not initialized');
    }

    try {
      console.log('📝 Updating points in Firestore:', { simonPoints, noahPoints });
      
      const pointsRef = firebaseUtils.doc(this.db, 'points', 'current');
      await firebaseUtils.setDoc(pointsRef, {
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

  async testConnection(): Promise<boolean> {
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
      
      const docRef = await firebaseUtils.addDoc(
        firebaseUtils.collection(this.db, 'test'), 
        testDoc
      );
      
      console.log('✅ Test document created with ID:', docRef.id);
      
      // Clean up
      await firebaseUtils.deleteDoc(
        firebaseUtils.doc(this.db, 'test', docRef.id)
      );
      
      console.log('✅ Test document deleted');
      return true;
    } catch (error) {
      console.error('❌ Firestore connection test failed:', error);
      return false;
    }
  }
}

// Make available globally for compatibility
window.SimpleFirestoreService = SimpleFirestoreService;
console.log('SimpleFirestoreService class defined and available globally');

// Signal that the Firebase service is ready
window.firestoreServiceReady = true;
console.log('Firestore service ready flag set');
