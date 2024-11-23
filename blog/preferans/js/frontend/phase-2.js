import * as globals from '../globals.js'
import { IMAGES } from './frontend.js';
import { createButton, fadeClearInsideElement } from './utils.js';


export class Phase_2 {
    constructor(dispatcher) {
        this.dispatcher = dispatcher;
        this.master_middle = document.getElementById(globals.MASTER_MIDDLE);
        this.parameters = {
            "contract type": NaN,
            "playing hand": NaN,
            "first hand": NaN,
            "trump suit": NaN};
        this.dispatched = false
    };

    init() {
        const phase_middle = document.createElement("div");
        phase_middle.className = "middle-phase-2";
        phase_middle.id = "middle-phase-2";
        this.master_middle.appendChild(phase_middle);
        for (let i=0; i<3; i++) {
            for (const cardElement of this.dispatcher.hands[i].childNodes) {
                cardElement.incLock()
            }
        }
        return this.setupSelection();
    };

    async dispatch() {
        if (!this.dispatched) {
            this.dispatched = true
            await fadeClearInsideElement(this.master_middle)
            this.dispatcher.dispatch()
        }
    };

    setupSelection() {
        return new Promise((resolve) => {
            let parameter_vals = {
                "contract type": globals.GAME_NAMES,
                "playing hand": globals.PLAYER_NAMES,
                "first hand": globals.PLAYER_NAMES,
                "trump suit": globals.SUIT_NAMES.concat(["NA"])}
            const phase_middle = document.getElementById("middle-phase-2");
            Object.keys(parameter_vals).forEach(key => {
                let buttons = []
                const buttonStrip = document.createElement('div')
                const L = parameter_vals[key].length;
                buttonStrip.classList.add('button-strip')
                buttonStrip.style.gridTemplateColumns = `repeat(${L}, 1fr)`
                buttonStrip.style.width = '100%'
                const parameterText = this._createParameterText(key.toUpperCase())
                phase_middle.appendChild(parameterText);
                phase_middle.appendChild(buttonStrip);
                for (let i=0; i<parameter_vals[key].length; i++) {
                    const parameter_button = createButton()
                    const val = parameter_vals[key][i];
                    parameter_button.id = `${key}:${val}`
                    if (key == "trump suit") {
                        if (val == "NA") {
                            parameter_button.innerHTML = val;
                        }
                        else {
                            parameter_button.appendChild(IMAGES["suits"]["normal"][val])
                        };
                    }
                    else {
                        parameter_button.innerHTML = val;
                    };
                    buttons.push(parameter_button);
                    buttonStrip.appendChild(parameter_button)
                };
                this.imitateRadioButtons(buttons);
            });
            phase_middle.appendChild(this._createParameterText('&nbsp'));
            const buttonSolve = createButton()
            const buttonStrip = document.createElement('div')
            buttonStrip.classList.add('button-strip')
            buttonStrip.appendChild(buttonSolve)
            phase_middle.appendChild(buttonStrip);
            buttonSolve.id = 'button-solve';
            buttonSolve.innerHTML = 'SOLVE';
            buttonSolve.setBlock(true)
            buttonSolve.clickLogic = () => {
                this.dispatch()
            };
            resolve()
        })
    };

    checkAllParameters() {
        const buttonSolve = document.getElementById('button-solve')
        if (Object.values(this.parameters).every(val => val)) {
            buttonSolve.setBlock(false)
        }
        else {
            buttonSolve.setBlock(true)
        };
    }

