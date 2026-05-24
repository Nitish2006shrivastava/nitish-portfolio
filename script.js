// To-Do App State Management
document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('todo-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const statusRegion = document.getElementById('todo-status-live');

    // Load tasks from localStorage or initialize empty array
    let tasks = JSON.parse(localStorage.getItem('nitish-tasks')) || [];
    let currentFilter = 'all';

    // Save to localStorage and Rerender
    const saveAndRender = (message) => {
        localStorage.setItem('nitish-tasks', JSON.stringify(tasks));
        renderTasks();
        if (message && statusRegion) {
            statusRegion.textContent = message; // Accessibility screen-reader notice
        }
    };

    // Render Tasks based on filter
    const renderTasks = () => {
        taskList.innerHTML = '';
        
        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'active') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
            return true;
        });

        if (filteredTasks.length === 0) {
            taskList.innerHTML = `<li style="color: var(--text-muted); text-align:center; list-style:none; padding: 1rem;">No tasks found.</li>`;
            return;
        }

        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `todo-item ${task.completed ? 'completed' : ''}`;
            li.setAttribute('data-id', task.id);

            li.innerHTML = `
                <input type="checkbox" ${task.completed ? 'checked' : ''} aria-label="Mark '${task.text}' as completed">
                <span class="task-text" contenteditable="true" aria-label="Edit task">${task.text}</span>
                <button class="delete-btn" aria-label="Delete task '${task.text}'">Delete</button>
            `;
            taskList.appendChild(li);
        });
    };

    // Create (Add Task)
    const addTask = () => {
        const text = taskInput.value.trim();
        if (!text) return;

        const newTask = {
            id: Date.now().toString(),
            text: text,
            completed: false
        };

        tasks.push(newTask);
        taskInput.value = '';
        saveAndRender('Task successfully added.');
    };

    // Event Listeners for Add Action
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    // Delegated Event Listeners (Update / Delete)
    taskList.addEventListener('click', (e) => {
        const li = e.target.closest('.todo-item');
        if (!li) return;
        const id = li.getAttribute('data-id');

        // Toggle Complete (Update State)
        if (e.target.type === 'checkbox') {
            tasks = tasks.map(task => task.id === id ? { ...task, completed: e.target.checked } : task);
            saveAndRender(e.target.checked ? 'Task marked as completed.' : 'Task marked as active.');
        }

        // Delete Action
        if (e.target.classList.contains('delete-btn')) {
            tasks = tasks.filter(task => task.id !== id);
            saveAndRender('Task successfully deleted.');
        }
    });

    // Inline ContentEditable Update (Read/Update text)
    taskList.addEventListener('input', (e) => {
        if (e.target.classList.contains('task-text')) {
            const li = e.target.closest('.todo-item');
            const id = li.getAttribute('data-id');
            tasks = tasks.map(task => task.id === id ? { ...task, text: e.target.textContent } : task);
            localStorage.setItem('nitish-tasks', JSON.stringify(tasks)); // Quiet save on typing
        }
    });

    // Filter Switcher Logic
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterButtons.forEach(b => b.removeAttribute('aria-current'));
            e.target.setAttribute('aria-current', 'page');
            currentFilter = e.target.getAttribute('data-filter');
            renderTasks();
        });
    });

    // Initial Core Render
    renderTasks();
});