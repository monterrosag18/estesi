/* 
    ===================================
    DASHBOARD SYSTEM - CRUDZASO v2
    ===================================
    
    Panel principal con estadísticas y resumen de tareas.
    Muestra información general y accesos rápidos.
*/

// ==========================================
// CONFIGURACIÓN Y ESTADO GLOBAL
// ==========================================

/* Estado global del dashboard */
let dashboardState = {
    currentUser: null,
    tasks: [],
    filteredTasks: [],
    currentFilter: 'all',
    statisticsCache: null,
    lastUpdate: null,
    refreshInterval: null
};

/* Configuración del dashboard */
const DASHBOARD_CONFIG = {
    TASKS_DISPLAY_LIMIT: 5, // Número de tareas a mostrar en el dashboard
    AUTO_REFRESH_INTERVAL: 30000, // 30 segundos
    STATISTICS_CACHE_DURATION: 5 * 60 * 1000, // 5 minutos
    ANIMATION_DURATION: 300, // milisegundos
    SUCCESS_MESSAGE_DURATION: 3000,
    ERROR_MESSAGE_DURATION: 5000
};

/* Mapeo de prioridades para ordenamiento y styling */
const PRIORITY_ORDER = {
    'High': 3,
    'Medium': 2,
    'Low': 1
};

/* Mapeo de estados para ordenamiento */
const STATUS_ORDER = {
    'Pending': 1,
    'In Progress': 2,
    'Completed': 3
};

// ==========================================
// INICIALIZACIÓN DEL DASHBOARD
// ==========================================

/* 
    Función principal que inicializa todo el dashboard
    
    Esta función orquesta la carga de todos los componentes
    y datos necesarios para mostrar un dashboard completo.
*/
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🏠 CRUDZASO Dashboard v1 - Initializing...');
    
    try {
        // 1. Verificar autenticación del usuario
        if (!await verifyUserAuthentication()) {
            console.log('❌ User not authenticated, redirecting to login');
            redirectToLogin();
            return;
        }
        
        // 2. Cargar información del usuario
        await loadCurrentUser();
        
        // 3. Cargar datos de tareas
        await loadUserTasks();
        
        // 4. Configurar la interfaz de usuario
        setupDashboardInterface();
        
        // 5. Renderizar estadísticas
        await renderDashboardStatistics();
        
        // 6. Renderizar lista de tareas
        renderTasksList();
        
        // 7. Configurar actualizaciones automáticas
        setupAutoRefresh();
        
        // 8. Configurar event listeners
        setupEventListeners();
        
        console.log('✅ Dashboard loaded successfully');
        
        // Mostrar mensaje de bienvenida
        showWelcomeMessage();
        
    } catch (error) {
        console.error('💥 Error initializing dashboard:', error);
        showErrorMessage('Failed to load dashboard. Please refresh the page.');
    }
});

// ==========================================
// AUTENTICACIÓN Y USUARIO ACTUAL
// ==========================================

