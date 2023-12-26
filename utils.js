
const button = document.querySelector('.menu-icon');
button.addEventListener('click', () => {
    const element = document.querySelector('.menu-dropdown');
    element.classList.toggle('visible');
    if (element.classList.contains('visible')) {
        button.style.width = 150 + "px";
        element.style.maxHeight = element.scrollHeight + "px";
    } else {
            element.style.maxHeight = null;
            setTimeout(closeMenu, 500);
    }    
});

function WindowClick(e) {
    const element = document.querySelector('.menu-dropdown');
    const button = document.querySelector('.menu-icon');
    if (!button.contains(e.target) && !element.contains(e.target)) {
        element.style.maxHeight = null;
        if (element.classList.contains('visible')) {
            element.classList.toggle('visible');
            setTimeout(closeMenu, 500);
        }
    }
}
window.addEventListener('click', WindowClick);
window.addEventListener('touchend', WindowClick);


function closeMenu() {
    const button = document.querySelector('.menu-icon');
    button.style.width = 50 + "px";
}

function toggleSubcategories(id) {
    var subcategories = document.getElementById(id);
    subcategories.classList.toggle('visible');
    if (subcategories.classList.contains('visible')) {
        subcategories.style.maxHeight = subcategories.scrollHeight + "px";
    } else {
        subcategories.style.maxHeight = null;
    }
}

function jump(id) {
    const e = document.querySelector(id);
    const t = e.getClientRects()[0].y - 55;

    const c = document.querySelector('.content');
    c.scrollTo({top: t, behavior: "smooth"})
}

function toggleFocusable(id) {
    var element = document.getElementById(id);
    element.classList.toggle("focused");
}
