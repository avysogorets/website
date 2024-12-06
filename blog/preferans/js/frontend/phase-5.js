import * as globals from '../globals.js'
import { createButton } from './utils.js';


export class Phase_5  {
    constructor(dispatcher) {
        this.dispatcher = dispatcher;
        this.master_middle = document.getElementById(globals.MASTER_MIDDLE);
        this.dispatched = false
    };

    init() {
        const playerOrder = [1, 0, 2]
        const localPlayerNames = []
        for (const playerId of playerOrder) {
            localPlayerNames.push(globals.PLAYER_NAMES[playerId])
        }
        this.result = this.dispatcher.phases[3].result
        const phase_middle = document.createElement("div");
        phase_middle.className = "middle-phase-5";
        phase_middle.id = "middle-phase-5";
        this.master_middle.appendChild(phase_middle);
        const expectedText = document.createElement("div");
        expectedText.classList.add('inverted-text')
        expectedText.innerHTML = 'EXPECTED'
        phase_middle.appendChild(expectedText)
        const expectedGrid = document.createElement("div");
        expectedGrid.classList.add('results-grid')
        for (let i=0; i<3; i++)  {
            const info = document.createElement("div")
            info.innerHTML = `${localPlayerNames[i]}`.toUpperCase()
            expectedGrid.appendChild(info)
        }
        for (let i=0; i<3; i++)  {
            const res = document.createElement("div")
            res.innerHTML = `${this.result["optimal"][playerOrder[i]]}`.toUpperCase()
            expectedGrid.appendChild(res)
        }
        phase_middle.appendChild(expectedGrid)
        const actualText = document.createElement("div");
        actualText.classList.add('inverted-text')
        actualText.innerHTML = 'ACTUAL'
        phase_middle.appendChild(actualText)
        const actualGrid = document.createElement("div");
        actualGrid.classList.add('results-grid')
        for (let i=0; i<3; i++)  {
            const info = document.createElement("div")
            info.innerHTML = `${localPlayerNames[i]}`.toUpperCase()
            actualGrid.appendChild(info)
        }
        for (let i=0; i<3; i++)  {
            const res = document.createElement("div")
            res.innerHTML = `${this.result["final"][playerOrder[i]]}`.toUpperCase()
            actualGrid.appendChild(res)
        }
        phase_middle.appendChild(actualGrid)
        const newGameButton = createButton()
        newGameButton.innerText = "NEW GAME";
        newGameButton.clickLogic = () => this.dispatch();
        const buttonStrip = document.createElement('div')
        buttonStrip.style.marginTop = `${globals.CSS_VARIABLES["font-size"]}px`
        /*buttonStrip.style.marginTop = `${0.5*globals.CSS_VARIABLES["card-width"]}px`;*/
        buttonStrip.classList.add('button-strip')
        buttonStrip.appendChild(newGameButton);
        phase_middle.appendChild(buttonStrip);
    };

    dispatch() {
        if (!this.dispatched) {
            this.dispatched = true
            while (this.master_middle.firstChild) {
                this.master_middle.removeChild(this.master_middle.firstChild);
            };
            window.location.href = '/blog/preferans/solver.html';
        }
    };
};