import * as globals from '../globals.js'
import { assert, settle_trick, mod } from '../backend/utils.js'
import { IMAGES } from './frontend.js'
import { calculateSteps,
    highlightElement,
    deHighlightElement, 
    fadeClearInsideElement,
    createButton} from './utils.js';


export class Phase_4  {
    constructor(dispatcher) {
        this.dispatcher = dispatcher;
        this.master_middle = document.getElementById(globals.MASTER_MIDDLE);
        this.dispatched = false
    };

    init() {
        return new Promise(async (resolve) => {
            this.dp = this.dispatcher.phases[2].dp;
            this.games = [{"game": this.dispatcher.phases[2].game, "tricks": [0,0,0]}];
            this.game_idx = 0;
            this.phase_middle = document.createElement("div");
            this.phase_middle.className = "middle-phase-4";
            this.phase_middle.id = "middle-phase-4";
            this.master_middle.appendChild(this.phase_middle);
            this.createInfoToolTip();
            this.tricks = [];
            for (let i=0; i<3; i++) {
                const trick_i = document.createElement("div");
                trick_i.className = "trick-card-container";
                trick_i.id = `trick-card-container-${i}`;
                this.tricks.push(trick_i);
            };
            const trick_strip_U = document.createElement("div");
            trick_strip_U.className = "trick-strip";
            trick_strip_U.appendChild(this.tricks[1]);
            trick_strip_U.appendChild(this.tricks[2]);
            this.phase_middle.appendChild(trick_strip_U);
            const trick_strip_D = document.createElement("div");
            trick_strip_D.className = "trick-strip";
            trick_strip_D.appendChild(this.tricks[0]);
            this.phase_middle.appendChild(trick_strip_D);
            for (let i=0; i<3; i++) {
                const hand = this.games[this.game_idx]["game"].hands[i];
                for (let j=0; j<hand.cards.length; j++) {
                    hand.cards[j].hand_idx = i;
                    hand.cards[j].card_idx = j;
                }
            }
            const buttonStrip = document.createElement("div");
            buttonStrip.className = 'button-strip';
            buttonStrip.style.gridTemplateColumns = 'repeat(3, 1fr)'
            buttonStrip.style.marginTop = 'auto'
            this.phase_middle.appendChild(buttonStrip);
            this.undoButton = createButton()
            this.undoButton.innerHTML = 'UNDO';
            this.undoButton.clickLogic = () => {
                assert(this.game_idx > 0);
                this.game_idx -= 1;
                const promises = []
                promises.push(this.undoTransitionLogic())
                promises.push(this.placeTransitionLogic())
                promises.push(this.drawGame())
                return Promise.all(promises)
            }
            this.undoButton.setBlock(true)
            buttonStrip.appendChild(this.undoButton);
            this.okButton = createButton()
            this.okButton.innerHTML = 'OK';
            this.okButton.clickLogic = async () => {
                const game = this.games[this.game_idx]["game"]
                assert(game.hands[globals.TRICK].cards.length == 3)
                await this.flush()
                const promises = []
                promises.push(this.flushTransitionLogic())
                promises.push(this.drawGame())
                return Promise.all(promises)
            }
            this.okButton.setBlock(true)
            buttonStrip.appendChild(this.okButton)
            this.redoButton = createButton()
            this.redoButton.clickLogic = () => {
                assert(this.game_idx < this.games.length-1);
                const promises = []
                const game = this.games[this.game_idx]["game"]
                this.game_idx += 1;
                if (game.hands[globals.TRICK].cards.length == 3) {
                    promises.push(this.flushTransitionLogic())
                }
                promises.push(this.placeTransitionLogic())
                promises.push(this.drawGame())
                return Promise.all(promises)
            }
            this.redoButton.setBlock(true)
            this.redoButton.innerText = 'REDO';
            buttonStrip.appendChild(this.redoButton);
            for (const player_name of globals.PLAYER_NAMES) {
                const infoName = document.getElementById(`info-${player_name}`);
                infoName.style.visibility = 'visible'
            }
            this.optimal = this.dp[this.games[this.game_idx]["game"].to_string()]
            this.optimal = this.permutePlayers(this.optimal)
            document.getElementById('info-EAST').style.display = 'block'
            document.getElementById('info-WEST').style.display = 'block'
            const southInfo = document.getElementById('info-SOUTH')
            southInfo.style.display = 'flex'
            const infoHeight = southInfo.offsetHeight;
            southInfo.parentElement.style.marginTop = `-${infoHeight}px`
            this.phase_middle.style.paddingBottom = `${infoHeight}px`
            await this.drawGame()
            resolve()
        })
    };

