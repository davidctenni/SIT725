
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Materialize components
    M.AutoInit();
    
    // Initialize chips
    var elems = document.querySelectorAll('.chips');
    var instances = M.Chips.init(elems, {
        placeholder: 'Add filter',
        secondaryPlaceholder: '+Filter'
    });

    
});