/* 
    Verificar que el usuario esté autenticado
    
    Sin autenticación válida, no hay razón para mostrar el dashboard.
*/
async function verifyUserAuthentication() {
    const sessionData = localStorage.getItem('crudzaso_user_session');
    
    if (!sessionData) {
        return false;
    }
    
    try {
        const session = JSON.parse(sessionData);
        
        // Verificar que la sesión no haya expirado
        if (session.expires && new Date() > new Date(session.expires)) {
            console.log('⏰ Session expired');
            clearUserSession();
            return false;
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Error parsing session data:', error);
        clearUserSession();
        return false;
    }
}

/* 
    Cargar información del usuario actual
    
    Esta información se usa para personalizar el dashboard
    y mostrar datos específicos del usuario.
*/
async function loadCurrentUser() {
    const sessionData = JSON.parse(localStorage.getItem('crudzaso_user_session'));
    
    // En una app real, aquí haríamos una llamada al API para obtener
    // la información más actualizada del usuario
    dashboardState.currentUser = {
        id: sessionData.userId,
        name: sessionData.name,
        email: sessionData.email,
        role: sessionData.role,
        department: sessionData.department
    };
    
    console.log(`👤 Current user loaded: ${dashboardState.currentUser.name}`);
    
    // Actualizar la interfaz con la información del usuario
    updateUserInterface();
}

/* 
    Actualizar elementos de la interfaz con información del usuario
*/
function updateUserInterface() {
    const user = dashboardState.currentUser;
    
    // Actualizar nombre de usuario en navbar
    const userNameElement = document.getElementById('current-user-name');
    if (userNameElement) {
        userNameElement.textContent = user.name;
    }
    
    // Actualizar rol de usuario en navbar
    const userRoleElement = document.getElementById('current-user-role');
    if (userRoleElement) {
        userRoleElement.textContent = user.role;
    }
    
    console.log('🎨 User interface updated');
}

// ==========================================
// CARGA Y GESTIÓN DE TAREAS
// ==========================================

/* 
    Cargar todas las tareas del usuario actual
    
    Esta es la función más importante del dashboard porque
    las tareas son el núcleo de toda la aplicación.
*/
async function loadUserTasks() {
    console.log('📋 Loading user tasks...');
    
    try {
        // En una app real, esto sería una llamada al API:
        // const tasks = await api.getUserTasks(dashboardState.currentUser.id);
        
        // Por ahora, simulamos con datos del localStorage
        let tasks = JSON.parse(localStorage.getItem('crudzaso_tasks') || '[]');
        
        // Si no hay tareas, crear algunas de ejemplo para demostración
        if (tasks.length === 0) {
            tasks = createSampleTasks();
            localStorage.setItem('crudzaso_tasks', JSON.stringify(tasks));
        }
        
        // Filtrar tareas del usuario actual (si aplicamos multi-usuario)
        dashboardState.tasks = tasks.filter(task => 
            !task.userId || task.userId === dashboardState.currentUser.id
        );
        
        // Inicialmente mostrar todas las tareas
        dashboardState.filteredTasks = [...dashboardState.tasks];
        
        console.log(`✅ Loaded ${dashboardState.tasks.length} tasks`);
        
    } catch (error) {
        console.error('❌ Error loading tasks:', error);
        dashboardState.tasks = [];
        dashboardState.filteredTasks = [];
    }
}

/* 
    Crear tareas de ejemplo para demostración
    
    Estas tareas muestran diferentes estados, prioridades y categorías
    para que el dashboard se vea completo desde el primer uso.
*/
function createSampleTasks() {
    const sampleTasks = [
        {
            id: generateTaskId(),
            title: 'Complete Quarter 3 Report',
            description: 'Finish the comprehensive analysis report for Q3 academic performance.',
            category: 'Mathematics',
            priority: 'High',
            status: 'In Progress',
            dueDate: '2024-03-15',
            createdAt: '2024-03-01T10:00:00Z',
            updatedAt: '2024-03-10T14:30:00Z',
            assignee: 'Sarah Lin'
        },
        {
            id: generateTaskId(),
            title: 'Physics Lab Report: Quantum Mechanics',
            description: 'Document findings from the quantum mechanics experiment conducted last week.',
            category: 'Physics',
            priority: 'Medium',
            status: 'Pending',
            dueDate: '2024-03-20',
            createdAt: '2024-03-05T09:15:00Z',
            updatedAt: '2024-03-05T09:15:00Z',
            assignee: 'Michelle O.'
        },
        {
            id: generateTaskId(),
            title: 'History Essay: Industrial Revolution',
            description: 'Write a 2000-word essay on the impact of the Industrial Revolution on society.',
            category: 'History',
            priority: 'Low',
            status: 'Completed',
            dueDate: '2024-03-10',
            createdAt: '2024-02-20T11:00:00Z',
            updatedAt: '2024-03-08T16:45:00Z',
            assignee: 'Carlos M.'
        },
        {
            id: generateTaskId(),
            title: 'Database Systems Project: Phase 1',
            description: 'Complete the first phase of the database design project including ERD and normalization.',
            category: 'Computer Science',
            priority: 'High',
            status: 'In Progress',
            dueDate: '2024-03-25',
            createdAt: '2024-03-01T08:30:00Z',
            updatedAt: '2024-03-12T10:20:00Z',
            assignee: 'Raj Patel'
        },
        {
            id: generateTaskId(),
            title: 'Literature Review: Modernist Poetry',
            description: 'Analyze three modernist poems and their impact on contemporary literature.',
            category: 'Literature',
            priority: 'Medium',
            status: 'Pending',
            dueDate: '2024-03-30',
            createdAt: '2024-03-08T13:20:00Z',
            updatedAt: '2024-03-08T13:20:00Z',
            assignee: 'Emma Thompson'
        }
    ];
    
    console.log('📝 Created sample tasks for demonstration');
    return sampleTasks;
}

/* 
    Generar ID único para nuevas tareas
*/
function generateTaskId() {
    return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ==========================================
// ESTADÍSTICAS Y MÉTRICAS
// ==========================================

/* 
    Calcular y renderizar todas las estadísticas del dashboard
    
    Las estadísticas son el corazón visual del dashboard.
    Deben ser precisas, actualizadas y motivadoras.
*/
async function renderDashboardStatistics() {
    console.log('📊 Calculating dashboard statistics...');
    
    // Verificar si tenemos estadísticas en caché
    if (dashboardState.statisticsCache && 
        Date.now() - dashboardState.lastUpdate < DASHBOARD_CONFIG.STATISTICS_CACHE_DURATION) {
        console.log('📈 Using cached statistics');
        updateStatisticsDisplay(dashboardState.statisticsCache);
        return;
    }
    
    // Calcular nuevas estadísticas
    const stats = calculateTaskStatistics(dashboardState.tasks);
    
    // Guardar en caché
    dashboardState.statisticsCache = stats;
    dashboardState.lastUpdate = Date.now();
    
    // Actualizar la interfaz con animaciones
    await updateStatisticsDisplay(stats);
    
    console.log('✅ Statistics rendered successfully');
}

/* 
    Calcular métricas estadísticas de las tareas
    
    Estas métricas dan al usuario una vista rápida de su rendimiento.
*/
function calculateTaskStatistics(tasks) {
    const stats = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'Completed').length,
        pending: tasks.filter(t => t.status === 'Pending').length,
        inProgress: tasks.filter(t => t.status === 'In Progress').length,
        highPriority: tasks.filter(t => t.priority === 'High' && t.status !== 'Completed').length,
        overdue: 0, // Se calculará abajo
        completedThisWeek: 0, // Se calculará abajo
        averageCompletionTime: 0 // Se calculará abajo
    };
    
    // Calcular tareas vencidas
    const today = new Date();
    stats.overdue = tasks.filter(task => {
        if (task.status === 'Completed') return false;
        if (!task.dueDate) return false;
        return new Date(task.dueDate) < today;
    }).length;
    
    // Calcular tareas completadas esta semana
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    stats.completedThisWeek = tasks.filter(task => {
        if (task.status !== 'Completed') return false;
        const updatedDate = new Date(task.updatedAt);
        return updatedDate >= weekAgo;
    }).length;
    
    // Calcular progreso general (porcentaje)
    stats.overallProgress = stats.total > 0 ? 
        Math.round((stats.completed / stats.total) * 100) : 0;
    
    // Calcular tendencia semanal
    const lastWeekTasks = tasks.filter(task => {
        const createdDate = new Date(task.createdAt);
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        return createdDate >= twoWeeksAgo && createdDate < weekAgo;
    }).length;
    
    stats.weeklyTrend = lastWeekTasks > 0 ? 
        Math.round(((stats.completedThisWeek - lastWeekTasks) / lastWeekTasks) * 100) : 0;
    
    return stats;
}

