const aboutButton = document.getElementById('about-button')
aboutButton.onclick = () => {
    const content = document.getElementById('about-content');
    const background = document.getElementById('about-background');
    const main = document.getElementById('main');
    content.style.display = 'flex'
    if (content.classList.contains('open')) {
        content.classList.toggle('open')
        main.style.position = 'relative'
        setTimeout(() => {
            background.classList.toggle('open')
            main.classList.toggle('blurred')
            setTimeout(() => {
                content.style.display = 'none'
                aboutButton.classList.toggle('button-deactivated')
            }, 300)
        }, 300)
    }
    else {
        main.classList.toggle('blurred')
        main.style.position = 'fixed'
        background.classList.toggle('open')
        setTimeout(() => {
            content.classList.add('open')
            aboutButton.classList.toggle('button-deactivated')
        }, 300)
    };
    aboutButton.classList.toggle('button-selected')
    setTimeout(() => {
        aboutButton.classList.toggle('button-selected')
        aboutButton.classList.toggle('button-deactivated')
    }, 100)
}
  