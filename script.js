document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================================================
    // MODULE 1: WEATHER DASHBOARD LOGIC (Asynchronous Fetch & REST API)
    // ==========================================================================
    const cityInput = document.getElementById('weather-city-input');
    const searchBtn = document.getElementById('weather-search-btn');
    const statusBox = document.getElementById('weather-status');
    const displayCard = document.getElementById('weather-display');
    
    // UI Outlets
    const outCity = document.getElementById('display-city-name');
    const outCondition = document.getElementById('display-condition');
    const outTemp = document.getElementById('metric-temp');
    const outHumidity = document.getElementById('metric-humidity');
    const outWind = document.getElementById('metric-wind');

    // Free Open-Source API Endpoint without requiring manual private keys
    const fetchWeatherData = async (city) => {
        if (!city) return;
        
        // Setup loading state
        statusBox.style.display = 'block';
        statusBox.className = 'weather-alert info';
        statusBox.textContent = `Establishing connection for "${city}"...`;
        displayCard.style.display = 'none';

        try {
            // Fetching geo-coordinates first from open public API
            const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
            
            if (!geoResponse.ok) throw new Error('Network gateway failure.');
            const geoData = await geoResponse.json();
            
            if (!geoData.results || geoData.results.length === 0) {
                throw new Error('Requested city configuration could not be resolved.');
            }

            // Extract nested JSON parameters
            const { latitude, longitude, name, country } = geoData.results[0];

            // Fetch actual live telemetry based on coordinates
            const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`);
            if (!weatherResponse.ok) throw new Error('Telemetry provider rejected request.');
            
            const weatherData = await weatherResponse.json();
            
            // Map weather interpretation code into user readable strings
            const codeMap = { 0: 'Clear Sky', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast', 45: 'Fog', 61: 'Slight Rain', 71: 'Snowfall', 95: 'Thunderstorm' };
            const conditionText = codeMap[weatherData.current.weather_code] || 'Atmospheric Fluctuations';

            // Dynamic DOM injection of fetched data
            outCity.textContent = `${name}, ${country}`;
            outCondition.textContent = conditionText;
            outTemp.textContent = `${weatherData.current.temperature_2m}°C`;
            outHumidity.textContent = `${weatherData.current.relative_humidity_2m}%`;
            outWind.textContent = `${weatherData.current.wind_speed_10m} m/s`;

            // Display success
            statusBox.style.display = 'none';
            displayCard.style.display = 'block';

        } catch (error) {
            // Graceful semantic error handling
            statusBox.className = 'weather-alert error';
            statusBox.textContent = `API Exception: ${error.message}`;
            displayCard.style.display = 'none';
        }
    };

    if (searchBtn && cityInput) {
        searchBtn.addEventListener('click', () => fetchWeatherData(cityInput.value.trim()));
        cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') fetchWeatherData(cityInput.value.trim());
        });
    }


    // ==========================================================================
    // MODULE 2: TO-DO APPLICATION LOGIC (State Management from Page 3)
    // ==========================================================================
    const taskInput = document.getElementById('todo-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const statusRegion = document.getElementById('todo-status-live');

    if (taskList) { // Runs execution architecture exclusively on Projects Page
        let tasks = JSON.parse(localStorage.getItem('nitish-tasks')) || [];
        let currentFilter = 'all';

        const saveAndRender = (message) => {
            localStorage.setItem('nitish-tasks', JSON.stringify(tasks));
            renderTasks();
            if (message && statusRegion) statusRegion.textContent = message;
        };

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
                    <span class="task-text" contenteditable="true">${task.text}</span>
                    <button class="delete-btn" aria-label="Delete task">Delete</button>
                `;
                taskList.appendChild(li);
            });
        };

        const addTask = () => {
            const text = taskInput.value.trim();
            if (!text) return;
            tasks.push({ id: Date.now().toString(), text, completed: false });
            taskInput.value = '';
            saveAndRender('Task added.');
        };

        addTaskBtn.addEventListener('click', addTask);
        taskInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTask(); });

        taskList.addEventListener('click', (e) => {
            const li = e.target.closest('.todo-item');
            if (!li) return;
            const id = li.getAttribute('data-id');

            if (e.target.type === 'checkbox') {
                tasks = tasks.map(t => t.id === id ? { ...t, completed: e.target.checked } : t);
                saveAndRender(e.target.checked ? 'Completed' : 'Active');
            }
            if (e.target.classList.contains('delete-btn')) {
                tasks = tasks.filter(t => t.id !== id);
                saveAndRender('Deleted');
            }
        });

        taskList.addEventListener('input', (e) => {
            if (e.target.classList.contains('task-text')) {
                const id = e.target.closest('.todo-item').getAttribute('data-id');
                tasks = tasks.map(t => t.id === id ? { ...t, text: e.target.textContent } : t);
                localStorage.setItem('nitish-tasks', JSON.stringify(tasks));
            }
        });

        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterButtons.forEach(b => b.removeAttribute('aria-current'));
                e.target.setAttribute('aria-current', 'page');
                currentFilter = e.target.getAttribute('data-filter');
                renderTasks();
            });
        });

        renderTasks();
    }
});