/* 
    Actualizar la visualización de estadísticas con animaciones
*/
async function updateStatisticsDisplay(stats) {
    // Actualizar número total de tareas
    await animateNumberChange('total-tasks', stats.total);
    
    // Actualizar tareas completadas
    await animateNumberChange('completed-tasks', stats.completed);
    
    // Actualizar tareas pendientes
    await animateNumberChange('pending-tasks', stats.pending);
    
    // Actualizar progreso general
    await animateNumberChange('overall-progress', stats.overallProgress, '%');
    
    // Actualizar trends y mensajes motivacionales
    updateTrendMessages(stats);
    
    console.log('📈 Statistics display updated');
}

/* 
    Animar cambios en los números para mejor feedback visual
*/
function animateNumberChange(elementId, targetValue, suffix = '') {
    return new Promise((resolve) => {
        const element = document.getElementById(elementId);
        if (!element) {
            resolve();
            return;
        }
        
        const currentValue = parseInt(element.textContent) || 0;
        const increment = (targetValue - currentValue) / 20; // 20 pasos de animación
        let currentStep = 0;
        
        const animation = setInterval(() => {
            currentStep++;
            const newValue = Math.round(currentValue + (increment * currentStep));
            
            element.textContent = newValue + suffix;
            
            if (currentStep >= 20) {
                clearInterval(animation);
                element.textContent = targetValue + suffix;
                resolve();
            }
        }, DASHBOARD_CONFIG.ANIMATION_DURATION / 20);
    });
}

