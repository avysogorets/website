import * as globals from '../globals.js'
import { Game } from '../backend/game.js'
import { Hand } from '../backend/hand.js'
import { createButton, fadeClearInsideElement } from './utils.js';

export class Phase_3 {  
    constructor(dispatcher) {
        this.dispatcher = dispatcher;
        this.master_middle = document.getElementById(globals.MASTER_MIDDLE);
    };

    init() {
        return new Promise((resolve) => {
            for (let i=0; i<3; i++) {
                for (const cardElement of this.dispatcher.hands[i].childNodes) {
                    cardElement.incLock()
                }
            }
            this.phase_middle = document.createElement("div");
            this.phase_middle.className = "middle-phase-3";
            this.phase_middle.id = "middle-phase-3";
            this.master_middle.appendChild(this.phase_middle);
            this.messageContainer = document.createElement('div')
            this.messageContainer.classList.add('message-container')
            this.phase_middle.appendChild(this.messageContainer)
            const buttonStrip = document.createElement('div');
            buttonStrip.classList.add('button-strip')
            buttonStrip.style.gridTemplateColumns = `repeat(1, 1fr)`
            this.startButton = createButton()
            this.startButton.innerHTML = 'START'
            this.startButton.classList.add('blocked')
            this.startButton.setLock(globals.RADIO_LOCK)
            this.startButton.style.fontWeight = 'bold'
            buttonStrip.appendChild(this.startButton)
            this.phase_middle.appendChild(buttonStrip);
            let parameters = this.dispatcher.phases[1].parameters;
            let type = globals.GAME_NAMES.indexOf(parameters["contract type"]);
            let player_id = globals.PLAYER_NAMES.indexOf(parameters["playing hand"]);
            let turn_id = globals.PLAYER_NAMES.indexOf(parameters["first hand"]);
            let trump_id = NaN;
            if (parameters["trump suit"] == "NA") {
                trump_id = globals.NO_TRUMP_ID;
            }
            else {
                trump_id = globals.SUIT_NAMES.indexOf(parameters["trump suit"]);
            };
            let hands = []
            for (let i=0; i<3; i++) {
                let cards = []
                this.dispatcher.hands[i].childNodes.forEach(cardElement => {
                    let card_id = parseInt(cardElement.id);
                    cards.push(globals.CARDS[card_id]);
                });
                hands.push(new Hand(cards))
            };
            this.game = new Game(hands, type, turn_id, player_id, trump_id);
            resolve();
            this.solve();
        })
    };

    async dispatch() {
        await fadeClearInsideElement(this.master_middle)
        this.dispatcher.dispatch()
    }

    solve() {
        const worker = new Worker(
            new URL('../backend/solver.js', import.meta.url),
            { type: 'module' });
        worker.postMessage({ type: 'solve', game_str: this.game.to_string() });
        worker.onmessage = (event) => {
            if (event.data.type === 'progress') {
                let size_str = `${event.data.size}`
                size_str = size_str + ' '.repeat(7-size_str.length);
                this.messageContainer.innerHTML = `STATES SOLVED <div class="counter">${size_str}</div>`;
            };
            if (event.data.type === 'solution') {
                if (!event.data.dp) {
                    worker.postMessage({ type: 'transport' });
                }
                else {
                    this.dp = event.data.dp
                    this.startButton.classList.remove('blocked')
                    this.startButton.setLock(0)
                    this.startButton.clickLogic = () => {
                        return new Promise((resolve) => {
                            if (this.dp) {
                                resolve()
                                this.dispatch();
                            }
                            else {
                                throw ErrorEvent()
                            }
                        })
                    };
                };
            };
        };
    };
};