import * as globals from '../globals.js'
import { drawCard, calculateSteps, randomChoice } from './utils.js';
import { IMAGES } from './frontend.js'


export class Phase_1 {
    constructor(dispatcher) {
        this.dispatcher = dispatcher;
        this.master_middle = document.getElementById(globals.MASTER_MIDDLE);
    };

    async init() {
        const phase_middle = document.createElement('div');
        const card_container = document.createElement('div');
        phase_middle.className = 'middle-phase-1';
        card_container.className = 'card-container';
        const suit_containers = [
            document.createElement('div'),
            document.createElement('div'),
            document.createElement('div'),
            document.createElement('div')];
        for (let i=0; i<suit_containers.length; i++) {
            suit_containers[i].className = 'suit-container'
            suit_containers[i].id = `container-${i}`
        };
        const randomDealButton = document.createElement('button');
        randomDealButton.className = 'standard-button';
        randomDealButton.innerHTML = 'random deal';
        this.master_middle.appendChild(phase_middle)
        phase_middle.appendChild(card_container)
        suit_containers.forEach(suit_container => {
            card_container.appendChild(suit_container)
        });
        phase_middle.appendChild(randomDealButton)
        randomDealButton.addEventListener(
            'click',
            () => this._randomDeal(suit_containers, this.dispatcher.hands));
        this._updateMessage();
        const promises = []
        for (const card_id of Object.keys(globals.CARDS)) {
            promises.push(this._createCard(card_id, suit_containers, this.dispatcher.hands))};
        await Promise.all(promises)
        window.addEventListener(
            'resize', 
            () => {Object.keys(globals.CARDS).forEach(
                card_id => drawCard(card_id))});
    };

    dispatch() {
        Object.keys(globals.CARDS).forEach(card_id => {
            let cardElement = document.getElementById(card_id)
            cardElement.onclick = '';
            cardElement.style.cursor = 'default';
        });
        while (this.master_middle.firstChild) {
            this.master_middle.removeChild(this.master_middle.firstChild)
        };
        this._updateMessage()
        for (let i=0; i<3; i++) {
            const hand_name = document.getElementById(`${globals.PLAYER_NAMES[i]}`)
            if (hand_name.classList.contains('hand-focused')) {
                hand_name.classList.remove('hand-focused');
            };
        };
        this.dispatcher.dispatch()
    };

    _check() {
        let to_exit = true
        this.dispatcher.hands.forEach(hand => {
            if (hand.childNodes.length < 10) {
                to_exit = false
            };
        });
        if (to_exit) {
            this.dispatch();
        };
    };