/* 
    Actualizar mensajes de tendencia y motivación
*/
function updateTrendMessages(stats) {
    // Actualizar mensaje de tareas pendientes
    const pendingTrendElement = document.querySelector('#pending-tasks').closest('.stat-card').querySelector('.stat-trend');
    if (pendingTrendElement && stats.highPriority > 0) {
        pendingTrendElement.innerHTML = `🔥 ${stats.highPriority} High Priority`;
        pendingTrendElement.className = 'stat-trend warning';
    } else if (pendingTrendElement) {
        pendingTrendElement.innerHTML = '✅ All under control';
        pendingTrendElement.className = 'stat-trend positive';
    }
    
    // Actualizar mensaje de progreso general
    const progressTrendElement = document.querySelector('#overall-progress').closest('.stat-card').querySelector('.stat-trend');
    if (progressTrendElement) {
        if (stats.overallProgress >= 75) {
            progressTrendElement.innerHTML = '🎯 Excellent progress!';
            progressTrendElement.className = 'stat-trend positive';
        } else if (stats.overallProgress >= 50) {
            progressTrendElement.innerHTML = '📈 Good momentum!';
            progressTrendElement.className = 'stat-trend positive';
        } else {
            progressTrendElement.innerHTML = '💪 Keep going!';
            progressTrendElement.className = 'stat-trend warning';
        }
    }
}

// ==========================================
// RENDERIZADO DE LISTA DE TAREAS
// ==========================================

/* 
    Renderizar la lista de tareas recientes en el dashboard
    
    Solo mostramos las tareas más relevantes para no abrumar al usuario.
    Las tareas se ordenan por prioridad y fecha límite.
*/
function renderTasksList() {
    console.log('📋 Rendering tasks list...');
    
    const tasksContainer = document.getElementById('tasks-container');
    if (!tasksContainer) {
        console.error('❌ Tasks container not found');
        return;
    }
    
    // Ordenar tareas por relevancia (prioridad + proximidad de fecha límite)
    const sortedTasks = [...dashboardState.filteredTasks]
        .sort(sortTasksByRelevance)
        .slice(0, DASHBOARD_CONFIG.TASKS_DISPLAY_LIMIT);
    
    // Limpiar contenedor
    tasksContainer.innerHTML = '';
    
    if (sortedTasks.length === 0) {
        renderEmptyTasksState(tasksContainer);
        return;
    }
    
    // Renderizar cada tarea
    sortedTasks.forEach(task => {
        const taskElement = createTaskRowElement(task);
        tasksContainer.appendChild(taskElement);
    });
    
    console.log(`✅ Rendered ${sortedTasks.length} tasks`);
}

