document.addEventListener('DOMContentLoaded', function() {
    // Initialize other Materialize components
    M.AutoInit();
    
    const searchInput = document.querySelector('#search');
    const cardsContainer = document.querySelector('#dishCards');

    // Fetch dishes for autocomplete
    fetch('/dishes.json')
        .then(response => response.json())
        .then(data => {
            // Create autocomplete data object
            let autocompleteData = {};
            data.dishes.forEach(dish => {
                autocompleteData[dish.name] = null; // null for no icon
            });

            // Initialize autocomplete
            const autocompleteElem = document.querySelector('.autocomplete');
            M.Autocomplete.init(autocompleteElem, {
                data: autocompleteData,
                onAutocomplete: function(selectedName) {
                    // Find the selected dish
                    const selectedDish = data.dishes.find(dish => 
                        dish.name === selectedName
                    );
                    
                    if (selectedDish) {
                        displayDish(selectedDish);
                    }
                }
            });
        });

    function displayDish(dish) {
        const cardHTML = `
            <div class="col s12 m4">
                <div class="card">
                    <div class="card-image">
                        <img src="${dish.image}">
                        <span class="card-title">${dish.name}</span>
                        <a class="btn-floating halfway-fab waves-effect waves-light red">
                            <i class="material-icons">add</i>
                        </a>
                    </div>
                    <div class="card-content">
                        <p>Cooking time: ${dish.cookingTime}</p>
                        <p>Difficulty: ${dish.difficulty}</p>
                    </div>
                </div>
            </div>
        `;
        cardsContainer.innerHTML += cardHTML;
    }
});