    _createCard(card_id, containers) {
        return new Promise(resolve => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card');
            cardElement.appendChild(IMAGES["normal"][card_id])
            cardElement.id = `${card_id}`;
            cardElement.style.animation = `fadeIn ${0.1+0.1*globals.CARDS[card_id].kind}s ease forwards`;
            cardElement.style.animationDelay = '0.1s';
            cardElement.style.opacity = 0;
            cardElement.style.zIndex = 10 + parseInt(card_id);
            containers[parseInt(globals.CARDS[card_id].suit)].appendChild(cardElement);
            cardElement.onclick = () => this._selectCard(card_id)
            const [, , cstep] = calculateSteps();
            cardElement.style.left = `${globals.CARDS[card_id].kind*cstep}px`;
            cardElement.style.top = `0px`;
            setTimeout(() => {
                cardElement.style.animation = '';
                cardElement.style.animationDelay = '';
                cardElement.style.opacity = 1;
                resolve();
            }, 100 + 100 + 100*7);
        });
    };

    _sortHand(hand) {
        const childrenArray = Array.from(hand.childNodes);
        childrenArray.sort((a, b) => {
            return parseInt(a.id) - parseInt(b.id);
        });
        childrenArray.forEach(child => {
            hand.appendChild(child);
        });
    };

    _selectCard(card_id) {
        var curr_hand = 0;
        if (this.dispatcher.hands[curr_hand].childNodes.length == 10) {
            curr_hand += 1;
        };
        if (this.dispatcher.hands[curr_hand].childNodes.length == 10) {
            curr_hand += 1;
        };
        this._performSelection(card_id, curr_hand);
    };

    _performSelection(card_id, hand_id) {
        const hand = this.dispatcher.hands[hand_id];
        const [vstep, hstep, _] = calculateSteps();
        const cardElement = document.getElementById(card_id);
        cardElement.style.zIndex = parseInt(cardElement.style.zIndex) + 1000;
        const handRect = hand.getBoundingClientRect();
        const cardRect = cardElement.getBoundingClientRect();
        let insert_idx = 0;
        for (let i = 0; i < hand.childNodes.length; i++) {
            if (parseInt(hand.childNodes[i].id) < parseInt(card_id)) {
                insert_idx += 1;
            }
            else {
                break;
            };
        };
        var deltaX = handRect.left - cardRect.left + globals.BORDER_WIDTH;
        var deltaY = handRect.top - cardRect.top + globals.BORDER_WIDTH;
        let X = 0;
        let Y = 0;
        if (hand.classList.contains("hand-horz")) {
            deltaX += hstep*insert_idx;
            X = hstep*insert_idx;
            Y = 0;
        }
        if (hand.classList.contains("hand-vert")) {
            deltaY += vstep*insert_idx;
            X = 0;
            Y = vstep*insert_idx;
        }
        cardElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        for (let i = insert_idx; i < hand.childNodes.length; i++) {
            if (hand.classList.contains("hand-horz")) {
                deltaX = hstep;
                deltaY = 0;
            }
            if (hand.classList.contains("hand-vert")) {
                deltaX = 0;
                deltaY = vstep;
            };
            hand.childNodes[i].style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        };
        setTimeout(() => {
            for (let i = 0; i < hand.childNodes.length; i++) {
                if (i >= insert_idx) {
                    if (hand.classList.contains("hand-horz")) {
                        hand.childNodes[i].style.left = `${hstep*(i+1)}px`;
                    }
                    if (hand.classList.contains("hand-vert")) {
                        hand.childNodes[i].style.top = `${vstep*(i+1)}px`;
                    };  
                    hand.childNodes[i].style.transform = '';
                };
            };
            const container = cardElement.parentElement;
            hand.appendChild(cardElement);
            cardElement.style.transform = '';
            cardElement.style.top = `${Y}px`;
            cardElement.style.left = `${X}px`;
            cardElement.onclick = () => {
                this._performDeSelection(card_id, hand_id, container);
            };
            this._sortHand(hand);
            this._updateMessage();
            this._check();
        }, 1000*globals.TRANSITION_TIME);
    };

    _performDeSelection(card_id, hand_id, container) {
        const hand = this.dispatcher.hands[hand_id];
        const [vstep, hstep, cstep] = calculateSteps();
        const cardElement = document.getElementById(card_id);
        const cardRect = cardElement.getBoundingClientRect();
        const contRect = container.getBoundingClientRect();
        let delete_idx = 0;
        for (let i = 0; i < hand.childNodes.length; i++) {
            if (parseInt(hand.childNodes[i].id) < parseInt(card_id)) {
                delete_idx += 1;
            }
            else {
                break;
            };
        };
        let deltaX = contRect.left - cardRect.left + globals.BORDER_WIDTH;
        let deltaY = contRect.top - cardRect.top + globals.BORDER_WIDTH;
        deltaX += cstep*parseInt(globals.CARDS[card_id].kind);
        cardElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        let X = cstep*parseInt(globals.CARDS[card_id].kind);
        let Y = 0;
        for (let i = delete_idx + 1; i < hand.childNodes.length; i++) {
            if (hand.classList.contains("hand-horz")) {
                deltaX = -hstep;
                deltaY = 0;
            }
            if (hand.classList.contains("hand-vert")) {
                deltaX = 0;
                deltaY = -vstep;
            };
            hand.childNodes[i].style.transform = `translate(${deltaX}px, ${deltaY}px)`;
            };

        setTimeout(() => {
            for (let i = delete_idx+1; i < hand.childNodes.length; i++) {
                if (hand.classList.contains("hand-horz")) {
                    /*hand.childNodes[i].style.transition = 'none';*/
                    hand.childNodes[i].style.left = `${hstep*(i-1)}px`;
                    hand.childNodes[i].style.transform = '';
                    hand.childNodes[i].offsetWidth;
                    /*hand.childNodes[i].style.transition = `transform ${globals.TRANSITION_TIME}s ease-in-out, opacity ${globals.TRANSITION_TIME}`;*/
                }
                if (hand.classList.contains("hand-vert")) {
                    /*hand.childNodes[i].style.transition = 'none';*/
                    hand.childNodes[i].style.top = `${vstep*(i-1)}px`;
                    hand.childNodes[i].style.transform = '';
                    hand.childNodes[i].offsetHeight;
                    /*hand.childNodes[i].style.transition = `transform ${globals.TRANSITION_TIME}s ease-in-out, opacity ${globals.TRANSITION_TIME}`;*/
                };
            };
            container.appendChild(cardElement);
            cardElement.style.transform = '';
            cardElement.style.top = `${Y}px`;
            cardElement.style.left = `${X}px`;
            cardElement.style.zIndex = parseInt(cardElement.style.zIndex) - 1000;
            cardElement.onclick = () => {
                this._selectCard(card_id);
            };
            this._sortHand(hand)
            this._updateMessage();
        }, 1000*globals.TRANSITION_TIME);
    };

    _randomDeal(containers) {
        var freeElements = [];
        containers.forEach(container => {
            for (let i = 0; i < container.childNodes.length; i++) {
                freeElements.push(container.childNodes[i]);
            }
        });
        for (let hand_id = 0; hand_id < this.dispatcher.hands.length; hand_id++) {
            const to_select = 10 - this.dispatcher.hands[hand_id].childNodes.length;
            let selected = randomChoice(freeElements, to_select);
            for (let i = 0; i < selected.length; i++) {
                freeElements = freeElements.filter(el => el !== selected[i]);
            }
            for (let i = 0; i < this.dispatcher.hands[hand_id].childNodes.length; i++) {
                selected.push(this.dispatcher.hands[hand_id].childNodes[i]);
            }
            selected.sort((a, b) => {
                return parseInt(a.id) - parseInt(b.id);
            });
            for (let i = 0; i < 10; i++) {
                selected[i].style.zIndex = 1000 + parseInt(selected[i].id);
                const cardRect = selected[i].getBoundingClientRect();
                const handRect = this.dispatcher.hands[hand_id].getBoundingClientRect();
                const [vstep, hstep, _] = calculateSteps();
                let deltaX = handRect.left - cardRect.left + globals.BORDER_WIDTH;
                let deltaY = handRect.top - cardRect.top + globals.BORDER_WIDTH;

                if (this.dispatcher.hands[hand_id].classList.contains('hand-horz')) {
                    deltaX += i * hstep;
                }
                if (this.dispatcher.hands[hand_id].classList.contains('hand-vert')) {
                    deltaY += i * vstep;
                }
                selected[i].style.transform = `translate(${deltaX}px, ${deltaY}px)`;
                setTimeout(() => {
                    /*selected[i].style.transition = 'none';*/
                    if (this.dispatcher.hands[hand_id].classList.contains("hand-horz")) {
                        selected[i].style.left = `${hstep * i}px`;
                        selected[i].style.top = `0px`;
                    }
                    if (this.dispatcher.hands[hand_id].classList.contains("hand-vert")) {
                        selected[i].style.top = `${vstep * i}px`;
                        selected[i].style.left = `0px`;
                    }
                    selected[i].offsetWidth;
                    selected[i].offsetHeight;
                    selected[i].style.transform = '';
                    /*selected[i].style.transition = `transform ${globals.TRANSITION_TIME}s ease-in-out, opacity ${globals.TRANSITION_TIME}s`;*/
                    this.dispatcher.hands[hand_id].appendChild(selected[i]);
                    this._check()
                }, 1000*globals.TRANSITION_TIME);
            };
        };
    };

    _updateMessage() {
        const messageBox = document.getElementById(globals.MESSAGE_CONTAINER);
        for (let i=0; i<this.dispatcher.hands.length; i++) {
            if (this.dispatcher.hands[i].childNodes.length < 10) {
                messageBox.innerHTML = "SELECT CARDS FOR " + globals.PLAYER_NAMES[i];
                for (let j=0; j<3; j++) {
                    const hand_name = document.getElementById(`${globals.PLAYER_NAMES[j]}`)
                    if (i == j) {
                        hand_name.classList.add('hand-focused')
                    }
                    else {
                        if (hand_name.classList.contains('hand-focused')) {
                            hand_name.classList.remove('hand-focused')
                        };
                    };
                };
                return;
            };
        };
        messageBox.innerHTML = "&nbsp;";
    };
};