/* 
    Función de ordenamiento por relevancia
    
    Las tareas más importantes aparecen primero:
    1. Prioridad alta
    2. Fecha límite próxima
    3. Estado (pendientes antes que completadas)
*/
function sortTasksByRelevance(a, b) {
    // Primero por estado (pendientes e in-progress primero)
    const statusPriorityA = STATUS_ORDER[a.status] || 0;
    const statusPriorityB = STATUS_ORDER[b.status] || 0;
    
    if (statusPriorityA !== statusPriorityB) {
        return statusPriorityA - statusPriorityB;
    }
    
    // Luego por prioridad (alta primero)
    const priorityA = PRIORITY_ORDER[a.priority] || 0;
    const priorityB = PRIORITY_ORDER[b.priority] || 0;
    
    if (priorityA !== priorityB) {
        return priorityB - priorityA; // Orden descendente
    }
    
    // Finalmente por fecha límite (más próxima primero)
    if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate) - new Date(b.dueDate);
    }
    
    return 0;
}

/* 
    Crear elemento DOM para una fila de tarea
    
    Cada fila muestra información esencial y acciones rápidas.
*/
function createTaskRowElement(task) {
    const row = document.createElement('div');
    row.className = 'task-row';
    row.setAttribute('data-task-id', task.id);
    
    // Formatear fecha límite
    const dueDate = task.dueDate ? formatDate(task.dueDate) : 'No due date';
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed';
    
    row.innerHTML = `
        <div class="col-task">
            <div class="task-name">${escapeHtml(task.title)}</div>
        </div>
        <div class="col-assignee">
            <div class="assignee">
                <div class="assignee-avatar">${getAssigneeInitials(task.assignee)}</div>
                <span class="assignee-name">${escapeHtml(task.assignee || 'Unassigned')}</span>
            </div>
        </div>
        <div class="col-status">
            <span class="status-badge ${task.status.toLowerCase().replace(' ', '-')}">${task.status}</span>
        </div>
        <div class="col-priority">
            <span class="priority-badge ${task.priority.toLowerCase()}">${task.priority}</span>
        </div>
        <div class="col-due">
            <span class="due-date ${isOverdue ? 'overdue' : ''}">${dueDate}</span>
        </div>
        <div class="col-actions">
            <div class="task-actions">
                <button class="action-btn edit" onclick="editTask('${task.id}')" title="Edit task">
                    ✏️
                </button>
                <button class="action-btn delete" onclick="deleteTask('${task.id}')" title="Delete task">
                    🗑️
                </button>
                ${task.status !== 'Completed' ? 
                    `<button class="action-btn complete" onclick="toggleTaskStatus('${task.id}')" title="Mark as complete">
                        ✅
                    </button>` : 
                    `<button class="action-btn view" onclick="viewTask('${task.id}')" title="View details">
                        👁️
                    </button>`
                }
            </div>
        </div>
    `;
    
    return row;
}

/* 
    Renderizar estado vacío cuando no hay tareas
*/
function renderEmptyTasksState(container) {
    container.innerHTML = `
        <div class="empty-tasks-state">
            <div class="empty-icon">📝</div>
            <h3>No tasks found</h3>
            <p>Create your first task to get started with CRUDZASO!</p>
            <button class="btn btn-primary" onclick="goToCreateTask()">
                ➕ Create First Task
            </button>
        </div>
    `;
}

// ==========================================
// FILTRADO DE TAREAS
// ==========================================

/* 
    Filtrar tareas según el criterio seleccionado
    
    Esta función se llama cuando el usuario hace click
    en los botones de filtro (All, Pending, Completed).
*/
function filterTasks(filterType) {
    console.log(`🔍 Filtering tasks by: ${filterType}`);
    
    dashboardState.currentFilter = filterType;
    
    // Aplicar filtro
    switch (filterType) {
        case 'all':
            dashboardState.filteredTasks = [...dashboardState.tasks];
            break;
        case 'pending':
            dashboardState.filteredTasks = dashboardState.tasks.filter(
                task => task.status === 'Pending'
            );
            break;
        case 'completed':
            dashboardState.filteredTasks = dashboardState.tasks.filter(
                task => task.status === 'Completed'
            );
            break;
        case 'in-progress':
            dashboardState.filteredTasks = dashboardState.tasks.filter(
                task => task.status === 'In Progress'
            );
            break;
        default:
            dashboardState.filteredTasks = [...dashboardState.tasks];
    }
    
    // Actualizar botones de filtro
    updateFilterButtons(filterType);
    
    // Re-renderizar lista de tareas
    renderTasksList();
    
    console.log(`✅ Filtered to ${dashboardState.filteredTasks.length} tasks`);
}

