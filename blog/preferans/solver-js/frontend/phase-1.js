import * as globals from '../globals.js'
import { drawCard,
    calculateSteps,
    randomChoice,
    highlightElement,
    deHighlightElement,
    fadeCleaInsideElement } from './utils.js';
import { mod } from '../backend/utils.js'
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
        randomDealButton.onclick = async () => {
            randomDealButton.classList.add('button-selected')
            setTimeout(() => {
                randomDealButton.classList.add('button-deactivated')
                randomDealButton.classList.remove('button-selected')
            }, 100)
            await Promise.all(this.randomDeal(suit_containers, this.dispatcher.hands));
            globals.setTransitionLock(false);
            this.check();
        };
        this.updateHighlights();
        const promises = []
        for (const card_id of Object.keys(globals.CARDS)) {
            promises.push(this.createCard(card_id, suit_containers, this.dispatcher.hands))};
        await Promise.all(promises)
        window.addEventListener(
            'resize', 
            () => {Object.keys(globals.CARDS).forEach(
                card_id => drawCard(card_id))});
    };

    onMouseUpLogic(cardElement, targetElement) {
        return this.handleCard(cardElement, targetElement)
    };

    async dispatch() {
        Object.keys(globals.CARDS).forEach(card_id => {
            let cardElement = document.getElementById(card_id)
            cardElement.onclick = '';
            cardElement.style.cursor = 'default';
        });
        await fadeCleaInsideElement(this.master_middle)
        this.updateHighlights()
        for (let i=0; i<3; i++) {
            const hand_info_name = document.getElementById(`${globals.PLAYER_NAMES[i]}`)
            const hand_name = document.getElementById(`hand-${i}`)
            if (hand_info_name.classList.contains('text-focused')) {
                hand_info_name.classList.remove('text-focused');
                hand_name.classList.remove('background-focused')
            };
        };
        this.dispatcher.dispatch()
    };

    check() {
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

    activeHand() {
        for (let i=0; i<3; i++) {
            if (this.dispatcher.hands[i].childNodes.length < 10) {
                const handElement = document.getElementById(`hand-${i}`)
                return handElement;
            };
        };
        return NaN
    };

    handleCard(cardElement, targetElement) {
        return new Promise((resolve) => {
            const [vstep, hstep, cstep] = calculateSteps();
            const card_id = parseInt(cardElement.id)
            const targetRect = targetElement.getBoundingClientRect()
            const cardRect = cardElement.getBoundingClientRect()
            let deltaX = targetRect.left - cardRect.left + globals.BORDER_WIDTH;
            let deltaY = targetRect.top - cardRect.top + globals.BORDER_WIDTH;
            let zIndex = 10;
            const isParentHandHorz = cardElement.parentElement.classList.contains('hand-horz')
            const isParentHandVert = cardElement.parentElement.classList.contains('hand-vert')
            const isTargetHandHorz = targetElement.classList.contains('hand-horz')
            const isTargetHandVert = targetElement.classList.contains('hand-vert')
            const isTargetHand = isTargetHandHorz || isTargetHandVert
            const isParentHand = isParentHandHorz || isParentHandVert
            const isParentTargetSameHand = cardElement.parentElement.id == targetElement.id
            const parentElement = cardElement.parentElement
            let X = 0;
            let Y = 0;
            let DeltaX = 0;
            let DeltaY = 0;
            let card_idx = 0;
            if (isTargetHand) {
                cardElement.style.zIndex = card_id + 1010;
                zIndex += card_id + 1000;
                for (let i=0; i<targetElement.childNodes.length; i++) {
                    if (parseInt(targetElement.childNodes[i].id) < card_id) {
                        card_idx += 1;
                    }
                    else {
                        break;
                    };
                };
                if (isTargetHandHorz) {
                    X += hstep*card_idx
                    deltaX += hstep*card_idx
                    DeltaX = hstep
                };
                if (isTargetHandVert) {
                    Y += vstep*card_idx
                    deltaY += vstep*card_idx
                    DeltaY = vstep
                };
                if (!isParentTargetSameHand) {
                    for (let i=card_idx; i<targetElement.childNodes.length; i++) {
                        targetElement.childNodes[i].style.transform = `translate(${DeltaX}px, ${DeltaY}px)`;
                    };
                };
            };
            let target_card_idx = card_idx;
            card_idx = 0;
            DeltaX = 0;
            DeltaY = 0;
            if (isParentHand) {
                for (let i=0; i<parentElement.childNodes.length; i++) {
                    if (parseInt(parentElement.childNodes[i].id) < card_id) {
                        card_idx += 1;
                    }
                    else {
                        break;
                    };
                };
                if (isParentHandHorz) {
                    DeltaX = -hstep
                };
                if (isParentHandVert) {
                    DeltaY = -vstep
                };
                if (!isParentTargetSameHand) {
                    for (let i=card_idx+1; i<parentElement.childNodes.length; i++) {
                        parentElement.childNodes[i].style.transform = `translate(${DeltaX}px, ${DeltaY}px)`;
                    };
                };
            };
            let parent_card_idx = card_idx;
            if (!isTargetHand) {
                X += cstep*mod(card_id, 8)
                deltaX += cstep*mod(card_id, 8)
                zIndex += card_id;
            };
            cardElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`; 
            cardElement.style.offsetHeight;    
            setTimeout(() => {
                cardElement.style.zIndex = zIndex;
                if (isTargetHand && !isParentTargetSameHand) {
                    for (let i=target_card_idx; i<targetElement.childNodes.length; i++) {
                        targetElement.childNodes[i].style.transform = '';
                        if (isTargetHandHorz) {
                            targetElement.childNodes[i].style.left = `${(i+1)*hstep}px`
                            targetElement.childNodes[i].offsetWidth;
                        }
                        if (isTargetHandVert) {
                            targetElement.childNodes[i].style.top = `${(i+1)*vstep}px`
                            targetElement.childNodes[i].offsetHeight;
                        }
                    };
                } 
                if (isParentHand && !isParentTargetSameHand) {
                    for (let i=parent_card_idx+1; i<parentElement.childNodes.length; i++) {
                        parentElement.childNodes[i].style.transform = '';
                        if (isParentHandHorz) {
                            parentElement.childNodes[i].style.left = `${(i-1)*hstep}px`
                            parentElement.childNodes[i].offsetWidth;
                        }
                        if (isParentHandVert) {
                            parentElement.childNodes[i].style.top = `${(i-1)*vstep}px`
                            parentElement.childNodes[i].offsetHeight;
                        }
                    };
                }
                if (!isTargetHand) {
                    deHighlightElement(targetElement)
                }
                cardElement.parentElement.removeChild(cardElement)
                targetElement.appendChild(cardElement);
                cardElement.style.transform = '';
                cardElement.style.top = `${Y}px`;
                cardElement.style.left = `${X}px`;
                this.sortHands();
                this.updateHighlights();
                this.check();  
                resolve();
                globals.setTransitionLock(false)                     
            }, 1000*globals.TRANSITION_TIME)
        });
    };

    createCard(card_id, containers) {
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
            cardElement.onclick = async () => {
                if (!this.dispatcher.drag_dispatcher.isActiveDragging && !globals.getTransitionLock()) {
                    let targetElement = NaN;
                    globals.setTransitionLock(true)
                    if (!cardElement.parentElement.id.includes('container')) {
                        const suit = globals.CARDS[parseInt(cardElement.id)].suit
                        const container = document.getElementById(`container-${suit}`)
                        targetElement = container
                    }
                    else {
                        targetElement = this.activeHand();
                    }
                    await this.handleCard(cardElement, targetElement)
                }
            };
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

    sortHands() {
        this.dispatcher.hands.forEach(hand => {
            const childrenArray = Array.from(hand.childNodes);
            childrenArray.sort((a, b) => {
                return parseInt(a.id) - parseInt(b.id);
            });
            childrenArray.forEach(child => {
                hand.appendChild(child);
            });
        });
    };

    randomDeal(containers) {
        globals.setTransitionLock(true)
        const promises = []
        var freeElements = [];
        containers.forEach(container => {
            for (let i = 0; i < container.childNodes.length; i++) {
                freeElements.push(container.childNodes[i]);
            }
        });
        let transitionOrder = 0
        for (let hand_id = 0; hand_id<3; hand_id++) {
            const to_select = 10 - this.dispatcher.hands[hand_id].childNodes.length;
            let selected = randomChoice(freeElements, to_select);
            for (let i=0; i<selected.length; i++) {
                freeElements = freeElements.filter(el => el !== selected[i]);
            }
            for (let i=0; i<this.dispatcher.hands[hand_id].childNodes.length; i++) {
                selected.push(this.dispatcher.hands[hand_id].childNodes[i]);
            }
            selected.sort((a, b) => {
                return parseInt(a.id) - parseInt(b.id);
            });
            let currTimeout = 0;
            for (let i=0; i<10; i++) {
                promises.push(new Promise((resolve) => {
                    if (selected[i].parentElement.id.includes('container')) {
                        currTimeout = transitionOrder*30;
                        transitionOrder += 1;
                    };
                    setTimeout(() => {
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
                            if (this.dispatcher.hands[hand_id].classList.contains("hand-horz")) {
                                selected[i].style.left = `${hstep*i}px`;
                                selected[i].style.top = `0px`;
                            }
                            if (this.dispatcher.hands[hand_id].classList.contains("hand-vert")) {
                                selected[i].style.top = `${vstep*i}px`;
                                selected[i].style.left = `0px`;
                            }
                            selected[i].offsetWidth;
                            selected[i].offsetHeight;
                            selected[i].style.transform = '';
                            this.dispatcher.hands[hand_id].appendChild(selected[i]);
                            resolve();
                        }, 1000*globals.TRANSITION_TIME);
                    }, currTimeout);
                }));
            };
        };
        return promises
    };

    updateHighlights() {
        const activeHand = this.activeHand();
        for (const handElement of this.dispatcher.hands) {
            if (handElement.id == activeHand.id) {
                highlightElement(handElement)
            }
            else {
                deHighlightElement(handElement)
            }
        };
    };
};
