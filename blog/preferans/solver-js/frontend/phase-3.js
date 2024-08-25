import * as globals from '../globals.js'
import { Game } from '../backend/game.js'
import { Hand } from '../backend/hand.js'
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
        this.master_middle.appendChild(this.phase_middle);
        let parameters = this.dispatcher.phases[1].parameters;
        let type = globals.GAME_NAMES.indexOf(parameters["contract type"]);
        let player_id = globals.PLAYER_NAMES.indexOf(parameters["playing hand"]);
        let turn_id = globals.PLAYER_NAMES.indexOf(parameters["first hand"]);
        let trump_id = NaN;
        if (parameters["trump suit"] == "NONE") {
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
        this.solve();
    };

    solve() {
        this.solver = new Solver(this.game, this.phase_middle);
        this.solver.solve()
        console.log(this.solver._dp_keys.size)
    };
};