/* 
    Actualizar estado visual de los botones de filtro
*/
function updateFilterButtons(activeFilter) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.classList.remove('active');
        
        // Determinar si este botón debe estar activo
        const buttonFilter = button.getAttribute('onclick')?.match(/filterTasks\('([^']+)'\)/)?.[1];
        if (buttonFilter === activeFilter) {
            button.classList.add('active');
        }
    });
}

// ==========================================
// ACCIONES DE TAREAS
// ==========================================

/* 
    Alternar estado de una tarea (completar/descompletar)
*/
async function toggleTaskStatus(taskId) {
    console.log(`🔄 Toggling status for task: ${taskId}`);
    
    const task = dashboardState.tasks.find(t => t.id === taskId);
    if (!task) {
        console.error('❌ Task not found');
        return;
    }
    
    // Cambiar estado
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    
    try {
        // Actualizar en memoria
        task.status = newStatus;
        task.updatedAt = new Date().toISOString();
        
        // Guardar en localStorage (en una app real sería una llamada al API)
        localStorage.setItem('crudzaso_tasks', JSON.stringify(dashboardState.tasks));
        
        // Mostrar feedback inmediato
        showTaskActionFeedback(task, newStatus === 'Completed' ? 'completed' : 'reopened');
        
        // Re-renderizar dashboard
        await renderDashboardStatistics();
        renderTasksList();
        
        console.log(`✅ Task ${taskId} marked as ${newStatus}`);
        
    } catch (error) {
        console.error('❌ Error updating task status:', error);
        showErrorMessage('Failed to update task status. Please try again.');
        
        // Revertir cambio en caso de error
        task.status = task.status === 'Completed' ? 'Pending' : 'Completed';
    }
}

/* 
    Eliminar una tarea con confirmación
*/
async function deleteTask(taskId) {
    const task = dashboardState.tasks.find(t => t.id === taskId);
    if (!task) {
        console.error('❌ Task not found');
        return;
    }
    
    // Pedir confirmación
    const confirmed = confirm(`Are you sure you want to delete "${task.title}"?\n\nThis action cannot be undone.`);
    
    if (!confirmed) {
        console.log('❌ Task deletion cancelled by user');
        return;
    }
    
    console.log(`🗑️ Deleting task: ${taskId}`);
    
    try {
        // Eliminar de memoria
        dashboardState.tasks = dashboardState.tasks.filter(t => t.id !== taskId);
        dashboardState.filteredTasks = dashboardState.filteredTasks.filter(t => t.id !== taskId);
        
        // Guardar en localStorage
        localStorage.setItem('crudzaso_tasks', JSON.stringify(dashboardState.tasks));
        
        // Animar eliminación del elemento
        animateTaskRemoval(taskId);
        
        // Mostrar feedback
        showTaskActionFeedback(task, 'deleted');
        
        // Re-renderizar estadísticas
        await renderDashboardStatistics();
        
        // Re-renderizar lista después de la animación
        setTimeout(() => {
            renderTasksList();
        }, DASHBOARD_CONFIG.ANIMATION_DURATION);
        
        console.log(`✅ Task ${taskId} deleted successfully`);
        
    } catch (error) {
        console.error('❌ Error deleting task:', error);
        showErrorMessage('Failed to delete task. Please try again.');
    }
}

/* 
    Animar la eliminación de una tarea
*/
function animateTaskRemoval(taskId) {
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    if (taskElement) {
        taskElement.style.transition = `opacity ${DASHBOARD_CONFIG.ANIMATION_DURATION}ms ease`;
        taskElement.style.opacity = '0';
        taskElement.style.transform = 'translateX(-100%)';
    }
}