    undoTransitionLogic() {
        const promises = []
        const game = this.games[this.game_idx]["game"]
        for (let i=0; i<3; i++) {
            const handElement = document.getElementById(`hand-${i}`)
            for (const card of game.hands[i].cards) {
                let card_id = 8*parseInt(card.id.split("")[0])
                card_id += parseInt(card.id.split("")[1])
                const cardElement = document.getElementById(`${card_id}`);
                if (cardElement.parentElement.id != handElement.id) {
                    promises.push(this.undoTransition(cardElement, handElement))
                };
            };
        };
        return Promise.all(promises)
    }

    placeTransitionLogic() {
        const promises = []
        const game = this.games[this.game_idx]["game"]
        for (let j=0; j<game.hands[3].cards.length; j++) {
            const card = game.hands[globals.TRICK].cards[j];
            let card_id = 8*parseInt(card.id.split("")[0])
            card_id += parseInt(card.id.split("")[1])
            const cardElement = document.getElementById(`${card_id}`);
            if (cardElement.parentElement.id != this.tricks[card.hand_idx].id) {
                promises.push(this.placeTransition(cardElement, this.tricks[card.hand_idx]))
            };
        };
        return Promise.all(promises)
    }

    flushTransitionLogic() {
        const promises = []
        const game = this.games[this.game_idx]["game"]
        const trick_cardElements = []
        if (game.hands[globals.TRICK].cards.length == 0) {
            for (const trick of this.tricks) {
                if (trick.firstChild) {
                    trick_cardElements.push(trick.firstChild)
                };
            };
        };
        assert(trick_cardElements.length == 3);
        const trick_cards = []
        for (const cardElement of trick_cardElements) {
            const card = globals.CARDS[parseInt(cardElement.id)]
            trick_cards.push(card);
        };
        let vir_game_idx = this.game_idx
        while (this.games[vir_game_idx]["game"].hands[globals.TRICK].cards.length != 3) {
            vir_game_idx -= 1;
        }
        let last_turn = this.games[vir_game_idx]["game"].params["turn"];
        let winner = mod(settle_trick([
            trick_cards[mod(last_turn-2, 3)],
            trick_cards[mod(last_turn-1, 3)],
            trick_cards[mod(last_turn-0, 3)]
        ], game.params["trumps"])+last_turn-2, 3)
        promises.push(this.flushTransition(trick_cardElements, winner))
        return Promise.all(promises)
    }

    async dispatch() {
        if (!this.dispatched) {
            this.dispatched = true
            for (let i=0; i<3; i++) {
                const handElement = document.getElementById(`hand-${i}`)
                deHighlightElement(handElement)
            }
            await fadeClearInsideElement(this.master_middle)
            for (const player_name of globals.PLAYER_NAMES) {
                const info_name = document.getElementById(`info-${player_name}`);
                info_name.style.visibility = 'hidden'
            };
            this.dispatcher.dispatch();
        }
    };

    permutePlayers(scores) {
        const game = this.games[this.game_idx]["game"]
        return [
            scores[game.player_map[globals.SOUTH]],
            scores[game.player_map[globals.WEST]],
            scores[game.player_map[globals.EAST]],
        ];
    };

