import * as globals from '../globals.js'
import { Game } from '../backend/game.js'
import { Solver } from '../backend/solver.js';


export class Phase_3 {  
    constructor(dispatcher) {
        this.dispatcher = dispatcher;
        this.master_middle = document.getElementById("master-middle");
    };

    init() {
        this.phase_middle = document.createElement("div");
        this.phase_middle.className = "middle-phase-3";
        this.phase_middle.id = "middle-phase-3";
        this.master_middle.appendChild(phase_middle);
        let parameters = dispatcher.phases[1].parameters;
        let type = globals.GAME_NAMES.indexOf(parameters["type"]);
        let player_id = globals.PLAYER_NAMES.indexOf(parameters["playing hand"]);
        let turn_id = globals.PLAYER_NAMES.indexOf(parameters["first hand"]);
        let trump_id = NaN;
        if (parameters["trump suit"] == "NONE") {
            trump_id = globals.NO_TRUMP_ID;
        }
        else {
            trump_id = globals.SUIT_NAMES.indexOf(parameters["trump suit"]);
        };
        this.game = Game(this.dispatcher.hands, type, turn_id, player_id, trump_id);
        this._solve();
    };

    _solve() {
        this.solver = Solver(this.game);
        this.solver.solve();
    };

    _live_count() {
        const intervalId = setInterval(() => {
            const count = this.solver._dp_keys.length;
            this.phase_middle.innerText = `Subgames solved: ${count}`;
        }, 10);
        return intervalId;
    }
};