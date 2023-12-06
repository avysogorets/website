const button = document.querySelector('.menu-icon');
button.addEventListener('click', () => {
    const element = document.querySelector('.menu-dropdown');
    element.classList.toggle('visible');
    if (element.classList.contains('visible')) {
            element.style.maxHeight = element.scrollHeight + "px";
    } else {
            element.style.maxHeight = null;
    }    
});

function toggleSubcategories(id) {
    var subcategories = document.getElementById(id);
    subcategories.classList.toggle('visible');
    if (subcategories.classList.contains('visible')) {
        subcategories.style.maxHeight = subcategories.scrollHeight + "px";
    } else {
        subcategories.style.maxHeight = null;
    }
}