/* 
    Mostrar feedback visual para acciones de tareas
*/
function showTaskActionFeedback(task, action) {
    let message = '';
    let type = 'success';
    
    switch (action) {
        case 'completed':
            message = `✅ "${task.title}" marked as completed!`;
            break;
        case 'reopened':
            message = `🔄 "${task.title}" reopened for work.`;
            break;
        case 'deleted':
            message = `🗑️ "${task.title}" has been deleted.`;
            type = 'info';
            break;
        default:
            message = `Task "${task.title}" updated successfully.`;
    }
    
    showTemporaryMessage(message, type);
}

// ==========================================
// NAVEGACIÓN
// ==========================================

/* 
    Navegar a la página de crear nueva tarea
*/
function goToCreateTask() {
    console.log('➕ Navigating to create task page');
    window.location.href = 'create-task.html';
}

/* 
    Editar una tarea específica
*/
function editTask(taskId) {
    console.log(`✏️ Editing task: ${taskId}`);
    // Guardar el ID de la tarea a editar en localStorage para la página de edición
    localStorage.setItem('editing_task_id', taskId);
    window.location.href = 'create-task.html';
}

/* 
    Ver detalles de una tarea
*/
function viewTask(taskId) {
    console.log(`👁️ Viewing task: ${taskId}`);
    const task = dashboardState.tasks.find(t => t.id === taskId);
    
    if (!task) {
        showErrorMessage('Task not found.');
        return;
    }
    
    // Por ahora, mostrar detalles en un alert
    // En una implementación completa, esto abriría un modal o página dedicada
    alert(`Task Details:\n\nTitle: ${task.title}\nCategory: ${task.category}\nPriority: ${task.priority}\nStatus: ${task.status}\nDue Date: ${task.dueDate || 'Not set'}\n\nDescription:\n${task.description || 'No description available.'}`);
}

/* 
    Navegar al perfil de usuario
*/
function goToProfile() {
    console.log('👤 Navigating to profile page');
    window.location.href = 'profile.html';
}

/* 
    Redirigir al login si no hay autenticación
*/
function redirectToLogin() {
    window.location.href = '../index.html';
}

// ==========================================
// CONFIGURACIÓN DE INTERFAZ
// ==========================================

/* 
    Configurar todos los elementos de la interfaz del dashboard
*/
function setupDashboardInterface() {
    // La interfaz ya está configurada en el HTML
    // Esta función está reservada para configuraciones dinámicas futuras
    console.log('🎨 Dashboard interface configured');
}

/* 
    Configurar todos los event listeners necesarios
*/
function setupEventListeners() {
    // Event listeners para filtros (ya están configurados inline en HTML)
    
    // Event listener para refrescar manual
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            refreshDashboard();
        }
    });
    
    // Event listener para accesos rápidos de teclado
    document.addEventListener('keydown', function(e) {
        if (e.altKey) {
            switch(e.key) {
                case 'n': // Alt + N = New Task
                    e.preventDefault();
                    goToCreateTask();
                    break;
                case 'p': // Alt + P = Profile
                    e.preventDefault();
                    goToProfile();
                    break;
            }
        }
    });
    
    console.log('⚡ Event listeners configured');
}

/* 
    Configurar actualización automática del dashboard
*/
function setupAutoRefresh() {
    // Limpiar interval existente si hay uno
    if (dashboardState.refreshInterval) {
        clearInterval(dashboardState.refreshInterval);
    }
    
    // Configurar nuevo interval
    dashboardState.refreshInterval = setInterval(() => {
        console.log('🔄 Auto-refreshing dashboard...');
        refreshDashboard(false); // false = no mostrar mensaje de carga
    }, DASHBOARD_CONFIG.AUTO_REFRESH_INTERVAL);
    
    console.log('⏰ Auto-refresh configured');
}

/* 
    Refrescar manualmente el dashboard
*/
async function refreshDashboard(showLoading = true) {
    if (showLoading) {
        showTemporaryMessage('🔄 Refreshing dashboard...', 'info');
    }
    
    try {
        await loadUserTasks();
        await renderDashboardStatistics();
        renderTasksList();
        
        if (showLoading) {
            showTemporaryMessage('✅ Dashboard updated!', 'success');
        }
        
    } catch (error) {
        console.error('❌ Error refreshing dashboard:', error);
        showErrorMessage('Failed to refresh dashboard.');
    }
}

