import * as globals from '../globals.js'
import { drawCard,
    calculateSteps,
    randomChoice,
    createButton,
    highlightElement,
    deHighlightElement,
    fadeClearInsideElement,
    refreshLayout,
    updateLayout} from './utils.js';
import { mod } from '../backend/utils.js'
import { IMAGES } from './frontend.js'


export class Phase_1 {
    constructor(dispatcher) {
        this.dispatcher = dispatcher;
        this.master_middle = document.getElementById(globals.MASTER_MIDDLE);
        this.dispatched = false
    };

    handleLayout() {
        return new Promise((resolve) => {
            const layout = updateLayout()
            if (layout === globals.LAYOUT_MOBILE) {
                this.cardContainer.className = 'card-container-mobile'
                this.suitStrip.style.visibility = 'visible'
                for (let i=0; i<globals.SUIT_NAMES.length; i++) {
                    const suitContainer = document.getElementById(`container-${i}`)
                    suitContainer.className = 'suit-container-vert'
                    suitContainer.style.left = this.suitContainerLefts[i]
                    if (i != this.activeSuit) {
                        suitContainer.style.visibility = 'hidden'
                    }
                    else {
                        suitContainer.style.visibility = 'visible'
                    }
                }
            }
            if (layout === globals.LAYOUT_DESKTOP) {
                this.cardContainer.className = 'card-container-desktop'
                this.suitStrip.style.visibility = 'hidden'
                for (let i=0; i<globals.SUIT_NAMES.length; i++) {
                    const suitContainer = document.getElementById(`container-${i}`)
                    suitContainer.className = 'suit-container-horz'
                    suitContainer.style.visibility = 'visible'
                    suitContainer.style.left = ''
                }
            }
            refreshLayout()
            resolve()
        })
    }

    async init() {
        return new Promise(async (resolve) => {
            const phase_middle = document.createElement('div');
            phase_middle.className = 'middle-phase-1';
            this.master_middle.appendChild(phase_middle)
            this.cardContainer = document.createElement('div');
            this.cardContainer.className = 'card-container-desktop';
            const suitContainers = [
                document.createElement('div'),
                document.createElement('div'),
                document.createElement('div'),
                document.createElement('div')];
            this.suitContainerLefts = []
            for (let i=0; i<suitContainers.length; i++) {
                suitContainers[i].className = 'suit-container-horz'
                suitContainers[i].id = `container-${i}`
                this.suitContainerLefts.push(suitContainers[i].style.left)
            };
            this.suitStrip = document.createElement('div')
            this.suitStrip.classList.add('button-strip')
            this.suitStrip.style.visibility = 'hidden';
            this.activeSuit = globals.SPADES
            this.suitStrip.style.gridTemplateColumns = `repeat(4, 1fr)`
            for (const suit of globals.SUIT_NAMES) {
                const suitButton = createButton()
                suitButton.appendChild(IMAGES["suits"]["normal"][suit])
                this.suitStrip.appendChild(suitButton)
            }
            for (let i=0; i<globals.SUIT_NAMES.length; i++) {
                const thisSuitButton = this.suitStrip.childNodes[i]
                thisSuitButton.clickLogic = () => {
                    this.switchActiveSuit(i)
                }
            }
            const spadesButton = this.suitStrip.childNodes[globals.SPADES]
            spadesButton.classList.add('selected')
            spadesButton.removeChild(spadesButton.firstChild)
            spadesButton.appendChild(IMAGES["suits"]["selected"][globals.SUIT_NAMES[globals.SPADES]])
            this.suitStrip.style.width = `${7*globals.CSS_VARIABLES["font-size"]}px`
            phase_middle.appendChild(this.suitStrip)
            phase_middle.appendChild(this.cardContainer)
            const buttonStrip = document.createElement('div');
            buttonStrip.classList.add('button-strip')
            buttonStrip.style.gridTemplateColumns = `repeat(1, 1fr)`
            const randomDealButton = createButton()
            randomDealButton.innerHTML = 'RANDOM';
            randomDealButton.clickLogic = () => {
                return this.randomDeal(suitContainers, this.dispatcher.hands);
            };
            buttonStrip.appendChild(randomDealButton)
            phase_middle.appendChild(buttonStrip)
            for (const suitContainer of suitContainers) {
                this.cardContainer.appendChild(suitContainer)
            }
            this.updateHighlights();
            const promises = []
            const loadingElement = document.getElementById('loading')
            loadingElement.parentElement.removeChild(loadingElement)
            document.getElementById('main').style.opacity = 1;
            for (const card_id of Object.keys(globals.CARDS)) {
                promises.push(this.createCard(card_id, suitContainers, this.dispatcher.hands))};
            await this.handleLayout()
            await Promise.all(promises)
            window.addEventListener('resize', () => {
                if (this.dispatcher.phase_id == 0) {
                    this.handleLayout()
                }
            });
            resolve();
        })
    };

