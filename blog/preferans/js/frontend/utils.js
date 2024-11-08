import { assert } from '../backend/utils.js';
import * as globals from '../globals.js'


export function drawCard(card_id) {
    const [vstep, hstep, cstep] = calculateSteps();
    const cardElement = document.getElementById(card_id);
    const card = globals.CARDS[card_id];
    if (!cardElement) {
        return;
    }
    if (cardElement.parentElement.classList.contains("suit-container")) {
        cardElement.style.left = `${parseInt(globals.CARDS[card_id].kind)*cstep}px`;
    };
    if (cardElement.parentElement.classList.contains("hand-vert")) {
        let idx = NaN;
        if (card.card_idx) {
            idx = card.card_idx;
        }
        else {
            idx = Array.from(cardElement.parentElement.childNodes).indexOf(cardElement);
        };
        cardElement.style.top = `${idx*vstep}px`;
    };
    if (cardElement.parentElement.classList.contains("hand-horz")) {
        let idx = NaN;
        if (card.card_idx) {
            idx = card.card_idx;
        }
        else {
            idx = Array.from(cardElement.parentElement.childNodes).indexOf(cardElement);
        };
        cardElement.style.left = `${idx*hstep}px`;
    };
};


export function getContainerOptions(phase_id, cardElement) {
    const container_options = []
    if (phase_id == 0) {
        for (let i=0; i<3; i++) {
            const hand = document.getElementById(`hand-${i}`);
            if (hand.childNodes.length < 10 || cardElement.parentElement.id == hand.id) {
                container_options.push(hand);
            };
        };
        const suit = globals.CARDS[parseInt(cardElement.id)].suit
        const card_container = document.getElementById(`container-${suit}`)
        container_options.push(card_container)
    };
    if (phase_id == 3) {
        const handId = cardElement.parentElement.id.split('-')[1]
        const trickCardContainer = document.getElementById(`trick-card-container-${handId}`)
        container_options.push(trickCardContainer)
        container_options.push(cardElement.parentElement)
    }
    return container_options;
};


export function calculateSteps() {
    var vert_hand_height = document.getElementById('hand-' + globals.WEST).offsetHeight;
    var horz_hand_width = document.getElementById('hand-' + globals.SOUTH).offsetWidth;
    if (document.getElementById('container-' + globals.SPADES)) {
        var suit_container_width = document.getElementById('container-' + globals.SPADES).offsetWidth;
        cstep = (suit_container_width - 2*globals.BORDER_WIDTH - globals.CARD_WIDTH) / 7;
    }
    else {
        cstep = 0;
    }
    var vstep = (vert_hand_height - globals.CARD_HEIGHT - 2*globals.BORDER_WIDTH) / 9;
    var hstep = (horz_hand_width - globals.CARD_WIDTH - 2*globals.BORDER_WIDTH) / 9;
    var cstep = (suit_container_width - 2*globals.BORDER_WIDTH - globals.CARD_WIDTH) / 7;
    return [vstep, hstep, cstep];
};


export function randomChoice(array, size) {
    const result = [];
    const usedIndices = new Set();
    while (result.length < size) {
        const randomIndex = Math.floor(Math.random() * array.length);
        if (!usedIndices.has(randomIndex)) {
            result.push(array[randomIndex]);
            usedIndices.add(randomIndex);
        }
    }
    return result;
};

export function createButton(isDraggable=false) {
    const buttonElement = document.createElement('button')
    buttonElement.lock = 0
    buttonElement.isDraggable = isDraggable
    buttonElement.clickLogic = async () => {
        throw ErrorEvent('click logic in not defined')
    }
    buttonElement.incLock = () => {
        buttonElement.lock += 1
        if (!buttonElement.classList.contains('locked')) {
            buttonElement.classList.add('locked')
        }
    }
    buttonElement.decLock = () => {
        buttonElement.lock -= 1
        assert(buttonElement.lock >= 0)
        if (buttonElement.lock == 0) {
            if (buttonElement.classList.contains('locked')) {
                buttonElement.classList.remove('locked')
            }
        }
    }
    buttonElement.setLock = (value) => {
        buttonElement.lock = value
        assert(buttonElement.lock >= 0)
        if (buttonElement.lock == 0) {
            if (buttonElement.classList.contains('locked')) {
                buttonElement.classList.remove('locked')
            }
        }
        else {
            if (!buttonElement.classList.contains('locked')) {
                buttonElement.classList.add('locked')
            }
        }
    }
    return buttonElement
}