    updateMessages() {
        const game = this.games[this.game_idx]["game"]
        let projects = NaN
        if (game.hands[globals.TRICK].cards.length == 3) {
            const flushed_game = game.deepcopy();
            const new_res = flushed_game.flush()
            projects = this.permutePlayers(this.dp[flushed_game.to_string()])
            projects = projects.map((num, idx) => num + new_res[idx]);
        }
        else {
            projects = this.permutePlayers(this.dp[game.to_string()])
        };
        const currents = this.games[this.game_idx]["tricks"]
        const player_name = globals.PLAYER_NAMES[game.params["player"]]
        const info_proj = document.getElementById(`num-tricks-proj-${player_name}`)
        let to_blink = false;
        let player_proj = NaN
        if (currents[game.params["player"]]+projects[game.params["player"]] == 10) {
            player_proj = 'X';
        }
        else {
            player_proj = `${currents[game.params["player"]]+projects[game.params["player"]]}`;
        }
        if (`${player_proj}` != info_proj.innerText) {
            to_blink = true;
        }
        for (let i=0; i<3; i++) {
            const player_name = globals.PLAYER_NAMES[i]
            const info_curr = document.getElementById(`num-tricks-curr-${player_name}`)
            const info_proj = document.getElementById(`num-tricks-proj-${player_name}`)
            let proj = NaN
            if (currents[i]+projects[i] == 10) {
                proj = 'X';
            }
            else {
                proj = `${currents[i]+projects[i]}`;
            }
            info_curr.innerText = `${currents[i]}`;
            info_proj.innerText = proj;
            if (to_blink) {
                info_proj.classList.add('blink');
                setTimeout(() => {
                    info_proj.classList.remove('blink');
                }, 50)
            };
        };
    };

    /*onMouseUpLogic(cardElement, targetElement) {
        if (targetElement.id.includes('trick-card-container')) {
            return this.playCard(cardElement);
        }
        else {
            this.undoTransition(cardElement, targetElement)
        }
    }*/

    createInfoToolTip() {
        const infoToolTip = document.createElement('div')
        infoToolTip.className = 'tooltip-container'
        infoToolTip.innerHTML = "<i class='bx bx-info-circle'></i>"
        const toolTipText = document.createElement('div')
        toolTipText.className = 'tooltip-text'
        const type = this.games[this.game_idx]["game"].params["type"];
        const player = this.games[this.game_idx]["game"].params["player"];
        const trumps = this.games[this.game_idx]["game"].params["trumps"];
        const suit_names = globals.SUIT_NAMES
        const textParameters = [
            "PARAMETERS",
            globals.GAME_NAMES[type],
            globals.PLAYER_NAMES[player]]
        const fontColors = ["white", "black", "black"]
        const backColors = ["black", "white", "white"]
        for (let i=0; i<3; i++) {
            const textLine = document.createElement('div')
            textLine.className = 'text-line';
            textLine.style.backgroundColor = backColors[i];
            textLine.style.color = fontColors[i]
            textLine.innerText = textParameters[i]
            toolTipText.appendChild(textLine)
        };
        const textLine = document.createElement('div')
        textLine.className = 'text-line';
        textLine.style.backgroundColor = "white";
        if (trumps != globals.NO_TRUMP_ID) {
            textLine.appendChild(IMAGES["suits"]["normal"][globals.SUIT_NAMES[trumps]]);
        }
        else {
            textLine.innerText = "NO TRUMPS";
            textLine.style.color = "black";
        };
        textLine.style.marginBottom = `${globals.BORDER_WIDTH}px`;
        toolTipText.appendChild(textLine);
        infoToolTip.appendChild(toolTipText);
        this.phase_middle.appendChild(infoToolTip);
    };

    pushGame(new_game_item) {
        return new Promise ((resolve) => {
            this.games.splice(this.game_idx+1)
            this.games.push(new_game_item)
            this.game_idx += 1;
            resolve();
        })
    };

    flush() {
        const new_game = this.games[this.game_idx]["game"].deepcopy()
        const new_res = new_game.flush()
        const now_res = this.games[this.game_idx]["tricks"]
        const tot_res = now_res.map((num, idx) => num + new_res[idx]);
        return this.pushGame({"game": new_game, "tricks": tot_res});
    }

