import * as globals from '../globals.js'
import { fadeCleaInsideElement } from './utils.js';


export class Phase_2 {
    constructor(dispatcher) {
        this.dispatcher = dispatcher;
        this.master_middle = document.getElementById(globals.MASTER_MIDDLE);
        this.parameters = {
            "contract type": NaN,
            "playing hand": NaN,
            "first hand": NaN,
            "trump suit": NaN};
    };

    init() {
        const phase_middle = document.createElement("div");
        phase_middle.className = "middle-phase-2";
        phase_middle.id = "middle-phase-2";
        this.master_middle.appendChild(phase_middle);
        this._selectParameters();
    };

    async dispatch() {
        await fadeCleaInsideElement(this.master_middle)
        this.dispatcher.dispatch()
    };

    _toggle_OK() {
        const buttonOK = document.getElementById('button-OK')
        if (Object.values(this.parameters).every(val => val)) {
            buttonOK.style.visibility = 'visible';
        }
        else {
            buttonOK.style.visibility = 'hidden';
        };
    };

    _selectParameters() {
        let parameter_vals = {
            "contract type": globals.GAME_NAMES,
            "playing hand": globals.PLAYER_NAMES,
            "first hand": globals.PLAYER_NAMES,
            "trump suit": globals.SUIT_NAMES.concat(["NONE"])}
        const phase_middle = document.getElementById("middle-phase-2");
        Object.keys(parameter_vals).forEach(key => {
            let buttons = []
            let span = Math.floor(6 / parameter_vals[key].length);
            phase_middle.appendChild(this._createParameterText(key.toUpperCase()));
            parameter_vals[key].forEach(val => {
                const parameter_button = document.createElement('button')
                parameter_button.className = 'parameter-button';
                parameter_button.id = `${key}:${val}`
                if (key == "trump suit") {
                    if (val == "NONE") {
                        parameter_button.innerHTML = val;
                        parameter_button.style.gridColumn = 'span 2';
                    }
                    else {
                        this._createSuitImage(parameter_button, val[0])
                    };
                }
                else {
                    parameter_button.innerHTML = val;
                    parameter_button.style.gridColumn = `span ${span}`;
                };
                buttons.push(parameter_button);
                phase_middle.appendChild(parameter_button);
            });
            this._imitateRadioButtons(buttons);
        });
    
        phase_middle.appendChild(this._createParameterText('&nbsp'));
        const buttonOK = document.createElement('button');
        buttonOK.classList.add('parameter-button');
        buttonOK.id = 'button-OK';
        buttonOK.style.visibility = 'hidden';
        buttonOK.innerHTML = 'OK';
        buttonOK.onclick = () => {
            buttonOK.classList.add('button-selected')
            setTimeout(() => {
                buttonOK.classList.add('button-deeactivated')
                buttonOK.classList.remove('button-selected') 
            }, 100)
            this.dispatch()
        };
        buttonOK.style.gridColumn = '3 / span 2';
        phase_middle.appendChild(buttonOK);
    };

    _block_suit_buttons() {
        globals.SUIT_NAMES.forEach(suit => {
            let buttonSuit = document.getElementById('trump suit:' + suit);
            let images = JSON.parse(buttonSuit.getAttribute('images'));
            buttonSuit.firstChild.src = images.normal;
            if (buttonSuit.classList.contains('button-selected')) {
                buttonSuit.classList.remove('button-selected')
            }
            buttonSuit.classList.add('button-blocked')
        });
        let buttonNONE = document.getElementById('trump suit:NONE');
        buttonNONE.classList.add('button-selected')
        buttonNONE.style.cursor = 'default';
    };
    
    _unblock_suit_buttons() {
        let buttonNONE = document.getElementById('trump suit:NONE');
        if (buttonNONE.classList.contains('button-selected')) {
            buttonNONE.classList.remove('button-selected')
        }
        buttonNONE.style.cursor = 'pointer';
        globals.SUIT_NAMES.forEach(suit => {
            let buttonSuit = document.getElementById('trump suit:' + suit);
            if (buttonSuit.classList.contains('button-blocked')) {
                buttonSuit.classList.remove('button-blocked')
            }
        });
    };

    _createParameterText(text) {
        const parameterTextElement = document.createElement('div');
        parameterTextElement.classList.add('parameter-text');
        parameterTextElement.innerHTML = text;
        parameterTextElement.style.gridColumn = '1 / -1'
        return parameterTextElement
    };

    _createSuitImage(buttonElement, tag) {
        const suitImage = document.createElement('img')
        const images = {
            "normal": 'imgs/card_utils/' + tag + 'b.png',
            "active": 'imgs/card_utils/' + tag + 'w.png'}
        buttonElement.setAttribute('images', JSON.stringify(images));
        suitImage.src = images["normal"]
        suitImage.classList.add('suit-img')
        buttonElement.appendChild(suitImage)
    };
    
    _imitateRadioButtons(buttonElements) {
        buttonElements.forEach(thisButtonElement => {
            thisButtonElement.onclick = () => {
                let [key, val] = thisButtonElement.id.split(':');
                this.parameters[key] = val;
                if (key == "trump suit" && this.parameters["contract type"] != "MISERE") {
                    buttonElements.forEach(thatButtonElement => {
                        if (thatButtonElement.id != 'trump suit:NONE') {
                            let imgElement = thatButtonElement.firstChild;
                            let images = JSON.parse(thatButtonElement.getAttribute('images'));
                            imgElement.src = images.normal;
                            if (thatButtonElement.classList.contains('button-selected')) {
                                thatButtonElement.classList.remove('button-selected')
                            };
                        };
                        if (thatButtonElement.onclick != 'none') {
                            if (thatButtonElement.classList.contains('button-selected')) {
                                thatButtonElement.classList.remove('button-selected')
                            };
                        };
                    });
                    if (thisButtonElement.id != 'trump suit:NONE') {
                        let imgElement = thisButtonElement.firstChild
                        let images = JSON.parse(thisButtonElement.getAttribute('images'));
                        imgElement.src = images.active;
                        thisButtonElement.classList.add('button-selected')
                    };
                    thisButtonElement.classList.add('button-selected')
                }
                else {
                    buttonElements.forEach(thatButtonElement => {
                        if (thatButtonElement.classList.contains('button-selected')) {
                            thatButtonElement.classList.remove('button-selected')
                        };
                    });
                    thisButtonElement.classList.add('button-selected')
                };
                if (this.parameters["contract type"] == "MISERE") {
                    this._block_suit_buttons();
                    this.parameters["trump suit"] = "NONE";
                }
                else {
                    let buttonNONE = document.getElementById('trump suit:NONE');
                    if (buttonNONE.style.cursor == 'default') {
                        this._unblock_suit_buttons();
                        this.parameters["trump suit"] = NaN;
                    };
                };
            this._toggle_OK();
            };
        });
    };
};