    switchActiveSuit(suitId) {
        const thisSuit = globals.SUIT_NAMES[suitId]
        const thisSuitButton = this.suitStrip.childNodes[suitId]
        return new Promise(async (resolve) => {
            for (let j=0; j<globals.SUIT_NAMES.length; j++) {
                const thatSuitButton = this.suitStrip.childNodes[j]
                const thatSuit = globals.SUIT_NAMES[j]
                thatSuitButton.removeChild(thatSuitButton.firstChild)
                thatSuitButton.appendChild(IMAGES["suits"]["normal"][thatSuit])
                thatSuitButton.classList.remove('selected')
            }
            this.cardContainer.style.overflowX = 'hidden'
            thisSuitButton.removeChild(thisSuitButton.firstChild)
            thisSuitButton.appendChild(IMAGES["suits"]["selected"][thisSuit])
            thisSuitButton.classList.add('selected')
            const computedStyles = window.getComputedStyle(this.cardContainer);
            let shiftX = globals.CSS_VARIABLES["card-width"]
            shiftX += 2*globals.CSS_VARIABLES["border-width"]
            shiftX += 2*globals.CSS_VARIABLES["card-border"]
            shiftX += parseFloat(computedStyles.columnGap)
            const promises = []
            const spadesContainer = document.getElementById(`container-${globals.SPADES}`)
            for (let j=0; j<globals.SUIT_NAMES.length; j++) {
                const thatContainer = document.getElementById(`container-${j}`)
                const baseLeft = this.cardContainer.getBoundingClientRect().left
                const fisrtLeft = spadesContainer.getBoundingClientRect().left
                const offsetLeft = fisrtLeft-baseLeft
                thatContainer.style.transform = `translate(${-suitId*shiftX-offsetLeft}px, 0px)`;
                thatContainer.style.transition = ''
                thatContainer.style.visibility = 'visible'
                promises.push(new Promise((resolve) => {
                    setTimeout(() => {
                        if (suitId != j) {
                            thatContainer.style.visibility = 'hidden'
                        }
                        thatContainer.style.transform = 'none'
                        thatContainer.style.transition = 'none'
                        thatContainer.style.left = `${-suitId*shiftX}px`
                        this.suitContainerLefts[j] = `${-suitId*shiftX}px`
                        resolve()
                    }, 1000*globals.CSS_VARIABLES["transition-time"])
                }))
            }
            this.activeSuit = suitId;
            await Promise.all(promises)
            this.cardContainer.style.overflowX = 'visible'
            resolve()
        })
    }

    async dispatch() {
        await fadeClearInsideElement(this.master_middle)
        this.updateHighlights()
        for (let i=0; i<3; i++) {
            const hand_info_name = document.getElementById(`${globals.PLAYER_NAMES[i]}`)
            const handElement = document.getElementById(`hand-${i}`)
            if (hand_info_name.classList.contains('text-focused')) {
                hand_info_name.classList.remove('text-focused');
                handElement.classList.remove('background-focused')
            }
        }
        this.dispatcher.dispatch()
    };