export class MouseEventHandler {
    constructor(dispatcher) {
        this.eventElement = null;
        this.isActiveDragging = false;
        this.eventParams = {
            'offsetX': NaN,
            'offsetY': NaN,
            'clickOffsetX': NaN,
            'clickOffsetY': NaN,
            'initialX': NaN,
            'initialY': NaN}
        this.dispatcher = dispatcher;
        this.mainElement = document.getElementById("main")
    
        document.addEventListener('mousedown', async (event) => {
            event.preventDefault();
            const candidateElement = getButton(event.target)
            if (!this.eventElement && candidateElement) {
                const clientX = event.clientX;
                const clientY = event.clientY;
                this.registerEvent(clientX, clientY, candidateElement)
                await updateButtonsLock(globals.START)
            }
        });

        document.addEventListener('mousemove', (event) => {
            if (this.eventElement && this.eventElement.isDraggable) {
                this.handleMove(event.clientX, event.clientY);
            }
        });

        document.addEventListener('mouseup', async (event) => {
            if (this.eventElement) {
                const candidateElement = getButton(event.target, false)
                await this.clearEvent(candidateElement);
                await updateButtonsLock(globals.END)
            }
        });

        document.addEventListener('touchstart', async (event) => {
            event.preventDefault();
            const candidateElement = getButton(event.target)
            if (!this.eventElement && candidateElement) {
                const clientX = event.touches[0].clientX;
                const clientY = event.touches[0].clientY;
                this.registerEvent(clientX, clientY, candidateElement)
                await updateButtonsLock(globals.START)
            }
        });

        document.addEventListener('touchmove', (event) => {
            if (this.eventElement && this.eventElement.isDraggable) {
                const clientX = event.touches[0].clientX;
                const clientY = event.touches[0].clientY;
                this.handleMove(clientX, clientY);
            }
        });

        document.addEventListener('touchend', async (event) => {
            if (this.eventElement) {
                const candidateElement = getButton(event.target, false)
                await this.clearEvent(candidateElement);
                await updateButtonsLock(globals.END)
            }
        });
    };

    clearEvent(candidateElement) {
        this.eventElement.style.zIndex = parseInt(this.eventElement.style.zIndex)-2000;
        this.eventElement.classList.toggle('pressed')
        let eventPromise = Promise.resolve();
        if (this.eventElement.classList.contains('card')) {
            let closestTargetElement;
            if (this.isActiveDragging) {
                closestTargetElement = getClosestContainer(
                    this.dispatcher.phase_id,
                    this.eventElement);
            }
            eventPromise = this.eventElement.clickLogic(closestTargetElement);
        }
        else {
            if (this.eventElement === candidateElement) {
                eventPromise = this.eventElement.clickLogic();
            };
        };
        this.eventElement = NaN
        this.isActiveDragging = false
        for (const key of Object.keys(this.eventParams)) {
            this.eventParams[key] = NaN;
        }
        return eventPromise
    };

    registerEvent(clientX, clientY, eventElement) {
        this.eventElement = eventElement;
        /*if (!this.eventElement.classList.contains('about-button')) {
            this.eventElement.style.position = 'absolute';
        }*/
        this.eventElement.style.zIndex = parseInt(eventElement.style.zIndex)+2000;
        this.eventElement.classList.toggle('pressed')
        const elementRect = this.eventElement.getBoundingClientRect();
        const parentRect = this.eventElement.parentElement.getBoundingClientRect();
        this.eventParams['offsetX'] = clientX - elementRect.left + parentRect.left;
        this.eventParams['offsetY'] = clientY - elementRect.top + parentRect.top;
        this.eventParams['clickOffsetX'] = clientX - elementRect.left
        this.eventParams['clickOffsetY'] = clientY - elementRect.top
        this.eventParams['initialX'] = clientX;
        this.eventParams['initialY'] = clientY;
    }

