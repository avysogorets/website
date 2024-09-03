import * as globals from '../globals.js'


export class Phase_5  {
    constructor(dispatcher) {
        this.dispatcher = dispatcher;
        this.master_middle = document.getElementById(globals.MASTER_MIDDLE);
    };

    init() {
        const phase_middle = document.createElement("div");
        phase_middle.className = "middle-phase-5";
        phase_middle.id = "middle-phase-5";
        this.master_middle.appendChild(phase_middle);
        this.result = this.dispatcher.phases[3].result
        this.result[" "] = globals.PLAYER_NAMES;
        const keys = ["optimal", " ", "final"]
        keys.forEach(key => {
            const keyText = document.createElement('div');
            keyText.style.textAlign = 'center';
            phase_middle.appendChild(keyText);
            keyText.innerText = `${key}`.toUpperCase();
        });
        for (let i=0; i<3; i++)  {
            keys.forEach(key => {
                const valText = document.createElement('div');
                valText.style.textAlign = 'center';
                phase_middle.appendChild(valText);
                valText.innerText = `${this.result[key][i]}`.toUpperCase();
            });
        };
        const newGameButton = document.createElement('button')
        newGameButton.className = "standard-button"
        newGameButton.innerText = "NEW GAME";
        newGameButton.style.marginTop = `${0.5*globals.CARD_WIDTH}px`;
        newGameButton.onclick = () => this.dispatch();
        const buttonHolder = document.createElement('div')
        buttonHolder.style.gridColumn = '1 / -1';
        buttonHolder.style.display = 'flex';
        buttonHolder.style.justifyContent = 'center';
        buttonHolder.appendChild(newGameButton);
        phase_middle.appendChild(buttonHolder);
    };

    dispatch() {
        while (this.master_middle.firstChild) {
            this.master_middle.removeChild(this.master_middle.firstChild);
        };
        window.location.href = '/blog/preferans/solver.html';
    };
};