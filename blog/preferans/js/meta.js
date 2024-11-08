import { createButton } from "./frontend/utils.js";
import { TRANSITION_TIME } from "./globals.js";


function loadContent() {
    return new Promise((resolve) => {
        fetch('/blog/preferans/about.html')
            .then(response => {return response.text()})
            .then(data => {resolve(data)})
    });
}

const containerElement = document.getElementById('about-container');
const contentElement = document.createElement('div')
contentElement.classList.add('about-content')
contentElement.innerHTML = await (async () => loadContent())()
const aboutButton = createButton()
aboutButton.classList.add('about-button')
aboutButton.id = 'about-button'
aboutButton.innerHTML = 'ABOUT'
aboutButton.clickLogic = () => {
    return new Promise((resolve) => {
        const main = document.getElementById('main');
        const mainRect = main.getBoundingClientRect()
        contentElement.style.display = 'flex'
        if (contentElement.classList.contains('open')) {
            contentElement.classList.toggle('open')
            setTimeout(() => {
                main.classList.toggle('blurred')
                containerElement.style.backgroundColor = 'transparent'
                setTimeout(() => {
                    contentElement.style.display = 'none'
                    main.style.position = 'relative'
                    main.style.top = ''
                    resolve()
                }, 300)
            }, 300)
        }
        else {
            main.classList.toggle('blurred')
            main.style.position = 'fixed'
            main.style.top = `${mainRect.top}px`
            containerElement.style.backgroundColor = 'rgba(220, 220, 220, 0.6)'
            setTimeout(() => {
                contentElement.classList.add('open')
                setTimeout(() => {
                    resolve()
                }, 1000*TRANSITION_TIME)
            }, 300)
        };
    });
}
while (containerElement.firstChild) {
    containerElement.removeChild(containerElement.firstChild);
}
containerElement.appendChild(aboutButton)
containerElement.appendChild(contentElement)