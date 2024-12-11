function checkImagesLoaded() {
    const images = document.querySelectorAll('img');
    const content = document.getElementsByClassName('content')[0]
    const loader = document.getElementsByClassName('loader')[0]
    if (!loader || images.length === 0) {
        content.classList.remove('wait');
        return
    }
    let loadedImages = 0;
    images.forEach(img => {
        img.onload = function() {
            loadedImages++;
            if (loadedImages === images.length) {
                loader.style.display = 'none';
                content.classList.remove('wait');
            }
        };
        img.onerror = function() {
            loadedImages++;
            console.warn(`Failed to load image: ${img.src}`);
            if (loadedImages === images.length) {
                loader.style.display = 'none';
                content.classList.remove('wait');
            }
        };
        if (img.complete) {
            img.onload()
        }
    })
}

checkImagesLoaded();