    handleMove(x, y) {
        /*  The mess with coordinates is partly caused by the fact that x, y,
            and Rect dimensions are all with respect to the screen, while
            style.top and style.left are with respcet to the parent element.
            Furthermore, when setting top/left properties of the card, one
            has to account for the position of the mouse on the card relative
            to the top-left corner of it (clickOffsetX, clickOffsetY). 
        */
        const left = x - this.eventParams['offsetX'];
        const top = y - this.eventParams['offsetY'];
        const DX2 = Math.pow(x - this.eventParams['initialX'], 2);
        const DY2 = Math.pow(y - this.eventParams['initialY'], 2);
        const parentRect = this.eventElement.parentElement.getBoundingClientRect();
        if (DX2 + DY2 > Math.pow(globals.DRAG_THRESHOLD, 2)) {
            this.isActiveDragging = true;
            this.eventElement.style.transform = 'none';
        }
        if (this.isActiveDragging) {
            const elementRect = this.eventElement.getBoundingClientRect();
            const mainRect = this.mainElement.getBoundingClientRect();
            if (y-this.eventParams['clickOffsetY'] < mainRect.top) {
                this.eventElement.style.top = `${mainRect.top-parentRect.top}px`;
            }
            else if (y-this.eventParams['clickOffsetY']+elementRect.height > mainRect.bottom) {
                this.eventElement.style.top = `${mainRect.bottom-parentRect.top-elementRect.height}px`;
            }
            else {
                this.eventElement.style.top = `${top}px`;
            }
            if (x-this.eventParams['clickOffsetX'] < mainRect.left) {
                this.eventElement.style.left = `${mainRect.left-parentRect.left}px`;
            }
            else if (x-this.eventParams['clickOffsetX']+elementRect.width > mainRect.right) {
                this.eventElement.style.left = `${mainRect.right-parentRect.left-elementRect.width}px`;
            }
            else {
                this.eventElement.style.left = `${left}px`;
            }
            const closestTargetElement = getClosestContainer(this.dispatcher.phase_id, this.eventElement);
            const options = getContainerOptions(this.dispatcher.phase_id, this.eventElement);
            highlightContainer(closestTargetElement, options);
        }
    };
};


function getButton(element, mindLock=true) {
    let candidateElement = element
    while (candidateElement.parentElement) {
        if (candidateElement.tagName === 'BUTTON') {
            if (!mindLock || candidateElement.lock == 0) {
                return candidateElement
            }
            else {
                return NaN
            }
        }
        candidateElement = candidateElement.parentElement;
    }
    return NaN
};


export function updateButtonsLock(eventType) {
    return new Promise((resolve) => {
        const buttons = document.getElementsByTagName("button")
        for (const button of buttons) {
            if (eventType == globals.START) {
                button.incLock()
            }
            else if (eventType == globals.END) {
                button.decLock()
            }  
            else if (eventType == globals.RESTART) {
                button.setLock(0)
            }
        }
        resolve()
    })
};


function getClosestContainer(phase_id, currElement) {
    const options = getContainerOptions(phase_id, currElement);
    let closestTargetElement = NaN;
    let closestDistance = Number.MAX_SAFE_INTEGER;
    const draggableRect = currElement.getBoundingClientRect();
    const draggableX = (draggableRect.left + draggableRect.right)/2
    const draggableY = (draggableRect.top + draggableRect.bottom)/2
    for (const targetElement of options) {
        const targetRect = targetElement.getBoundingClientRect();
        const h1 = draggableY - targetRect.top;
        const h2 = draggableY - targetRect.bottom;
        const w1 = draggableX - targetRect.left;
        const w2 = draggableX - targetRect.right;
        let distance = Number.MAX_SAFE_INTEGER
        if (h1*h2 < 0) {
            if (w1*w2 < 0) {
                return targetElement
            }
            distance = Math.min(distance, Math.abs(w1), Math.abs(w2))
        }
        if (w1*w2 < 0) {
            distance = Math.min(distance, Math.abs(h1), Math.abs(h2))
        }
        const distanceX = Math.min(Math.abs(w1), Math.abs(w2))
        const distanceY = Math.min(Math.abs(h1), Math.abs(h2))
        distance = Math.min(distance, Math.max(distanceX, distanceY))
        if (!closestDistance || distance<closestDistance) {
            closestDistance = distance;
            closestTargetElement = targetElement;
        };
    };
    return closestTargetElement
};


export function highlightContainer(container, options) {
    for (const element of options) {
        if (element.id == container.id) {
            highlightElement(element)
        }
        else {
            deHighlightElement(element)
        };
    };
};


export function highlightElement(element) {
    element.classList.add('background-focused')
    if (element.id.includes('hand')) {
        const idx = element.id.split('-')[1]
        const handName = document.getElementById(`${globals.PLAYER_NAMES[idx]}`)
        handName.classList.add('text-focused')
    };
};

export function deHighlightElement(element) {
    if (element.classList.contains('background-focused')) {
        element.classList.remove('background-focused')
        if (element.id.includes('hand')) {
            const idx = element.id.split('-')[1]
            const handName = document.getElementById(`${globals.PLAYER_NAMES[idx]}`)
            handName.classList.remove('text-focused')
        };
    };
};


export function fadeClearInsideElement(element) {
    return new Promise(async (resolve) => {
        for (const child of element.children) {
            child.style.transition = `opacity ${globals.TRANSITION_TIME}s ease-out`;
            child.style.opacity = '0';
        };
        await updateButtonsLock(globals.START)
        setTimeout(() => {
            while (element.firstChild) {
                element.removeChild(element.firstChild)
            };
            resolve();
        }, 1000*globals.TRANSITION_TIME);
    });
};
