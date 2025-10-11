// Main Vue.js App for Weekly Chores
// @ts-ignore - Vue from CDN
import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
// Shared Calendar Component
const CalendarView = {
    props: ['mode'],
    mounted() {
        // Calendar component mounted
    },
    template: `
    <div class="calendar">
      <div v-for="day in weekDays" :key="day.name" 
           :class="['calendar-day', { 'current-day': day.name === currentDayName }]">
        <div class="day-header">
          <h3>{{ day.name }}</h3>
          <div class="day-points"><span class="star">🪙</span> {{ getDayPoints(day.name) }}</div>
        </div>
        <div class="day-tasks">
          <div v-for="task in getDayTasks(day.name)" :key="task.id" 
               :data-task-id="task.id"
               :class="['task-card', mode === 'admin' ? 'admin' : '', { 
                   'task-completed': task.completed, 
                   'task-approved': task.approved,
                   'task-pending': task.completed && !task.approved
               }]">
            
            <!-- Edit mode: Show edit form -->
            <div v-if="$parent.editingTaskId === task.id" class="task-creation-form">
              <input v-model="$parent.editingTaskTitle" placeholder="Oppgavetittel" class="task-title-input">
              <div class="stars-selection">
                <button v-for="star in 5" :key="star" 
                        @click="$parent.selectEditStars(star)"
                        :class="['star-btn', { 'selected': $parent.editingTaskStars >= star }]">
                  <span class="star">🪙</span>
                </button>
              </div>
              <div class="task-form-actions">
                <button @click="$parent.cancelTaskEdit" class="cancel-btn">❌</button>
                <button @click="$parent.saveTaskEdit(task)" class="save-btn">💾</button>
              </div>
            </div>
            
            <!-- Normal mode: Show task content -->
            <div v-else>
              <div class="task-title">
                {{ task.title }}
                <span v-if="$parent.isTaskRecurring(task)" class="recurring-indicator" title="Gjentakende oppgave">🔄</span>
              </div>
              <div class="task-points"><span class="star">🪙</span> {{ task.points }}</div>
              
              <!-- Overview mode: Complete buttons (Simon/Noah) -->
              <div v-if="mode === 'overview' && !task.completed" class="complete-buttons">
                <button @click="completeTask(task, 'Simon')" class="complete-btn simon-bg">Simon</button>
                <button @click="completeTask(task, 'Noah')" class="complete-btn noah-bg">Noah</button>
              </div>
              
              <!-- Overview mode: Pending approval info -->
              <div v-else-if="mode === 'overview' && task.completed && !task.approved" class="pending-info">
                <span class="pending-by">⏳</span>
                <span class="pending-time">{{ formatTime(task.completedAt) }}</span>
              </div>
              
              <!-- Overview mode: Completed info -->
              <div v-else-if="mode === 'overview' && task.completed && task.approved" class="completed-info">
                <span class="completed-by">{{ task.completedBy }}</span>
                <span class="completed-time">{{ formatTime(task.completedAt) }}</span>
              </div>
              
              <!-- Admin mode: Edit/Delete buttons -->
              <div v-else-if="mode === 'admin' && !task.approved" class="task-actions">
                <button @click="editTask(task)" class="edit-btn">✏️</button>
                <button @click="deleteTask(task.id)" class="delete-btn">🗑️</button>
              </div>
              
              <!-- Both modes: Approved info -->
              <div v-else class="approved-info">
                <span class="approved-by">✅ Godkjent for {{ task.completedBy }}</span>
                <span class="approved-time">{{ formatTime(task.approvedAt) }}</span>
              </div>
            </div>
          </div>
          
          <!-- Inline task creation form -->
          <div v-if="mode === 'admin' && $parent.creatingTaskForDay === day.name" class="task-creation-form">
            <input v-model="$parent.newTaskTitle" placeholder="Oppgavetittel" class="task-title-input">
            <div class="stars-selection">
              <button v-for="star in 5" :key="star" 
                      @click="selectStars(star)"
                      :class="['star-btn', { 'selected': $parent.newTaskStars >= star }]">
                <span class="star">🪙</span>
              </button>
            </div>
            <div class="task-form-actions">
              <button @click="cancelTaskCreation" class="cancel-btn">❌</button>
              <button @click="saveNewTask(day.name)" class="save-btn">💾</button>
            </div>
          </div>
          
          <!-- Admin mode: Add task button at bottom of each day -->
          <div v-if="mode === 'admin' && $parent.creatingTaskForDay !== day.name" class="day-add-task">
            <button @click.stop="startTaskCreation(day.name)" class="add-task-day-btn" title="Legg til oppgave">
              ➕
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
    methods: {
        getDayTasks(dayName) {
            const dayTasks = this.$parent.getTasksForDay(dayName);
            // Sort so that incomplete tasks come first, completed tasks last
            return dayTasks.sort((a, b) => {
                // If one is completed and the other is not, completed goes last
                if (a.completed && !b.completed)
                    return 1;
                if (!a.completed && b.completed)
                    return -1;
                // If both are completed, sort by approval status (approved last)
                if (a.completed && b.completed) {
                    if (a.approved && !b.approved)
                        return 1;
                    if (!a.approved && b.approved)
                        return -1;
                }
                return 0;
            });
        },
        getDayPoints(dayName) {
            const dayTasks = this.getDayTasks(dayName);
            return dayTasks.reduce((total, task) => {
                // Only count approved tasks (not pending approval)
                return task.approved ? total + task.points : total;
            }, 0);
        },
        completeTask(task, childName) {
            this.$parent.completeTask(task, childName);
        },
        editTask(task) {
            this.$parent.editTask(task);
        },
        deleteTask(taskId) {
            this.$parent.deleteTask(taskId);
        },
        startTaskCreation(dayName) {
            this.$parent.creatingTaskForDay = dayName;
            this.$parent.newTaskTitle = "";
            this.$parent.newTaskStars = 1;
        },
        selectStars(stars) {
            this.$parent.newTaskStars = stars;
        },
        saveNewTask(dayName) {
            this.$parent.saveNewTask(dayName);
        },
        cancelTaskCreation() {
            this.$parent.cancelTaskCreation();
        },
        formatTime(date) {
            return this.$parent.formatTime(date);
        }
    },
    computed: {
        weekDays() {
            return this.$parent.weekDays;
        },
        currentDayName() {
            return this.$parent.currentDayName;
        }
    }
};
// Main Vue App
const app = createApp({
    components: {
        CalendarView
    },
    data() {
        return {
            // PIN Code
            PIN_CODE: "5300",
            // Firestore Service
            firestoreService: null,
            // UI State
            activeTab: "oversikt",
            showCelebration: false,
            // Inline task creation
            creatingTaskForDay: null,
            newTaskTitle: "",
            newTaskStars: 1,
            // Inline editing
            editingTaskId: null,
            editingTaskTitle: "",
            editingTaskStars: 1,
            // Celebration
            celebrationPoints: 0,
            celebrationChild: "",
            // Tabs with icons and badges
            tabs: [
                { id: "oversikt", name: "Kalender", icon: "📅" },
                { id: "poeng", name: "Poeng", icon: "🏆" },
                { id: "godkjenninger", name: "Godkjenninger", icon: "✅", badge: 0 },
                { id: "oppgaver", name: "Oppgaver", icon: "📝" }
            ],
            // Week days
            weekDays: [
                { name: "Mandag" },
                { name: "Tirsdag" },
                { name: "Onsdag" },
                { name: "Torsdag" },
                { name: "Fredag" },
                { name: "Lørdag" },
                { name: "Søndag" }
            ],
            // Points tracking
            simonPoints: 0,
            noahPoints: 0,
            // Animation control
            skipAutoRecalculate: false,
            // Hierarchical data structure: Year > Week > Day > Tasks
            tasksByYear: {},
            // Pending approvals
            pendingApprovals: [],
            // Recurring tasks
            recurringTasks: [],
            creatingRecurringTask: false,
            newRecurringTaskTitle: "",
            newRecurringTaskDay: "Mandag",
            newRecurringTaskStars: 1,
            // Task form for add/edit
            taskForm: {
                id: null,
                title: "",
                points: 1,
                day: "Mandag"
            },
        };
    },
    computed: {
        // Update tab badges
        updatedTabs() {
            return this.tabs.map((tab) => {
                if (tab.id === 'godkjenninger') {
                    return { ...tab, badge: this.pendingApprovals.length };
                }
                return tab;
            });
        },
        // Get current day name in Norwegian
        currentDayName() {
            const today = new Date();
            const dayNames = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
            return dayNames[today.getDay()];
        }
    },
    methods: {
        // Helper methods for hierarchical data structure
        getCurrentYear() {
            return new Date().getFullYear();
        },
        getCurrentWeekNumber() {
            const now = new Date();
            const start = new Date(now.getFullYear(), 0, 1);
            const days = Math.floor((now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
            const weekNumber = Math.ceil((days + start.getDay() + 1) / 7);
            return weekNumber;
        },
        getWeekNumber(date) {
            const start = new Date(date.getFullYear(), 0, 1);
            const days = Math.floor((date.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
            return Math.ceil((days + start.getDay() + 1) / 7);
        },
        getTasksForCurrentWeek() {
            const year = this.getCurrentYear();
            const week = this.getCurrentWeekNumber();
            const weekTasks = this.getTasksForWeek(year, week);
            // Add recurring tasks for the current week, but only if no duplicated task exists
            const recurringTasks = this.recurringTasks || [];
            const currentWeekRecurringTasks = [];
            for (const recurringTask of recurringTasks) {
                // Check if there's already a task in this week that references this recurring task
                const hasDuplicatedTask = weekTasks.some(task => task.recurringTaskId === recurringTask.id);
                // Only add the recurring task if no duplicated task exists
                if (!hasDuplicatedTask) {
                    currentWeekRecurringTasks.push({
                        id: `recurring-${recurringTask.id}-${year}-${week}`,
                        title: recurringTask.title,
                        points: recurringTask.points,
                        day: recurringTask.day,
                        completed: false,
                        approved: false,
                        year: year,
                        week: week,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                }
            }
            return [...weekTasks, ...currentWeekRecurringTasks];
        },
        getTasksForWeek(year, week) {
            if (!this.tasksByYear[year] || !this.tasksByYear[year][week]) {
                return [];
            }
            return this.tasksByYear[year][week];
        },
        getTasksForDay(dayName) {
            const weekTasks = this.getTasksForCurrentWeek();
            return weekTasks.filter((task) => task.day === dayName);
        },
        getAllTasks() {
            // Flatten all tasks from all years and weeks
            const allTasks = [];
            Object.values(this.tasksByYear).forEach((yearData) => {
                Object.values(yearData).forEach((weekTasks) => {
                    allTasks.push(...weekTasks);
                });
            });
            return allTasks;
        },
        addTaskToHierarchy(task) {
            const year = task.year || this.getCurrentYear();
            const week = task.week || this.getCurrentWeekNumber();
            if (!this.tasksByYear[year]) {
                this.tasksByYear[year] = {};
            }
            if (!this.tasksByYear[year][week]) {
                this.tasksByYear[year][week] = [];
            }
            this.tasksByYear[year][week].push(task);
        },
        updateTaskInHierarchy(taskId, updates) {
            Object.values(this.tasksByYear).forEach((yearData) => {
                Object.values(yearData).forEach((weekTasks) => {
                    const task = weekTasks.find((t) => t.id === taskId);
                    if (task) {
                        Object.assign(task, updates);
                    }
                });
            });
        },
        removeTaskFromHierarchy(taskId) {
            Object.values(this.tasksByYear).forEach((yearData) => {
                Object.values(yearData).forEach((weekTasks) => {
                    const index = weekTasks.findIndex((t) => t.id === taskId);
                    if (index !== -1) {
                        weekTasks.splice(index, 1);
                    }
                });
            });
        },
        // Task completion flow
        async completeTask(task, childName) {
            try {
                const completedAt = new Date(); // Use current time for consistency
                // Check if this is a recurring task (has recurring- prefix in ID)
                const isRecurringTask = task.id.startsWith('recurring-');
                if (isRecurringTask) {
                    // For recurring tasks, create a new task in the week's collection
                    const newTask = {
                        title: task.title,
                        points: task.points,
                        day: task.day,
                        year: this.getCurrentYear(),
                        week: this.getCurrentWeekNumber(),
                        completed: true,
                        approved: false,
                        completedBy: childName,
                        completedAt: completedAt,
                        approvedAt: null, // Will be set when approved
                        recurringTaskId: task.id.replace('recurring-', '').split('-')[0], // Extract original recurring task ID
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };
                    // Add the new task to Firestore
                    if (this.firestoreService) {
                        const createdTask = await this.firestoreService.addTask(newTask);
                        if (!createdTask) {
                            throw new Error('Failed to create task in Firebase');
                        }
                        // Update the task ID for the approval process
                        task.id = createdTask.id;
                    }
                    else {
                        throw new Error('Firebase service not available');
                    }
                }
                else {
                    // For regular tasks, update existing task
                    const updates = {
                        completed: true,
                        completedBy: childName,
                        completedAt: completedAt
                    };
                    // Update task in Firestore
                    if (this.firestoreService) {
                        const updateResult = await this.firestoreService.updateTask(task.id, updates);
                        if (!updateResult) {
                            throw new Error('Failed to update task in Firebase');
                        }
                    }
                    else {
                        throw new Error('Firebase service not available');
                    }
                }
                // Skip automatic recalculation during animation
                this.skipAutoRecalculate = true;
                // Add to pending approvals
                const approval = {
                    taskId: task.id,
                    title: task.title,
                    points: task.points,
                    child: childName,
                    completedAt: completedAt
                };
                if (this.firestoreService) {
                    await this.firestoreService.addPendingApproval(approval);
                }
                else {
                    throw new Error('Firebase service not available');
                }
                // Trigger star animation (points will be updated after animation completes)
                this.animateStarsToPointsCard(task, childName);
                // Update points display after animation completes
                setTimeout(() => {
                    this.recalculatePoints();
                    // Update points in Firestore
                    if (this.firestoreService) {
                        this.firestoreService.updatePoints(this.simonPoints, this.noahPoints);
                    }
                    // Re-enable automatic recalculation
                    this.skipAutoRecalculate = false;
                }, task.points * 150 + 2500); // Wait for all animations to complete
                this.updateTabBadges();
            }
            catch (error) {
                console.error('❌ Error completing task:', error);
                alert('Error completing task. Please try again.');
            }
        },
        // Inline task creation
        async saveNewTask(dayName) {
            if (this.newTaskTitle.trim()) {
                const newTask = {
                    title: this.newTaskTitle.trim(),
                    points: this.newTaskStars,
                    day: dayName,
                    year: this.getCurrentYear(),
                    week: this.getCurrentWeekNumber(),
                    completed: false,
                    approved: false,
                    approvedAt: null, // Will be set when approved
                };
                if (this.firestoreService) {
                    try {
                        // Add the task to the current week
                        const result = await this.firestoreService.addTask(newTask);
                        // Manually refresh current week data as a fallback
                        setTimeout(async () => {
                            try {
                                const currentYear = this.getCurrentYear();
                                const currentWeek = this.getCurrentWeekNumber();
                                const tasks = await this.firestoreService.getTasksForWeek(currentYear, currentWeek);
                                if (!this.tasksByYear[currentYear]) {
                                    this.tasksByYear[currentYear] = {};
                                }
                                this.tasksByYear[currentYear][currentWeek] = tasks;
                                this.recalculatePoints();
                                this.$forceUpdate();
                            }
                            catch (error) {
                                console.error('❌ Error in manual refresh:', error);
                            }
                        }, 1000);
                    }
                    catch (error) {
                        console.error('❌ Error creating task:', error);
                        alert('Feil ved opprettelse av oppgave: ' + error.message);
                    }
                }
                else {
                    throw new Error('Firebase service not available');
                }
                this.cancelTaskCreation();
            }
        },
        cancelTaskCreation() {
            this.creatingTaskForDay = null;
            this.newTaskTitle = "";
            this.newTaskStars = 1;
        },
        // Direct task deletion (no PIN required)
        // Approval methods
        async approveTask(taskId) {
            try {
                const approval = this.pendingApprovals.find((a) => a.id === taskId);
                if (approval) {
                    // Mark task as approved in Firestore
                    const task = this.getAllTasks().find((t) => t.id === approval.taskId);
                    if (task) {
                        const updates = {
                            approved: true,
                            approvedAt: new Date()
                        };
                        if (this.firestoreService) {
                            await this.firestoreService.updateTask(task.id, updates);
                        }
                        else {
                            throw new Error('Firebase service not available');
                        }
                    }
                    // Remove from pending approvals
                    if (this.firestoreService) {
                        await this.firestoreService.removePendingApproval(approval.id);
                    }
                    else {
                        throw new Error('Firebase service not available');
                    }
                    this.updateTabBadges();
                    // Show celebration
                    this.displayCelebration(approval.child, approval.points);
                }
            }
            catch (error) {
                console.error('❌ Error approving task:', error);
                alert('Error approving task. Please try again.');
            }
        },
        async rejectTask(taskId) {
            try {
                // Remove from pending approvals and reset task
                const approval = this.pendingApprovals.find((a) => a.id === taskId);
                if (approval) {
                    // Remove points that were added when task went to approval
                    if (approval.child === 'Simon') {
                        this.simonPoints -= approval.points;
                    }
                    else {
                        this.noahPoints -= approval.points;
                    }
                    const task = this.getAllTasks().find((t) => t.id === approval.taskId);
                    if (task) {
                        const updates = {
                            completed: false,
                            approved: false
                            // completedBy, completedAt, and approvedAt will be set when completed/approved
                        };
                        if (this.firestoreService) {
                            await this.firestoreService.updateTask(task.id, updates);
                        }
                        else {
                            throw new Error('Firebase service not available');
                        }
                    }
                    // Remove from pending approvals
                    if (this.firestoreService) {
                        await this.firestoreService.removePendingApproval(approval.id);
                    }
                    else {
                        throw new Error('Firebase service not available');
                    }
                    // Update points in Firestore
                    if (this.firestoreService) {
                        await this.firestoreService.updatePoints(this.simonPoints, this.noahPoints);
                    }
                    this.updateTabBadges();
                }
            }
            catch (error) {
                console.error('❌ Error rejecting task:', error);
                alert('Error rejecting task. Please try again.');
            }
        },
        // Task management methods
        editTask(task) {
            this.editingTaskId = task.id;
            this.editingTaskTitle = task.title;
            this.editingTaskStars = task.points;
        },
        selectEditStars(stars) {
            this.editingTaskStars = stars;
        },
        async saveTaskEdit(task) {
            if (this.editingTaskTitle.trim()) {
                const updates = {
                    title: this.editingTaskTitle.trim(),
                    points: this.editingTaskStars
                };
                if (this.firestoreService) {
                    await this.firestoreService.updateTask(task.id, updates);
                }
                else {
                    throw new Error('Firebase service not available');
                }
            }
            this.cancelTaskEdit();
        },
        cancelTaskEdit() {
            this.editingTaskId = null;
            this.editingTaskTitle = "";
            this.editingTaskStars = 1;
        },
        async deleteTask(taskId) {
            if (this.firestoreService) {
                await this.firestoreService.deleteTask(taskId);
            }
            else {
                throw new Error('Firebase service not available');
            }
            this.updateTabBadges();
        },
        // Star animation from task to points card
        animateStarsToPointsCard(task, childName) {
            // Wait for DOM to update
            this.$nextTick(() => {
                // Find the task element
                const taskElement = document.querySelector(`[data-task-id="${task.id}"]`);
                if (!taskElement) {
                    return;
                }
                // Find the points card for the child
                const pointsCard = document.querySelector(`.points-card.${childName.toLowerCase()}-bg`);
                if (!pointsCard) {
                    return;
                }
                // Get positions
                const taskRect = taskElement.getBoundingClientRect();
                const pointsRect = pointsCard.getBoundingClientRect();
                // Add a satisfying "pop" effect to the task when coins start flying
                taskElement.style.transform = 'scale(1.1)';
                taskElement.style.transition = 'transform 0.2s ease-out';
                setTimeout(() => {
                    taskElement.style.transform = 'scale(1)';
                }, 200);
                // Create star elements for animation with more dramatic timing
                for (let i = 0; i < task.points; i++) {
                    setTimeout(() => {
                        this.createStarAnimation(taskRect, pointsRect, i, task.points);
                    }, i * 150); // Faster stagger for more excitement
                }
                // Add sparkle effect to points card when coins arrive
                setTimeout(() => {
                    this.addSparkleEffect(pointsCard);
                }, task.points * 150 + 1000);
            });
        },
        createStarAnimation(startRect, endRect, index, totalCoins) {
            // Create star element with more dramatic styling
            const starElement = document.createElement('div');
            starElement.className = 'star-flow-animation';
            starElement.innerHTML = '<span class="star">🪙</span>';
            // Make coins bigger and more visible
            starElement.style.fontSize = (3 + Math.random() * 0.5) + 'em'; // Random size variation
            // Set initial position (from task center with slight random offset)
            const startX = startRect.left + startRect.width / 2 + (Math.random() - 0.5) * 20;
            const startY = startRect.top + startRect.height / 2 + (Math.random() - 0.5) * 20;
            starElement.style.left = startX + 'px';
            starElement.style.top = startY + 'px';
            // Calculate end position (to points card center)
            const endX = endRect.left + endRect.width / 2;
            const endY = endRect.top + endRect.height / 2;
            // Add to DOM
            document.body.appendChild(starElement);
            // Create a more dramatic curved path with higher arc
            const controlX = startX + (endX - startX) * 0.5;
            const controlY = Math.min(startY, endY) - 150 - (index * 20); // Higher arc, more dramatic
            // Add initial "launch" effect
            starElement.style.transform = 'translate(-50%, -50%) scale(0.5) rotate(0deg)';
            starElement.style.opacity = '0';
            // Animate to end position with more dramatic timing
            requestAnimationFrame(() => {
                // Launch phase - quick scale up and fade in
                starElement.style.transition = 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                starElement.style.transform = 'translate(-50%, -50%) scale(1.3) rotate(180deg)';
                starElement.style.opacity = '1';
                // Flight phase - smooth curved movement
                setTimeout(() => {
                    starElement.style.transition = 'all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                    starElement.style.left = endX + 'px';
                    starElement.style.top = endY + 'px';
                    starElement.style.transform = 'translate(-50%, -50%) scale(1.1) rotate(720deg)';
                }, 300);
                // Landing phase - satisfying bounce and scale
                setTimeout(() => {
                    starElement.style.transition = 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                    starElement.style.transform = 'translate(-50%, -50%) scale(1.5) rotate(900deg)';
                    // Final settle
                    setTimeout(() => {
                        starElement.style.transform = 'translate(-50%, -50%) scale(1) rotate(1080deg)';
                        starElement.style.opacity = '0.8';
                    }, 200);
                }, 1800);
            });
            // Remove element after animation with longer duration
            setTimeout(() => {
                if (starElement.parentNode) {
                    starElement.parentNode.removeChild(starElement);
                }
            }, 2500);
        },
        // Add sparkle effect to points card when coins arrive
        addSparkleEffect(element) {
            const sparkleContainer = document.createElement('div');
            sparkleContainer.className = 'sparkle-container';
            sparkleContainer.style.position = 'absolute';
            sparkleContainer.style.top = '0';
            sparkleContainer.style.left = '0';
            sparkleContainer.style.width = '100%';
            sparkleContainer.style.height = '100%';
            sparkleContainer.style.pointerEvents = 'none';
            sparkleContainer.style.zIndex = '1000';
            // Create multiple sparkles
            for (let i = 0; i < 8; i++) {
                const sparkle = document.createElement('div');
                sparkle.className = 'sparkle';
                sparkle.innerHTML = '✨';
                sparkle.style.position = 'absolute';
                sparkle.style.fontSize = '1.5em';
                sparkle.style.left = Math.random() * 100 + '%';
                sparkle.style.top = Math.random() * 100 + '%';
                sparkle.style.animation = `sparklePop 1s ease-out forwards`;
                sparkle.style.animationDelay = (i * 0.1) + 's';
                sparkleContainer.appendChild(sparkle);
            }
            element.appendChild(sparkleContainer);
            // Remove sparkles after animation
            setTimeout(() => {
                if (sparkleContainer.parentNode) {
                    sparkleContainer.parentNode.removeChild(sparkleContainer);
                }
            }, 2000);
        },
        // Celebration
        displayCelebration(childName, points) {
            this.celebrationChild = childName;
            this.celebrationPoints = points;
            this.showCelebration = true;
            setTimeout(() => {
                this.showCelebration = false;
            }, 5000);
        },
        // Utility methods
        formatTime(date) {
            if (!date)
                return '';
            let dateObj;
            // Handle Firebase timestamp objects
            if (typeof date === 'object' && date !== null && 'seconds' in date) {
                // Firebase Timestamp object
                dateObj = new Date(date.seconds * 1000);
            }
            else if (typeof date === 'string') {
                // String date - try to parse it
                dateObj = new Date(date);
            }
            else if (date instanceof Date) {
                // Already a Date object
                dateObj = date;
            }
            else {
                // Fallback - try to create Date from whatever it is
                dateObj = new Date(date);
            }
            // Check if the date is valid
            if (isNaN(dateObj.getTime())) {
                return '';
            }
            return dateObj.toLocaleTimeString("no-NO", {
                hour: '2-digit',
                minute: '2-digit'
            });
        },
        // Check if a task is recurring by comparing with recurring tasks collection
        isTaskRecurring(task) {
            // If task has a recurringTaskId, it's a duplicated recurring task
            if (task.recurringTaskId) {
                return true;
            }
            // Otherwise, check if it matches any recurring task template
            const recurringTasks = this.recurringTasks || [];
            return recurringTasks.some((recurringTask) => recurringTask.title === task.title &&
                recurringTask.points === task.points &&
                recurringTask.day === task.day);
        },
        updateTabBadges() {
            // This will trigger computed property update
            this.$forceUpdate();
        },
        checkMondayReset() {
            const now = new Date();
            // Check if it's Monday and reset if needed
            if (now.getDay() === 1) { // Monday
                this.resetWeeklyPoints();
                this.createRecurringTasks();
            }
        },
        // Create recurring tasks for the new week
        async createRecurringTasks() {
            if (!this.firestoreService)
                return;
            try {
                // Get all recurring tasks from the recurring collection
                const recurringTasks = await this.firestoreService.getRecurringTasks();
                // Create new tasks for this week
                for (const recurringTask of recurringTasks) {
                    const newTask = {
                        title: recurringTask.title,
                        points: recurringTask.points,
                        day: recurringTask.day,
                        year: this.getCurrentYear(),
                        week: this.getCurrentWeekNumber(),
                        completed: false,
                        approved: false,
                        approvedAt: null, // Will be set when approved
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };
                    await this.firestoreService.addTask(newTask);
                }
            }
            catch (error) {
                console.error('❌ Error creating recurring tasks:', error);
            }
        },
        getLastMonday() {
            const now = new Date();
            const day = now.getDay();
            const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
            return new Date(now.setDate(diff));
        },
        resetWeeklyPoints() {
            this.simonPoints = 0;
            this.noahPoints = 0;
            // Reset all tasks in current week only
            const currentWeekTasks = this.getTasksForCurrentWeek();
            currentWeekTasks.forEach((task) => {
                task.completed = false;
                task.approved = false;
                // completedBy, completedAt, and approvedAt will be set when completed/approved
            });
            this.pendingApprovals = [];
        },
        // Recalculate points from approved tasks and pending approvals (for data integrity)
        recalculatePoints() {
            this.simonPoints = 0;
            this.noahPoints = 0;
            // Count points from approved tasks
            this.getAllTasks().forEach((task) => {
                if (task.approved && task.completedBy) {
                    if (task.completedBy === 'Simon') {
                        this.simonPoints += task.points;
                    }
                    else if (task.completedBy === 'Noah') {
                        this.noahPoints += task.points;
                    }
                }
            });
            // Count points from pending approvals
            this.pendingApprovals.forEach((approval) => {
                if (approval.child === 'Simon') {
                    this.simonPoints += approval.points;
                }
                else if (approval.child === 'Noah') {
                    this.noahPoints += approval.points;
                }
            });
        },
        // Points calculation methods for the new tab
        getPointsByWeekAndYear() {
            const pointsData = {};
            // Process all tasks by year and week
            Object.keys(this.tasksByYear).forEach(year => {
                pointsData[parseInt(year)] = {};
                Object.keys(this.tasksByYear[parseInt(year)]).forEach(week => {
                    const weekTasks = this.tasksByYear[parseInt(year)][parseInt(week)];
                    const simonPoints = weekTasks
                        .filter((task) => task.approved && task.completedBy === 'Simon')
                        .reduce((total, task) => total + task.points, 0);
                    const noahPoints = weekTasks
                        .filter((task) => task.approved && task.completedBy === 'Noah')
                        .reduce((total, task) => total + task.points, 0);
                    pointsData[parseInt(year)][parseInt(week)] = {
                        simon: simonPoints,
                        noah: noahPoints,
                        total: simonPoints + noahPoints
                    };
                });
            });
            return pointsData;
        },
        getTotalPoints() {
            const pointsData = this.getPointsByWeekAndYear();
            let totalSimon = 0;
            let totalNoah = 0;
            Object.values(pointsData).forEach((yearData) => {
                Object.values(yearData).forEach((weekData) => {
                    totalSimon += weekData.simon;
                    totalNoah += weekData.noah;
                });
            });
            return {
                simon: totalSimon,
                noah: totalNoah,
                total: totalSimon + totalNoah
            };
        },
        getSortedYears() {
            return Object.keys(this.tasksByYear).map(Number).sort((a, b) => b - a);
        },
        getSortedWeeks(year) {
            if (!this.tasksByYear[year])
                return [];
            return Object.keys(this.tasksByYear[year]).map(Number).sort((a, b) => a - b);
        },
        // Set up Firestore real-time listeners
        async setupFirestoreListeners() {
            if (!this.firestoreService) {
                console.error('❌ Firebase service not available');
                return;
            }
            // Set up real-time listener for current week tasks
            await this.setupCurrentWeekListener();
            // Load all weeks data for the points tab
            this.loadAllWeeksData();
            // Listen to pending approvals changes
            this.firestoreService.subscribeToPendingApprovals((approvals) => {
                this.pendingApprovals = approvals;
                // Only recalculate if not skipping (i.e., not during animation)
                if (!this.skipAutoRecalculate) {
                    this.recalculatePoints();
                }
            });
            // Listen to recurring tasks changes
            this.firestoreService.subscribeToRecurringTasks((tasks) => {
                this.recurringTasks = tasks;
            });
        },
        // Set up real-time listener for current week tasks
        async setupCurrentWeekListener() {
            if (!this.firestoreService) {
                console.error('❌ Firebase service not available');
                return;
            }
            try {
                const currentYear = this.getCurrentYear();
                const currentWeek = this.getCurrentWeekNumber();
                // Set up real-time listener for current week
                await this.firestoreService.subscribeToTasksForWeek(currentYear, currentWeek, (tasks) => {
                    // Update the hierarchical data structure
                    if (!this.tasksByYear[currentYear]) {
                        this.tasksByYear[currentYear] = {};
                    }
                    this.tasksByYear[currentYear][currentWeek] = tasks;
                    // Recalculate points
                    this.recalculatePoints();
                    // Force Vue to update
                    this.$forceUpdate();
                });
            }
            catch (error) {
                console.error('❌ Error setting up current week listener:', error);
            }
        },
        // Recurring tasks management methods
        startRecurringTaskCreation() {
            this.creatingRecurringTask = true;
            this.newRecurringTaskTitle = "";
            this.newRecurringTaskDay = "Mandag";
            this.newRecurringTaskStars = 1;
        },
        selectRecurringStars(stars) {
            this.newRecurringTaskStars = stars;
        },
        async saveRecurringTask() {
            if (this.newRecurringTaskTitle.trim()) {
                const recurringTask = {
                    title: this.newRecurringTaskTitle.trim(),
                    points: this.newRecurringTaskStars,
                    day: this.newRecurringTaskDay,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                try {
                    await this.firestoreService.addRecurringTask(recurringTask);
                    this.cancelRecurringTaskCreation();
                }
                catch (error) {
                    console.error('❌ Error creating recurring task:', error);
                    alert('Feil ved opprettelse av gjentakende oppgave: ' + error.message);
                }
            }
        },
        cancelRecurringTaskCreation() {
            this.creatingRecurringTask = false;
            this.newRecurringTaskTitle = "";
            this.newRecurringTaskDay = "Mandag";
            this.newRecurringTaskStars = 1;
        },
        async editRecurringTask(task) {
            // For now, just delete and recreate - could be improved with proper editing
            if (confirm(`Vil du slette "${task.title}" og lage en ny?`)) {
                await this.deleteRecurringTask(task.id);
                this.startRecurringTaskCreation();
                this.newRecurringTaskTitle = task.title;
                this.newRecurringTaskDay = task.day;
                this.newRecurringTaskStars = task.points;
            }
        },
        async deleteRecurringTask(taskId) {
            if (confirm('Er du sikker på at du vil slette denne gjentakende oppgaven?')) {
                try {
                    await this.firestoreService.deleteRecurringTask(taskId);
                }
                catch (error) {
                    console.error('❌ Error deleting recurring task:', error);
                    alert('Feil ved sletting av gjentakende oppgave: ' + error.message);
                }
            }
        },
        // Load all available data for the points tab
        async loadAllWeeksData() {
            if (!this.firestoreService) {
                console.error('❌ Firebase service not available');
                return;
            }
            try {
                // Load data from a reasonable range of years and weeks
                const currentYear = this.getCurrentYear();
                const yearsToCheck = [currentYear - 1, currentYear, currentYear + 1];
                for (const year of yearsToCheck) {
                    // Load all weeks for this year
                    for (let week = 1; week <= 53; week++) {
                        try {
                            const tasks = await this.firestoreService.getTasksForWeek(year, week);
                            if (tasks && tasks.length > 0) {
                                // Store in hierarchical structure
                                if (!this.tasksByYear[year]) {
                                    this.tasksByYear[year] = {};
                                }
                                this.tasksByYear[year][week] = tasks;
                            }
                        }
                        catch (error) {
                            // Week doesn't exist, continue
                        }
                    }
                }
                this.recalculatePoints();
            }
            catch (error) {
                console.error('❌ Error loading all data:', error);
            }
        },
        // Load current week data from any available year
        async loadCurrentWeekData() {
            if (!this.firestoreService) {
                console.error('❌ Firebase service not available');
                return;
            }
            try {
                const currentYear = this.getCurrentYear();
                const currentWeek = this.getCurrentWeekNumber();
                // Try to get current week data from any year
                const yearsToCheck = [currentYear - 1, currentYear, currentYear + 1];
                for (const year of yearsToCheck) {
                    try {
                        const tasks = await this.firestoreService.getTasksForWeek(year, currentWeek);
                        if (tasks && tasks.length > 0) {
                            // Store in current year's current week slot for display
                            if (!this.tasksByYear[currentYear]) {
                                this.tasksByYear[currentYear] = {};
                            }
                            this.tasksByYear[currentYear][currentWeek] = tasks;
                            this.recalculatePoints();
                            return;
                        }
                    }
                    catch (error) {
                        // Continue checking other years
                    }
                }
            }
            catch (error) {
                console.error('❌ Error loading current week data:', error);
            }
        }
    },
    async mounted() {
        // Wait for Firebase to be ready
        let attempts = 0;
        while ((!window.firebaseReady || !window.SimpleFirestoreService || !window.firestoreServiceReady) && attempts < 100) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        // Initialize Firestore service
        if (window.SimpleFirestoreService && window.firebaseReady) {
            this.firestoreService = new window.SimpleFirestoreService();
            // Test Firestore connection
            try {
                const connectionTest = await this.firestoreService.testConnection();
                if (!connectionTest) {
                    alert('Firebase connection failed. Please refresh the page and try again.');
                    return;
                }
                console.log('✅ Firebase connection successful');
            }
            catch (error) {
                console.error('Firebase connection error:', error);
                alert('Firebase connection error. Please refresh the page and try again.');
                return;
            }
        }
        else {
            alert('Firebase service not available. Please refresh the page and try again.');
            return;
        }
        // Initialize points (will be loaded from Firebase)
        this.simonPoints = 0;
        this.noahPoints = 0;
        // Wait a moment for Firebase to be fully ready
        await new Promise(resolve => setTimeout(resolve, 500));
        // Set up Firestore listeners
        await this.setupFirestoreListeners();
        // Recalculate points from approved tasks to ensure data integrity
        this.recalculatePoints();
        // Check for Monday reset
        this.checkMondayReset();
        this.updateTabBadges();
        // Initialize celebration state
        this.celebrationPoints = 0;
        this.celebrationChild = "";
    },
    watch: {
    // All data is now managed by Firebase - no localStorage needed
    }
});
// Mount the app
app.mount("#app");
// Export the app for use in HTML
export { createApp };
//# sourceMappingURL=app.js.map