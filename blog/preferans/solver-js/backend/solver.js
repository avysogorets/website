import * as globals from '../globals.js'
import { get_options } from './utils.js'


export class Solver {
    
    constructor(game) {
        this.dp = {}
        this._dp_keys = new Set()
        this.game = game
    };
    
    solve() {
        this._solve(this.game.to_string());
    };
    
    _solve(game_str) {
        if (game_str.length <= 9) {
            this.dp[game_str] = [0, 0, 0]
            this._dp_keys.add(game_str)
        }
        else {
            let options = get_options(game_str);
            let new_game_strs = options['new_game_strs'];
            let new_game_ress = options['new_game_ress'];
            let components = game_str.split(".");
            let turn_str = components[1]
            let type_str = components[2]
            var current_obj = Number.MIN_SAFE_INTEGER;
            for (let i=0; i<new_game_strs.length; i++) {
                if (!this._dp_keys.has(new_game_strs[i])) {
                    this._solve(new_game_strs[i]);
                };
                let new_game_res = new_game_ress[i];
                new_game_res[0] += this.dp[new_game_strs[i]][0];
                new_game_res[1] += this.dp[new_game_strs[i]][1];
                new_game_res[2] += this.dp[new_game_strs[i]][2];
                let isPandTurn = (turn_str == "0" && type_str == `${globals.PLAY}`)
                let isMandTurn = (turn_str == "0" && type_str == `${globals.MISERE}`)
                let isPnotTurn = (turn_str != "0" && type_str == `${globals.PLAY}`)
                let isMnotTurn = (turn_str != "0" && type_str == `${globals.MISERE}`)
                let maximize_obj = isPandTurn || isMnotTurn;
                let minimize_obj = isMandTurn || isPnotTurn;
                if (maximize_obj == true && current_obj <= new_game_res[0]) {
                    current_obj = new_game_res[0];
                    this.dp[game_str] = new_game_res;
                    this._dp_keys.add(game_str)
                };
                if (minimize_obj == true && current_obj <= -new_game_res[0]) {
                    current_obj = -new_game_res[0];
                    this.dp[game_str] = new_game_res
                    this._dp_keys.add(game_str)
                };
            };
        };
    };
};