    check() {
        let to_exit = true
        this.dispatcher.hands.forEach(hand => {
            if (hand.childNodes.length < 10) {
                to_exit = false
            };
        });
        if (to_exit && !this.dispatched) {
            this.dispatched = true
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
            const layout = updateLayout()
            const [vstep, hstep, cstep] = calculateSteps(layout);
            const card_id = parseInt(cardElement.id)
            const targetRect = targetElement.getBoundingClientRect()
            const cardRect = cardElement.getBoundingClientRect()
            let deltaX = targetRect.left - cardRect.left + globals.CSS_VARIABLES["border-width"];
            let deltaY = targetRect.top - cardRect.top + globals.CSS_VARIABLES["border-width"];
            let zIndex = 10;
            const parentElement = cardElement.parentElement
            const isParentHorz = parentElement.className.includes('horz')
            const isParentVert = parentElement.className.includes('vert')
            const isTargetHorz = targetElement.className.includes('horz')
            const isTargetVert = targetElement.className.includes('vert')
            const isTargetHand = targetElement.className.includes('hand')
            const isParentHand = parentElement.className.includes('hand')
            const isParentTargetSame = parentElement.id == targetElement.id
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
                if (isTargetHorz) {
                    X += hstep*card_idx
                    deltaX += hstep*card_idx
                    DeltaX = hstep
                };
                if (isTargetVert) {
                    Y += vstep*card_idx
                    deltaY += vstep*card_idx
                    DeltaY = vstep
                };
                if (!isParentTargetSame) {
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
                if (isParentHorz) {
                    DeltaX = -hstep
                };
                if (isParentVert) {
                    DeltaY = -vstep
                };
                if (!isParentTargetSame) {
                    for (let i=card_idx+1; i<parentElement.childNodes.length; i++) {
                        parentElement.childNodes[i].style.transform = `translate(${DeltaX}px, ${DeltaY}px)`;
                    };
                };
            };
            let parent_card_idx = card_idx;
            if (!isTargetHand) {
                if (isTargetHorz) {
                    X += cstep*mod(card_id, 8)
                    deltaX += cstep*mod(card_id, 8)
                }
                if (isTargetVert) {
                    Y += cstep*mod(card_id, 8)
                    deltaY += cstep*mod(card_id, 8)
                }
                zIndex += card_id;
            };
            cardElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`; 
            cardElement.style.offsetHeight;    
            setTimeout(() => {
                cardElement.style.zIndex = zIndex;
                if (isTargetHand && !isParentTargetSame) {
                    for (let i=target_card_idx; i<targetElement.childNodes.length; i++) {
                        targetElement.childNodes[i].style.transform = '';
                        if (isTargetHorz) {
                            targetElement.childNodes[i].style.left = `${(i+1)*hstep}px`
                            targetElement.childNodes[i].offsetWidth;
                        }
                        if (isTargetVert) {
                            targetElement.childNodes[i].style.top = `${(i+1)*vstep}px`
                            targetElement.childNodes[i].offsetHeight;
                        }
                    };
                } 
                if (isParentHand && !isParentTargetSame) {
                    for (let i=parent_card_idx+1; i<parentElement.childNodes.length; i++) {
                        parentElement.childNodes[i].style.transform = '';
                        if (isParentHorz) {
                            parentElement.childNodes[i].style.left = `${(i-1)*hstep}px`
                            parentElement.childNodes[i].offsetWidth;
                        }
                        if (isParentVert) {
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
            }, 1000*globals.CSS_VARIABLES["transition-time"])
        });
    };

    createCard(card_id, containers) {
        return new Promise(resolve => {
            const cardElement = createButton(true);
            cardElement.classList.add('card');
            cardElement.appendChild(IMAGES["normal"][card_id])
            cardElement.id = `${card_id}`;
            cardElement.style.animation = `fadeIn ${0.1+0.1*globals.CARDS[card_id].kind}s ease forwards`;
            cardElement.style.animationDelay = '0.1s';
            cardElement.style.opacity = 0;
            cardElement.style.zIndex = 10 + parseInt(card_id);
            const suitId = parseInt(globals.CARDS[card_id].suit)
            const parentContainer = containers[suitId]
            parentContainer.appendChild(cardElement);
            cardElement.clickLogic = async (targetElement=NaN) => {
                if (!targetElement) {
                    if (cardElement.parentElement === parentContainer) {
                        targetElement = this.activeHand()
                    }
                    else {
                        const layout = updateLayout()
                        targetElement = parentContainer;
                        if (layout === globals.LAYOUT_MOBILE && !this.dispatched && this.activeSuit != suitId) {
                            await this.switchActiveSuit(suitId)
                        }
                    }
                }
                return this.handleCard(cardElement, targetElement)
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

    async randomDeal(containers) {
        const promises = []
        var freeElements = [];
        containers.forEach(container => {
            for (let i = 0; i < container.childNodes.length; i++) {
                freeElements.push(container.childNodes[i]);
            }
        });
        const layout = updateLayout()
        if (layout === globals.LAYOUT_MOBILE) {
            const computedStyles = window.getComputedStyle(this.cardContainer);
            let shiftX = globals.CSS_VARIABLES["card-width"]
            shiftX += 2*globals.CSS_VARIABLES["border-width"]
            shiftX += 2*globals.CSS_VARIABLES["card-border"]
            shiftX += parseFloat(computedStyles.columnGap)
            for (let i=0; i<globals.SUIT_NAMES.length; i++) {
                containers[i].style.left = `${-i*shiftX}px`
                containers[i].style.visibility = 'visible'
            }
        }
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
                        let deltaX = handRect.left - cardRect.left + globals.CSS_VARIABLES["border-width"];
                        let deltaY = handRect.top - cardRect.top + globals.CSS_VARIABLES["border-width"];
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
                            this.check()
                            resolve();
                        }, 1000*globals.CSS_VARIABLES["transition-time"]);
                    }, currTimeout); 
                }));
            };
        };
        return Promise.all(promises)
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
