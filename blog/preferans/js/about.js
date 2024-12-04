import { createButton } from "./frontend/utils.js";
import * as globals from "./globals.js";


function loadContent() {
    return new Promise((resolve) => {
        fetch('/blog/preferans/about.html')
            .then(response => {return response.text()})
            .then(data => {resolve(data)})
    });
}

export function createAbout() {
    return new Promise(async (resolve) => {
        const containerElement = document.getElementById('about-container');
        const contentElement = document.createElement('div')
        const buttonText = document.createElement('span')
        contentElement.classList.add('about-content')
        const aboutButton = createButton()
        aboutButton.classList.add('about-button')
        aboutButton.appendChild(buttonText)
        const fadeDuration = (1000*globals.CSS_VARIABLES["transition-time"] + 600) / 2;
        buttonText.style.transition = `opacity ${fadeDuration}ms ease`;
        buttonText.innerHTML = 'ABOUT'
        contentElement.innerHTML = await (async () => loadContent())()
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
                        let size = 1.25*globals.CSS_VARIABLES["info-font-size"]
                        buttonText.innerHTML = `<i class='bx bx-x', style='font-size:${size}px'></i>`
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
                        }, 1000*globals.CSS_VARIABLES["transition-time"])
                    }, 300)
                };
            });
        }
        containerElement.appendChild(aboutButton)
        containerElement.appendChild(contentElement)
        resolve()
    })
}