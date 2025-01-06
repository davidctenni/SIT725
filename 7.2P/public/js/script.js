document.addEventListener('DOMContentLoaded', function() {
    // Initialize Materialize components
    M.AutoInit();
    
    // Initialize Socket.io connection
    const socket = io();
    
    // DOM Elements
    const searchInput = document.querySelector('#search');
    const cardsContainer = document.querySelector('#dishCards');
    const timelineContainer = document.querySelector('.timeline');
    const mealNameInput = document.querySelector('#meal_name');
    const selectedDishesCollection = document.querySelector('.collection');
    
    // State management
    let selectedDishes = new Set(); // Keep track of current dishes
    let dishes = []; // Store all dishes data

    // Socket event listeners
    socket.on('connect', () => {
        console.log('Connected to server');
    });

    socket.on('dishUpdate', (update) => {
        const { type, dish, userId } = update;
        console.log(' Received dish update:', { type, dishName: dish.name, fromUser: userId });
        
        if (userId !== socket.id) { // Don't process our own updates
            if (type === 'selected') {
                if (!selectedDishes.has(dish.name)) {
                    selectedDishes.add(dish.name);
                    displayDish(dish);
                    M.toast({
                        html: `Someone selected ${dish.name}`,
                        classes: 'teal'
                    });
                }
            } else if (type === 'removed') {
                selectedDishes.delete(dish.name);
                const cardToRemove = document.getElementById(`dish-${dish.name.replace(/\s+/g, '-')}`);
                if (cardToRemove) {
                    cardToRemove.remove();
                    M.toast({
                        html: `Someone removed ${dish.name}`,
                        classes: 'red'
                    });
                    updateTimeline(); // Update timeline after removal
                }
            }
        }
    });
    socket.on('userCount', (count) => {
        M.toast({
            html: `${count} users currently planning meals`,
            classes: 'blue'
        });
    });

    // Fetch dishes from API
    fetch('/api/dishes')
        .then(response => response.json())
        .then(data => {
            console.log('Fetched data:', data);
            
            // Handle nested database structure
            dishes = data.dishes[0].dishes || [];
            
            if (dishes.length === 0) {
                console.error('No valid dishes found in data');
                return;
            }

            // Create autocomplete data object
            let autocompleteData = {};
            dishes.forEach(dish => {
                if (dish && dish.name) {
                    autocompleteData[dish.name] = null;
                }
            });

            // Initialize autocomplete with modified options
            const autocompleteElem = document.querySelector('.autocomplete');
            const instance = M.Autocomplete.init(autocompleteElem, {
                data: autocompleteData,
                minLength: 1,
                onAutocomplete: function(selectedName) {
                    const selectedDish = dishes.find(dish => dish.name === selectedName);
                    if (selectedDish) {
                        // Add to selected dishes if not already there
                        if (!selectedDishes.has(selectedName)) {
                            selectedDishes.add(selectedName);
                            displayDish(selectedDish);
                            // Emit socket event for dish selection
                            socket.emit('dishSelected', {
                                dish: selectedDish,
                                userId: socket.id
                            });
                        }
                        // Clear the search input
                        searchInput.value = '';
                    }
                }
            });

            // Initial display of all dishes
            dishes.forEach(dish => {
                if (dish && dish.name) {
                    displayDish(dish);
                }
            });
        })
        .catch(error => {
            console.error('Error fetching dishes:', error);
            cardsContainer.innerHTML = '<p class="red-text">Error loading dishes. Please try again later.</p>';
        });

    function displayDish(dish) {
        const newDishCard = document.createElement('div');
        newDishCard.className = 'col s12 m4';
        newDishCard.id = `dish-${dish.name.replace(/\s+/g, '-')}`;
        newDishCard.innerHTML = `
            <div class="card">
                <div class="card-image">
                    <img src="${dish.image}" alt="${dish.name}">
                    <span class="card-title">${dish.name}</span>
                    <a class="btn-floating halfway-fab waves-effect waves-light red remove-dish">
                        <i class="material-icons">remove</i>
                    </a>
                </div>
                <div class="card-content">
                    <p>Cooking time: ${dish.cookingTime}</p>
                    <p>Difficulty: ${dish.difficulty}</p>
                </div>
            </div>
        `;

        // Ability to remove dishes
        const removeButton = newDishCard.querySelector('.remove-dish');
        removeButton.addEventListener('click', () => {
            selectedDishes.delete(dish.name);
            // Remove the card
            const cardToRemove = document.getElementById(`dish-${dish.name.replace(/\s+/g, '-')}`);
            if (cardToRemove) {
                cardToRemove.remove();
            }
            console.log(' Removing dish locally:', dish.name);
            // Emit socket event for dish removal
            socket.emit('dishRemoved', {
                dish: dish,
                userId: socket.id
            });
            updateTimeline();
        });

        cardsContainer.appendChild(newDishCard);
    }

    function updateTimeline() {
        if (selectedDishes.size === 0) {
            timelineContainer.innerHTML = '<p class="grey-text">No dishes selected yet</p>';
            return;
        }

        // Sort dishes by cooking time
        const timelineDishes = Array.from(selectedDishes)
            .map(name => dishes.find(d => d.name === name))
            .sort((a, b) => {
                const timeA = parseInt(a.cookingTime);
                const timeB = parseInt(b.cookingTime);
                return timeB - timeA;
            });

        // Create timeline HTML
        const timelineHTML = timelineDishes.map(dish => `
            <div class="timeline-item">
                <div class="timeline-content">
                    <h6>${dish.name}</h6>
                    <p>${dish.cookingTime} - ${dish.difficulty}</p>
                </div>
            </div>
        `).join('');

        timelineContainer.innerHTML = timelineHTML;
    }

    // Handle meal name changes
    mealNameInput.addEventListener('change', (e) => {
        const mealName = e.target.value;
        if (mealName) {
            socket.emit('mealNameUpdate', {
                name: mealName,
                userId: socket.id
            });
        }
    });

    // Filter functionality
    const chips = document.querySelectorAll('.chip');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            const filter = chip.textContent.toLowerCase();
            // Implement filtering logic here
            socket.emit('filterApplied', {
                filter: filter,
                userId: socket.id
            });
        });
    });
});