// ==========================================
// UTILIDADES Y HELPERS
// ==========================================

/* 
    Formatear fecha para mostrar
*/
function formatDate(dateString) {
    if (!dateString) return 'No date';
    
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Comparar solo fechas, no horas
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    if (dateOnly.getTime() === todayOnly.getTime()) {
        return 'Today';
    } else if (dateOnly.getTime() === yesterday.getTime()) {
        return 'Yesterday';
    } else if (dateOnly.getTime() === tomorrow.getTime()) {
        return 'Tomorrow';
    } else {
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
    }
}

/* 
    Obtener iniciales del nombre para avatar
*/
function getAssigneeInitials(name) {
    if (!name) return '?';
    
    const words = name.trim().split(' ');
    if (words.length === 1) {
        return words[0].charAt(0).toUpperCase();
    } else {
        return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    }
}

/* 
    Escapar HTML para prevenir XSS
*/
function escapeHtml(text) {
    if (!text) return '';
    
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/* 
    Limpiar sesión de usuario
*/
function clearUserSession() {
    localStorage.removeItem('crudzaso_user_session');
    localStorage.removeItem('crudzaso_remember_me');
}

/* 
    Mostrar mensaje de bienvenida personalizado
*/
function showWelcomeMessage() {
    const user = dashboardState.currentUser;
    const hour = new Date().getHours();
    
    let greeting = 'Hello';
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';
    else greeting = 'Good evening';
    
    const completedToday = dashboardState.tasks.filter(task => {
        if (task.status !== 'Completed') return false;
        const updatedDate = new Date(task.updatedAt);
        const today = new Date();
        return updatedDate.toDateString() === today.toDateString();
    }).length;
    
    let motivationalMessage = `${greeting}, ${user.name}! `;
    
    if (completedToday > 0) {
        motivationalMessage += `You've completed ${completedToday} task${completedToday > 1 ? 's' : ''} today. Great work! 🎉`;
    } else {
        motivationalMessage += `Ready to tackle your tasks today? 💪`;
    }
    
    showTemporaryMessage(motivationalMessage, 'success', 4000);
}

// ==========================================
// SISTEMA DE MENSAJES
// ==========================================

/* 
    Mostrar mensaje temporal con auto-eliminación
*/
function showTemporaryMessage(message, type = 'info', duration = DASHBOARD_CONFIG.SUCCESS_MESSAGE_DURATION) {
    const existingMessage = document.querySelector('.dashboard-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = `dashboard-message dashboard-message-${type}`;
    messageElement.textContent = message;
    
    // Insertar al inicio del content-area
    const contentArea = document.querySelector('.content-area');
    if (contentArea) {
        contentArea.insertBefore(messageElement, contentArea.firstChild);
        
        // Auto-eliminar después del tiempo especificado
        setTimeout(() => {
            if (messageElement.parentElement) {
                messageElement.style.opacity = '0';
                setTimeout(() => messageElement.remove(), 300);
            }
        }, duration);
    }
}

function showErrorMessage(message) {
    showTemporaryMessage(message, 'error', DASHBOARD_CONFIG.ERROR_MESSAGE_DURATION);
}

/* 
    ¡FIN DEL ARCHIVO DASHBOARD.JS! 🎊
    
    Este archivo es el cerebro del dashboard de CRUDZASO:
    ✅ Carga y muestra datos de usuario en tiempo real
    ✅ Calcula y visualiza estadísticas motivadoras
    ✅ Renderiza listas de tareas con filtrado inteligente
    ✅ Proporciona acciones rápidas para gestión de tareas
    ✅ Maneja navegación fluida entre secciones
    ✅ Incluye feedback visual rico y animaciones
    ✅ Actualización automática para datos siempre frescos
    ✅ Interfaz responsive y accesible
    ✅ Mensajes motivacionales personalizados
    ✅ Manejo robusto de errores
    
    El dashboard es donde los estudiantes ven el panorama
    completo de su progreso académico y toman decisiones
    informadas sobre qué hacer a continuación.
    
    ¡Es el corazón pulsante de CRUDZASO! ❤️📚
*/