    playCard(cardElement) {
        const card = globals.CARDS[parseInt(cardElement.id)];
        const new_game = this.games[this.game_idx]["game"].deepcopy()
        const now_res = this.games[this.game_idx]["tricks"]
        const new_res = new_game.play_card(card);
        const tot_res = now_res.map((num, idx) => num + new_res[idx]);
        return this.pushGame({"game": new_game, "tricks": tot_res});
    };

    optimalMove(card_id) {
        const virtual_game = this.games[this.game_idx]["game"].deepcopy();
        virtual_game.hands[globals.TRICK].auto_flush = true;
        const new_res = virtual_game.play_card(globals.CARDS[card_id]);
        const opt_res = this.permutePlayers(this.dp[this.games[this.game_idx]["game"].to_string()])
        const vir_res = this.permutePlayers(this.dp[virtual_game.to_string()])
        const player_id = this.games[this.game_idx]["game"].params["player"]
        return (new_res[player_id] + vir_res[player_id] == opt_res[player_id])
    };

   flushTransition(cardElements, winner) {
        const promises = []
        const winner_name = globals.PLAYER_NAMES[winner]
        const flushElement = document.getElementById(`flush-${winner_name}`);
        for (const cardElement of cardElements) {
            const flushRect = flushElement.getBoundingClientRect();
            const cardRect = cardElement.getBoundingClientRect();
            const deltaX = flushRect.left - cardRect.left + globals.BORDER_WIDTH;
            const deltaY = flushRect.top - cardRect.top + globals.BORDER_WIDTH;
            cardElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`
            cardElement.style.opacity = 0;
            promises.push(new Promise((resolve) => { setTimeout(() => {
                cardElement.style.transform = '';
                cardElement.parentNode.removeChild(cardElement);
                flushElement.appendChild(cardElement);
                cardElement.style.top = '';
                cardElement.style.left = '';
                cardElement.setLock(true)
                cardElement.style.display = 'none'
                /*cardElement.clickLogic = Promise.resolve();*/
                resolve()
            }, 1000*globals.TRANSITION_TIME)}));
        };
        return Promise.all(promises)
    };

    placeTransition(cardElement, targetElement) {
        cardElement.style.display = 'block'
        const trickRect = targetElement.getBoundingClientRect();
        const cardRect = cardElement.getBoundingClientRect();
        const deltaX = trickRect.left - cardRect.left + globals.BORDER_WIDTH;
        const deltaY = trickRect.top - cardRect.top + globals.BORDER_WIDTH;
        cardElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`
        if (cardElement.style.opacity == 0) {
            cardElement.style.opacity = 1;
        }
        return new Promise((resolve) => { setTimeout(() => {
            cardElement.style.transform = '';
            cardElement.parentNode.removeChild(cardElement);
            targetElement.appendChild(cardElement);
            cardElement.style.top = '';
            cardElement.style.left = '';
            cardElement.setLock(true)
            /*cardElement.clickLogic = Promise.resolve();*/
            resolve()
        }, 1000*globals.TRANSITION_TIME)});
    };

    returnTransition(cardElement, handElement) {
        return new Promise((resolve) => {
            const card = globals.CARDS[parseInt(cardElement.id)]
            const handRect = handElement.getBoundingClientRect();
            const cardRect = cardElement.getBoundingClientRect();
            const deltaX = handRect.left - cardRect.left + globals.BORDER_WIDTH;
            const deltaY = handRect.top - cardRect.top + globals.BORDER_WIDTH;
            let [vstep, hstep, _] = calculateSteps();
            let X = 0;
            let Y = 0;
            if (handElement.classList.contains("hand-horz")) {
                X += hstep*card.card_idx
            }
            if (handElement.classList.contains("hand-vert")) {
                Y += vstep*card.card_idx
            }
            cardElement.style.transform = `translate(${X + deltaX}px, ${Y + deltaY}px)`
            setTimeout(() => {
                cardElement.style.transform = '';
                cardElement.parentNode.removeChild(cardElement);
                handElement.appendChild(cardElement);
                cardElement.style.top = `${Y}px`;
                cardElement.style.left = `${X}px`;
                cardElement.setLock(false)
                resolve()
            }, 1000*globals.TRANSITION_TIME)
        })
    }

    async cardClickLogic(cardElement, targetElement) {
        const promises = []
        if (!targetElement) {
            const card = globals.CARDS[parseInt(cardElement.id)]
            targetElement = this.tricks[card.hand_idx]
        }
        if (targetElement.classList.contains('trick-card-container')) {
            await this.playCard(cardElement)
            promises.push(this.placeTransition(cardElement, targetElement))
            promises.push(this.drawGame())
        }
        else {
            promises.push(this.returnTransition(cardElement, targetElement))
        }
        return Promise.all(promises)
    }

    undoTransition(cardElement, handElement) {
        cardElement.clickLogic = async (targetElement=NaN) => {
            return this.cardClickLogic(cardElement, targetElement)
        }
        return this.returnTransition(cardElement, handElement)
    }

    /*
    undoTransition(cardElement, handElement) {
        return new Promise((resolve) => { 
            X, Y = this.sendCardElement(cardElement, handElement)
            setTimeout(() => {
                cardElement.style.transform = '';
                cardElement.parentNode.removeChild(cardElement);
                handElement.appendChild(cardElement);
                cardElement.style.top = `${Y}px`;
                cardElement.style.left = `${X}px`;
                cardElement.setLock(false)
                cardElement.clickLogic = async (targetElement=NaN) => {
                    const promises = []
                    if (!targetElement) {
                        const card = globals.CARDS[parseInt(cardElement.id)]
                        targetElement = this.tricks[card.hand_idx]
                    }
                    else {
                        let isHand = false
                        isHand = isHand || targetElement.classList.contains('hand-horz')
                        isHand = isHand || targetElement.classList.contains('hand-vert')
                        if (isHand) {

                        }
                    }
                    await this.playCard(cardElement)
                    promises.push(this.placeTransition(cardElement, targetElement))
                    return Promise.all(promises)
                }
                resolve()
            }, 1000*globals.TRANSITION_TIME)
        })
    }

    transitionCards() {
        return new Promise(async (resolve) => {
            const game = this.games[this.game_idx]["game"]
            for (let i=0; i<3; i++) {
                const handElement = document.getElementById(`hand-${i}`)
                for (const card of game.hands[i].cards) {
                    let card_id = 8*parseInt(card.id.split("")[0])
                    card_id += parseInt(card.id.split("")[1])
                    const cardElement = document.getElementById(`${card_id}`);
                    if (cardElement.parentElement.id != handElement.id) {
                        await this.undoTransition(cardElement, handElement);
                    };
                };
            };
            const cardElements = []
            const targetElements = []
            for (let j=0; j<game.hands[3].cards.length; j++) {
                const card = game.hands[globals.TRICK].cards[j];
                let card_id = 8*parseInt(card.id.split("")[0])
                card_id += parseInt(card.id.split("")[1])
                const cardElement = document.getElementById(`${card_id}`);
                if (cardElement.parentElement.id != this.tricks[card.hand_idx].id) {
                    toPlace.push({"card": cardElement, "idx": card.hand_idx});
                };
            };
            if (toPlace.length > 0) {
                await this.placeTransition(toPlace);
            };
            const trick_cardElements = []
            if (game.hands[3].cards.length == 0) {
                for (const trick of this.tricks) {
                    if (trick.firstChild) {
                        trick_cardElements.push(trick.firstChild)
                    };
                };
            };
            if (trick_cardElements.length > 0) {
                assert(trick_cardElements.length == 3);
                const trick_cards = []
                for (const cardElement of trick_cardElements) {
                    const card = globals.CARDS[parseInt(cardElement.id)]
                    trick_cards.push(card);
                };
                let vir_game_idx = this.game_idx
                while (this.games[vir_game_idx]["game"].hands[globals.TRICK].cards.length != 3) {
                    vir_game_idx -= 1;
                }
                let last_turn = this.games[vir_game_idx]["game"].params["turn"];
                let winner = mod(settle_trick([
                    trick_cards[mod(last_turn-2, 3)],
                    trick_cards[mod(last_turn-1, 3)],
                    trick_cards[mod(last_turn-0, 3)]
                ], game.params["trumps"])+last_turn-2, 3)
                await this.flushTransition(trick_cardElements, winner)
            }
            resolve()
        })
    };
    */

    disableAllCards() {
        const game = this.games[this.game_idx]["game"]
        for (let i=0; i<3; i++) {
            for (const card of game.hands[i].cards) {
                const card_id = 8*parseInt(card.suit) + parseInt(card.kind)
                const cardElement = document.getElementById(card_id);
                cardElement.removeChild(cardElement.firstChild);
                cardElement.appendChild(IMAGES["normal"][card_id])
                cardElement.setLock(true)
            };
        };
    };

    drawGame() {
        return new Promise((resolve) => {
            const game = this.games[this.game_idx]["game"]
            this.okButton.setBlock(true)
            let toDeHighlight = false;
            if (game.hands[globals.TRICK].cards.length == 3) {
                this.okButton.setBlock(false)
                this.disableAllCards()
                toDeHighlight = true;
            }
            else {
                const turn_id = game.params["turn"];
                for (let i=0; i<3; i++) {
                    const handElement = document.getElementById(`hand-${i}`)
                    const trickElement = document.getElementById(`trick-card-container-${i}`)
                    if (turn_id == i && !toDeHighlight) {
                        highlightElement(handElement)
                    }
                    else {
                        deHighlightElement(handElement)
                    };
                    deHighlightElement(trickElement)
                    const options = game.hands[i].options(game.hands[globals.TRICK], game.params["trumps"]);
                    for (const card of game.hands[i].cards) {
                        const card_id = 8*parseInt(card.suit) + parseInt(card.kind)
                        const cardElement = document.getElementById(card_id);
                        if (options.includes(card) && i == turn_id) {
                            if (this.optimalMove(card_id, turn_id)) {
                                cardElement.removeChild(cardElement.firstChild);
                                cardElement.appendChild(IMAGES["optimal"][card_id])
                            }
                            else {
                                cardElement.removeChild(cardElement.firstChild);
                                cardElement.appendChild(IMAGES["normal"][card_id])
                            }
                            cardElement.setLock(false)
                            cardElement.clickLogic = async (targetElement=NaN) => {
                                return this.cardClickLogic(cardElement, targetElement)
                            }
                        }
                        else {
                            cardElement.removeChild(cardElement.firstChild);
                            cardElement.appendChild(IMAGES["normal"][card_id])
                            cardElement.setLock(true)
                            /*cardElement.clickLogic = () => {
                                return Promise.resolve()
                            }*/
                        }
                    }
                }
            }
            for (const card of game.hands[3].cards) {
                const card_id = 8*parseInt(card.suit) + parseInt(card.kind)
                const cardElement = document.getElementById(card_id);
                cardElement.removeChild(cardElement.firstChild);
                cardElement.appendChild(IMAGES["normal"][card_id])
            };
            this.updateMessages();
            if (this.game_idx > 0) {
                this.undoButton.setBlock(false)
            }
            else {
                this.undoButton.setBlock(true)
            };
            if (this.game_idx < this.games.length-1) {
                this.redoButton.setBlock(false)
            }
            else {
                this.redoButton.setBlock(true)
            };
            let is_finished = true;
            for (const hand of game.hands) {
                if (hand.cards.length > 0) {
                    is_finished = false
                };
            };
            if (is_finished) {
                this.result = {
                    "optimal": this.optimal,
                    "final": this.games[this.game_idx]["tricks"]}
                this.dispatch()
            }
            resolve();
        })
    };
};