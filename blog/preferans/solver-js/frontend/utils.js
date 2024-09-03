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