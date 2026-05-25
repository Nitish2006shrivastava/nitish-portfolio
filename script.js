document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================================================
    // MODULE 1: WEATHER DASHBOARD LOGIC (Asynchronous Fetch)
    // ==========================================================================
    const cityInput = document.getElementById('weather-city-input');
    const searchBtn = document.getElementById('weather-search-btn');
    const statusBox = document.getElementById('weather-status');
    const displayCard = document.getElementById('weather-display');
    
    if (searchBtn && cityInput) {
        const outCity = document.getElementById('display-city-name');
        const outCondition = document.getElementById('display-condition');
        const outTemp = document.getElementById('metric-temp');
        const outHumidity = document.getElementById('metric-humidity');
        const outWind = document.getElementById('metric-wind');

        const fetchWeatherData = async (city) => {
            if (!city) return;
            statusBox.style.display = 'block';
            statusBox.className = 'weather-alert info';
            statusBox.textContent = `Connecting telemetry network for "${city}"...`;
            displayCard.style.display = 'none';

            try {
                const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
                if (!geoResponse.ok) throw new Error('Gateway resolution mismatch.');
                const geoData = await geoResponse.json();
                
                if (!geoData.results || geoData.results.length === 0) throw new Error('City context not found.');
                const { latitude, longitude, name, country } = geoData.results[0];

                const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`);
                if (!weatherResponse.ok) throw new Error('Telemetry buffer fault.');
                const weatherData = await weatherResponse.json();
                
                const codeMap = { 0: 'Clear Sky', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast', 45: 'Fog', 61: 'Rain showers' };
                outCity.textContent = `${name}, ${country}`;
                outCondition.textContent = codeMap[weatherData.current.weather_code] || 'Atmospheric Fluctuations';
                outTemp.textContent = `${weatherData.current.temperature_2m}°C`;
                outHumidity.textContent = `${weatherData.current.relative_humidity_2m}%`;
                outWind.textContent = `${weatherData.current.wind_speed_10m} m/s`;

                statusBox.style.display = 'none';
                displayCard.style.display = 'block';
            } catch (error) {
                statusBox.className = 'weather-alert error';
                statusBox.textContent = `Fault: ${error.message}`;
            }
        };

        searchBtn.addEventListener('click', () => fetchWeatherData(cityInput.value.trim()));
        cityInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') fetchWeatherData(cityInput.value.trim()); });
    }

    // ==========================================================================
    // MODULE 2: TO-DO APPLICATION LOGIC (State Sandbox)
    // ==========================================================================
    const taskInput = document.getElementById('todo-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');

    if (taskList) {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const statusRegion = document.getElementById('todo-status-live');
        let tasks = JSON.parse(localStorage.getItem('nitish-tasks')) || [];
        let currentFilter = 'all';

        const saveAndRender = (msg) => {
            localStorage.setItem('nitish-tasks', JSON.stringify(tasks));
            renderTasks();
            if (msg && statusRegion) statusRegion.textContent = msg;
        };

        const renderTasks = () => {
            taskList.innerHTML = '';
            const filtered = tasks.filter(t => currentFilter === 'active' ? !t.completed : currentFilter === 'completed' ? t.completed : true);
            if (filtered.length === 0) {
                taskList.innerHTML = `<li style="color:var(--text-muted); text-align:center; list-style:none; padding:1rem;">No tracking operations data.</li>`;
                return;
            }
            filtered.forEach(t => {
                const li = document.createElement('li');
                li.className = `todo-item ${t.completed ? 'completed' : ''}`;
                li.setAttribute('data-id', t.id);
                li.innerHTML = `
                    <input type="checkbox" ${t.completed ? 'checked' : ''} aria-label="Toggle state">
                    <span class="task-text" contenteditable="true">${t.text}</span>
                    <button class="delete-btn" aria-label="Purge">Delete</button>
                `;
                taskList.appendChild(li);
            });
        };

        addTaskBtn.addEventListener('click', () => {
            const txt = taskInput.value.trim();
            if (!txt) return;
            tasks.push({ id: Date.now().toString(), text: txt, completed: false });
            taskInput.value = '';
            saveAndRender('Element injected.');
        });

        taskList.addEventListener('click', (e) => {
            const li = e.target.closest('.todo-item');
            if (!li) return;
            const id = li.getAttribute('data-id');
            if (e.target.type === 'checkbox') {
                tasks = tasks.map(t => t.id === id ? { ...t, completed: e.target.checked } : t);
                saveAndRender('State modified.');
            }
            if (e.target.classList.contains('delete-btn')) {
                tasks = tasks.filter(t => t.id !== id);
                saveAndRender('State removed.');
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

    // ==========================================================================
    // MODULE 3: CAPSTONE E-COMMERCE CATALOG ENGINE (Dynamic Architecture)
    // ==========================================================================
    const catalogContainer = document.getElementById('product-catalog-container');
    const cartItemsList = document.getElementById('cart-items-list');
    const cartCounter = document.getElementById('cart-counter');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const cartNotice = document.getElementById('cart-live-notice');

    if (catalogContainer) {
        // High Optimization Structured Mock Dataset
        const products = [
            { id: "p1", name: "Alpha Premium Workstation", price: 1299.00, desc: "High compute engineering hub with optimized processing matrix kernels." },
            { id: "p2", name: "Mechanical Tactile Core", price: 189.00, desc: "Acoustically tuned hot-swappable production development keyboard layout." },
            { id: "p3", name: "Quantum Matrix Monitor", price: 449.00, desc: "High dynamic contrast color array for absolute precise pixel visibility." },
            { id: "p4", name: "Ergonomic Kinetic Seating", price: 349.00, desc: "Automated lumbar tracking frame engineered for prolonged compiling cycles." }
        ];

        let cart = JSON.parse(localStorage.getItem('nitish-capstone-cart')) || [];

        const renderCatalog = () => {
            catalogContainer.innerHTML = '';
            products.forEach(prod => {
                const card = document.createElement('article');
                card.className = 'project-card';
                card.innerHTML = `
                    <div class="project-body">
                        <h2>${prod.name}</h2>
                        <p class="project-desc">${prod.desc}</p>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:auto;">
                            <span style="font-weight:800; font-size:1.2rem; color:var(--accent);">$${prod.price.toFixed(2)}</span>
                            <button class="btn btn-primary add-to-cart-btn" data-id="${prod.id}">Add To Cart</button>
                        </div>
                    </div>
                `;
                catalogContainer.appendChild(card);
            });
        };

        const renderCart = () => {
            cartItemsList.innerHTML = '';
            if (cart.length === 0) {
                cartItemsList.innerHTML = `<li style="color:var(--text-muted); list-style:none; padding:1rem; text-align:center;">Cart empty.</li>`;
                cartCounter.textContent = "0 Items";
                cartTotalPrice.textContent = "$0.00";
                return;
            }

            let totalItemsCount = 0;
            let combinedPriceSum = 0;

            cart.forEach(item => {
                totalItemsCount += item.quantity;
                combinedPriceSum += item.price * item.quantity;

                const li = document.createElement('li');
                li.className = 'cart-item-node';
                li.innerHTML = `
                    <div>
                        <div style="font-weight:600; font-size:0.9rem;">${item.name}</div>
                        <div style="font-size:0.85rem; color:var(--text-muted);">$${item.price.toFixed(2)} x ${item.quantity}</div>
                    </div>
                    <button class="cart-remove-btn" data-id="${item.id}" aria-label="Remove ${item.name} from item cluster">&times;</button>
                `;
                cartItemsList.appendChild(li);
            });

            cartCounter.textContent = `${totalItemsCount} ${totalItemsCount === 1 ? 'Item' : 'Items'}`;
            cartTotalPrice.textContent = `$${combinedPriceSum.toFixed(2)}`;
        };

        // Delegated Listeners for Adding Operations
        catalogContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart-btn')) {
                const pId = e.target.getAttribute('data-id');
                const targetProduct = products.find(p => p.id === pId);
                
                const existingItem = cart.find(item => item.id === pId);
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    cart.push({ ...targetProduct, quantity: 1 });
                }

                localStorage.setItem('nitish-capstone-cart', JSON.stringify(cart));
                renderCart();
                if (cartNotice) cartNotice.textContent = `${targetProduct.name} catalog cluster allocation incremented.`;
            }
        });

        // Delegated Listeners for Clearing Node Operations
        cartItemsList.addEventListener('click', (e) => {
            if (e.target.classList.contains('cart-remove-btn')) {
                const pId = e.target.getAttribute('data-id');
                cart = cart.filter(item => item.id !== pId);
                localStorage.setItem('nitish-capstone-cart', JSON.stringify(cart));
                renderCart();
                if (cartNotice) cartNotice.textContent = "Selected catalog block purged from local stack memory arrays.";
            }
        });

        document.getElementById('checkout-btn').addEventListener('click', () => {
            if (cart.length === 0) return;
            alert('⚙️ Order Pipeline Execution Emulated Successfully across Vercel cloud environments.');
            cart = [];
            localStorage.removeItem('nitish-capstone-cart');
            renderCart();
        });

        // Init Store Unit
        renderCatalog();
        renderCart();
    }
});