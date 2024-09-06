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

export class dragDispatcher {
    constructor(dispatcher) {
        this.threshold = globals.DRAG_THRESHOLD;
        this.currentDraggable = NaN;
        this.isActiveDragging = false;
        this.offsetX = NaN;
        this.offsetY = NaN;
        this.initialX = NaN;
        this.initialY = NaN;
        this.dispatcher = dispatcher;
        this.mouseDownConfig();
        this.mouseMoveConfig();
        this.mouseUpConfig();
    };

    mouseDownConfig() {
        document.addEventListener('mousedown', (event) => {
            event.preventDefault();
            let candidateDraggable = event.target
            let max_depth = 1
            while (!candidateDraggable.classList.contains("card")) {
                candidateDraggable = candidateDraggable.parentElement;
                max_depth -= 1;
                if (max_depth < 0) {
                    return;
                };
            };
            if (candidateDraggable.style.cursor == 'default') {
                return;
            }
            this.currentDraggable = candidateDraggable;
            this.currentDraggable.style.position = 'absolute';
            this.currentDraggable.style.zIndex = parseInt(this.currentDraggable.style.zIndex) + 1000;
            const draggableRect = this.currentDraggable.getBoundingClientRect();
            const parentRect = this.currentDraggable.parentElement.getBoundingClientRect();
            this.offsetX = event.clientX - draggableRect.left + parentRect.left;
            this.offsetY = event.clientY - draggableRect.top +  parentRect.top;
            this.initialX = event.clientX;
            this.initialY = event.clientY;
        });
    }

    mouseMoveConfig() {
        document.addEventListener('mousemove', (event) => {
            if (this.currentDraggable) {
                const left = event.clientX - this.offsetX;
                const top = event.clientY - this.offsetY;
                const DX2 = Math.pow(event.clientX-this.initialX,2)
                const DY2 = Math.pow(event.clientY-this.initialY,2)
                if (DX2 + DY2 > Math.pow(this.threshold,2)) {
                    this.isActiveDragging = true;
                    this.currentDraggable.style.transform = 'none'
                    this.currentDraggable.style.pointerEvents = 'none'
                };
                if (this.isActiveDragging) {
                    this.currentDraggable.style.left = `${left}px`;
                    this.currentDraggable.style.top = `${top}px`;
                    const closestTargetElement = getClosestContainer(
                            this.dispatcher.phase_id,
                            this.currentDraggable)
                    const options = getContainerOptions(
                        this.dispatcher.phase_id,
                        this.currentDraggable);
                    highlightContainer(closestTargetElement, options)
                };
            };
        });
    }

    mouseUpConfig() {
        document.addEventListener('mouseup', async () => {
            if (this.currentDraggable) {
                this.currentDraggable.style.zIndex = parseInt(this.currentDraggable.style.zIndex)-1000;
                if (this.isActiveDragging) {
                    const closestTargetElement = getClosestContainer(
                            this.dispatcher.phase_id,
                            this.currentDraggable)
                    const phase = this.dispatcher.phases[this.dispatcher.phase_id]
                    const currentDraggable =  this.currentDraggable;
                    this.currentDraggable = NaN;
                    await phase.onMouseUpLogic(currentDraggable, closestTargetElement)
                    currentDraggable.style.removeProperty('pointer-events')
                };
            };
            this.currentDraggable = NaN;
            this.isActiveDragging = false;
            this.offsetX = NaN;
            this.offsetY = NaN;
            this.initialX = NaN;
            this.initialY = NaN;
        });
    };
};

function getClosestContainer(phase_id, currElement) {
    const options = getContainerOptions(phase_id, currElement);
    let closestTargetElement = NaN;
    let closestDistance = Number.MAX_SAFE_INTEGER;
    for (const targetElement of options) {
        const targetRect = targetElement.getBoundingClientRect();
        const targetX = (targetRect.left + targetRect.right)/2
        const targetY = (targetRect.top + targetRect.bottom)/2
        const draggableRect = currElement.getBoundingClientRect();
        const draggableX = (draggableRect.left + draggableRect.right)/2
        const draggableY = (draggableRect.top + draggableRect.bottom)/2
        const distance = Math.pow(targetX-draggableX, 2) + Math.pow(targetY-draggableY, 2)
        if (!closestDistance || distance<closestDistance) {
            closestDistance = distance;
            closestTargetElement = targetElement;
        };
    };
    return closestTargetElement
}


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
}

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


export function fadeCleaInsideElement(element) {
    return new Promise((resolve) => {
        for (const child of element.children) {
            child.style.transition = `opacity ${globals.TRANSITION_TIME}s ease-out`;
            child.style.opacity = '0';
        };
        setTimeout(() => {
            while (element.firstChild) {
                element.removeChild(element.firstChild)
            };
            resolve();
        }, 1000*globals.TRANSITION_TIME);
    });
}