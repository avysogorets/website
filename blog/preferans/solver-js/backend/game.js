import * as globals from '../globals.js'
import { mod, assert, settle_trick } from './utils.js'
import { Hand } from './hand.js'


export class Game {
    constructor(hands, type, turn_id, player_id, trumps_id) {
        this.past_tricks = [0, 0, 0];
        this.future_tricks = [0, 0, 0];
        this.hands = [];
        hands.forEach(hand => {
            this.hands.push(hand.deepcopy());
        });
        if (hands.length == globals.PLAYER_NAMES.length) {
            this.hands.push(new Hand([], true, false));
        };
        this.suit_map = {};
        this.player_map = {};
        if (trumps_id != globals.NO_TRUMP_ID) {
            for (let i=0; i<4; i++) {
                this.suit_map[mod((i+trumps_id),4)] = i;
            };
        }
        else {
            for (let i=0; i<4; i++) {
                this.suit_map[i] = i;
            };
        };
        for (let i=0; i<3; i++) {
            this.player_map[mod((i+player_id), 3)] = i
        };
        this.params = {
            "type": type,
            "turn": turn_id,
            "player": player_id,
            "trumps": trumps_id};
    };

    deepcopy() {
        return new Game(
            this.hands,
            this.params["type"],
            this.params["turn"],
            this.params["player"],
            this.params["trumps"]);
    };

    play_card(card) {
        assert(this.hands[globals.TRICK].cards.length < 3);
        assert(this.hands[this.params["turn"]].cards.includes(card));
        let result = this.hands[this.params["turn"]].play_card(
            card,
            this.params["turn"],
            this.hands[globals.TRICK],
            this.params["trumps"]);
        let num_tricks = result[0];
        let new_turn = result[1];
        this.params["turn"] = new_turn;
        return num_tricks
    };

    flush() {
        assert(this.hands[globals.TRICK].cards.length == 3);
        let num_tricks = [0, 0, 0];
        let trick_order = [
            mod((this.params["turn"]-2), 3),
            mod((this.params["turn"]-1), 3),
            mod((this.params["turn"]-0), 3)];
        let winner = settle_trick(
            this.hands[globals.TRICK].cards,
            this.params["trumps"]);
        winner = trick_order[winner];
        num_tricks[winner] += 1;
        this.params["turn"] = winner;
        this.hands[globals.TRICK].cards = [];
        return num_tricks
    };

    to_string() {
        let suit_strs = {};
        let suit_map_items = Object.entries(this.suit_map);
        suit_map_items.sort((a, b) => a[0]<b[0]);
        let suit_map_vals = suit_map_items.map(item => item[1]);
        suit_map_vals.forEach(suit => {
            suit_strs[suit] = "";
        });
        globals.CARDS.forEach(card => {
            for (let i=0; i<3; i++) {
                let player = this.player_map[i]
                if (this.hands[player].cards.includes(card)) {
                    suit_strs[this.suit_map[card.suit]] += `${i}`;
                };
            };
            if (this.hands[globals.TRICK].cards.includes(card)) {
                if (this.hands[globals.TRICK].cards[0] == card) {
                    suit_strs[this.suit_map[card.suit]] += `${globals.TRICK_1}`;
                }
                else {
                    suit_strs[this.suit_map[card.suit]] += `${globals.TRICK_2}`;
                }
            }
        });
        let turn = this.params["turn"];
        if (this.hands[globals.TRICK].cards.length == 2) {
            suit_strs = adjust_left(
                    suit_strs,
                    globals.TRICK_1,
                    mod((this.player_map[turn]-2), 3));
            suit_strs = adjust_left(
                    suit_strs,
                    globals.TRICK_2,
                    mod((this.player_map[turn]-1), 3));
        }
        else if (this.hands[globals.TRICK].cards.length == 1) {
            suit_strs = adjust_left(
                    suit_strs,
                    globals.TRICK_1,
                    mod((this.player_map[turn]-1), 3));
        };
        let suits_str_items = Object.entries(suit_strs);
        suits_str_items.sort((a, b) => a[0]<b[0]);
        let suits_str_vals = suits_str_items.map(item => item[1]);
        let suits_str = suits_str_vals.join(" ");
        let trumps_id = NaN
        if (this.params["trumps"] != globals.NO_TRUMP_ID) {
            trumps_id = 0;
        }
        else {
            trumps_id = globals.NO_TRUMP_ID;
        };
        let game_arr = [
            suits_str,
            `${this.player_map[this.params["turn"]]}`,
            `${this.params["type"]}`,
            `${trumps_id}`];
        let game_str = game_arr.join(".");
        return game_str
    };
}

function adjust_left(suit_strs, to_adjust, player) {
    for (let i=0; i<4; i++) {
        if (suit_strs[i].indexOf(to_adjust)>0) {
            let suit_str_arr = suit_strs[i].split("");
            let idx = suit_str_arr.indexOf(`${to_adjust}`);
            while (idx>0 && suit_str_arr[idx-1] == player) {
                suit_str_arr[idx] = player;
                suit_str_arr[idx-1] = to_adjust;
                idx -= 1;
            };
            suit_strs[i] = suit_str_arr.join("");
        };
    };
    return suit_strs
};