    imitateRadioButtons(buttonElements) {
        for (const thisButtonElement of buttonElements) {
            thisButtonElement.clickLogic = () => {
                return new Promise((resolve) => {
                    let [key, val] = thisButtonElement.id.split(':');
                    if (key == 'trump suit') {
                        for (const thatButtonElement of buttonElements) {
                            const suit = thatButtonElement.id.split(':')[1]
                            if (thatButtonElement.id != 'trump suit:NA') {
                                thatButtonElement.removeChild(thatButtonElement.firstChild)
                                thatButtonElement.appendChild(IMAGES["suits"]["normal"][suit])
                            }
                            thatButtonElement.classList.remove('selected')
                            thatButtonElement.setLock(false)
                        }
                        const suit = thisButtonElement.id.split(':')[1]
                        if (thisButtonElement.id != 'trump suit:NA') {
                            thisButtonElement.removeChild(thisButtonElement.firstChild)
                            thisButtonElement.appendChild(IMAGES["suits"]["selected"][suit])
                        }
                        thisButtonElement.classList.add('selected')
                        thisButtonElement.setLock(true)
                    }
                    else {
                        if (key == 'contract type' && val == 'MISERE') {
                            this.block_suit_buttons()
                            this.parameters['trump suit'] = "NA";
                        }
                        if (key == 'contract type' && val == 'PLAY') {
                            if (this.parameters[key] == 'MISERE') {
                                this.unblock_suit_buttons()
                                this.parameters['trump suit'] = NaN
                            }
                        }
                        for (const thatButtonElement of buttonElements) {
                            thatButtonElement.classList.remove('selected')
                            thatButtonElement.setLock(false)
                        }
                        thisButtonElement.classList.add('selected')
                        thisButtonElement.setLock(true)
                    }
                    this.parameters[key] = val;
                    this.checkAllParameters();
                    resolve()
                })
            }
        }
    }


    block_suit_buttons() {
        globals.SUIT_NAMES.forEach(suit => {
            let buttonSuit = document.getElementById('trump suit:' + suit);
            buttonSuit.removeChild(buttonSuit.firstChild)
            buttonSuit.appendChild(IMAGES["suits"]["normal"][suit])
            buttonSuit.classList.remove('selected')
            buttonSuit.setBlock(true)
        });
        let buttonNA = document.getElementById('trump suit:NA');
        buttonNA.classList.add('selected')
        buttonNA.setLock(true) 
    };
    
    unblock_suit_buttons() {
        let buttonNA = document.getElementById('trump suit:NA');
        buttonNA.classList.remove('selected')
        buttonNA.setLock(false)
        globals.SUIT_NAMES.forEach(suit => {
            let buttonSuit = document.getElementById('trump suit:'+suit);
            buttonSuit.setBlock(false)
        });
    };

    _createParameterText(text) {
        const parameterTextElement = document.createElement('div');
        parameterTextElement.classList.add('parameter-text');
        parameterTextElement.innerHTML = text;
        parameterTextElement.style.gridColumn = '1 / -1'
        return parameterTextElement
    };
    
    _imitateRadioButtons(buttonElements) {
        buttonElements.forEach(thisButtonElement => {
            thisButtonElement.clickLogic = async () => {
                return new Promise((resolve) => {
                    let [key, val] = thisButtonElement.id.split(':');
                    this.parameters[key] = val;
                    if (key == "trump suit" && this.parameters["contract type"] != "MISERE") {
                        buttonElements.forEach(thatButtonElement => {
                            const suit = thatButtonElement.id.split(':')[1]
                            if (thatButtonElement.id != 'trump suit:NA') {
                                thatButtonElement.removeChild(thatButtonElement.firstChild)
                                thatButtonElement.appendChild(IMAGES["suits"]["normal"][suit])
                            }
                            if (thatButtonElement.classList.contains('selected')) {
                                thatButtonElement.classList.remove('selected')
                            }
                        });
                        if (thisButtonElement.id != 'trump suit:NA') {
                            const suit = thisButtonElement.id.split(':')[1]
                            thisButtonElement.removeChild(thisButtonElement.firstChild)
                            thisButtonElement.appendChild(IMAGES["suits"]["selected"][suit])
                            thisButtonElement.classList.add('selected')
                        };
                        thisButtonElement.classList.add('selected')
                    }
                    else {
                        buttonElements.forEach(thatButtonElement => {
                            if (thatButtonElement.classList.contains('selected')) {
                                thatButtonElement.classList.remove('selected')
                            };
                        });
                        thisButtonElement.classList.add('selected')
                    };
                    if (this.parameters["contract type"] == "MISERE") {
                        this.block_suit_buttons();
                        this.parameters["trump suit"] = "NA";
                    }
                    else {
                        let buttonNA = document.getElementById('trump suit:NA');
                        if (buttonNA.classList.contains('selected')) {
                            this.unblock_suit_buttons();
                            this.parameters["trump suit"] = NaN;
                        };
                    };
                    this._toggle_OK();
                    resolve();
                })
            }
        });
    };
};