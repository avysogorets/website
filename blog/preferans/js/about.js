import { createButton } from "./frontend/utils.js";
import { TRANSITION_TIME, INFO_FONT_SIZE } from "./globals.js";


function loadContent() {
    return new Promise((resolve) => {
        fetch('/blog/preferans/about.html')
            .then(response => {return response.text()})
            .then(data => {resolve(data)})
    });
}

const containerElement = document.getElementById('about-container');
const contentElement = document.createElement('div')
const buttonText = document.getElementById('about-button-text')
contentElement.classList.add('about-content')
contentElement.innerHTML = await (async () => loadContent())()
const aboutButton = createButton()
aboutButton.classList.add('about-button')
aboutButton.id = 'about-button'
const fadeDuration = (1000*TRANSITION_TIME + 600) / 2;
buttonText.style.transition = `opacity ${fadeDuration}ms ease`;
aboutButton.appendChild(buttonText)
aboutButton.clickLogic = () => {
    return new Promise((resolve) => {
        const main = document.getElementById('main');
        const mainRect = main.getBoundingClientRect()
        contentElement.style.display = 'flex'
        if (contentElement.classList.contains('open')) {
            contentElement.classList.toggle('open')
            buttonText.style.opacity = 0;
            setTimeout(() => {
                buttonText.innerHTML = "ABOUT"
                buttonText.style.opacity = 1;
            }, fadeDuration)
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
            buttonText.style.opacity = 0;
            setTimeout(() => {
                buttonText.innerHTML = `<i class='bx bx-x', style='font-size:${1.25*INFO_FONT_SIZE}px'></i>`
                buttonText.style.opacity = 1;
            }, fadeDuration)
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