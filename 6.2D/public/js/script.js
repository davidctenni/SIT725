document.addEventListener('DOMContentLoaded', function() {
    M.AutoInit();
    
    const searchInput = document.querySelector('#search');
    const cardsContainer = document.querySelector('#dishCards');
    let selectedDishes = new Set(); // Keep the current dishes

    fetch('/api/dishes')
        .then(response => response.json())
        .then(data => {
            console.log('Fetched data:', data);
            
            // When setting up the mongodb i  nested the database so need to extract it
            const dishes = data.dishes[0].dishes || [];
            
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
                        }
                        // Clear the search input
                        searchInput.value = '';
                    }
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

        // Ability to remove dishes you mistakenly chose or no longer want
        const removeButton = newDishCard.querySelector('.remove-dish');
        removeButton.addEventListener('click', () => {
            selectedDishes.delete(dish.name);
            newDishCard.remove();
        });

        cardsContainer.appendChild(newDishCard);
    }
});