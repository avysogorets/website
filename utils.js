
const button = document.querySelector('.menu-icon');
button.addEventListener('click', () => {
    const menu = document.querySelector('.menu-dropdown');
    menu.classList.toggle('visible');
    if (menu.classList.contains('visible')) {
        button.style.width = 150 + "px";
        menu.style.maxHeight = menu.scrollHeight + "px";
    } else {
        menu.style.maxHeight = null;
        setTimeout(closeMenu, 500);
    }
});

function WindowClick(e) {
    const menu = document.querySelector('.menu-dropdown');
    const icon = document.querySelector('.menu-icon');
    if (!icon.contains(e.target) && !menu.contains(e.target)) {
        menu.style.maxHeight = null;
        if (menu.classList.contains('visible')) {
            menu.classList.toggle('visible');
            setTimeout(closeMenu, 500);
        }
    }
}
window.addEventListener('click', WindowClick);
window.addEventListener('touchend', WindowClick);


function closeMenu() {
    const menu = document.querySelector('.menu-dropdown');
    const button = document.querySelector('.menu-icon');
    if (!menu.classList.contains('visible')) {
        button.style.width = 50 + "px";
    }
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
