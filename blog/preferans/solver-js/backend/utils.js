import * as globals from '../globals.js'


function compareCards(card_1, card_2, trumps=globals.NO_TRUMP_ID) {
    if (trumps !== globals.NO_TRUMP_ID) {
        if (card_1.suit === trumps && card_2.suit !== trumps) {
            return true;
        }
        if (card_1.suit !== trumps && card_2.suit === trumps) {
            return false;
        }
    };
    if (card_1.kind < card_2.kind) {
        return false;
    };
    if (card_1.kind > card_2.kind) {
        return true;
    };
    return true
};


export function settle_trick_(suit_strs, trick_1_suit, trick_2_suit, trick_3_suit, trumps) {
    let trick_1 = `${globals.TRICK_1}`
    let trick_1_kind = suit_strs[trick_1_suit].indexOf(trick_1)
    let trick_2 = `${globals.TRICK_2}`
    let trick_2_kind = suit_strs[trick_2_suit].indexOf(trick_2)
    let trick_3 = `${globals.TRICK_3}`
    let trick_3_kind = suit_strs[trick_3_suit].indexOf(trick_3)
    assert(trick_1_kind >= 0 && trick_2_kind >= 0 && trick_3_kind >= 0, "Badness!")
    let trick_1_card = globals.CARDS[8*trick_1_suit+trick_1_kind]
    let trick_2_card = globals.CARDS[8*trick_2_suit+trick_2_kind]
    let trick_3_card = globals.CARDS[8*trick_3_suit+trick_3_kind]
    let proxy_cards = [trick_1_card, trick_2_card, trick_3_card]
    let winner = settle_trick(proxy_cards, trumps)
    return winner
};


export function settle_trick(cards, trumps) {
    var is_trump = false
    cards.forEach(card => {
        if (card.suit == trumps) {
            is_trump = true
        }
    });
    if (!is_trump) {
        trumps = cards[0].suit
    };
    if (compareCards(cards[0], cards[1], trumps)) {
        if (compareCards(cards[0], cards[2], trumps)) {
            return 0
        }
        else {
            return 2
        };
    }
    else {
        if (compareCards(cards[1], cards[2], trumps)) {
            return 1
        }
        else {
            return 2
        };
    };
};


export function get_options(game_str) {
    let components = game_str.split(".");
    let suits_str = components[0]
    let turn_str = components[1]
    let type_str = components[2]
    let trump_str = components[3]
    let trumps = parseInt(trump_str)
    let suit_strs = suits_str.split(" ");
    var trick_1_suit = -1
    var trick_2_suit = -1
    for (let i=0; i<suit_strs.length; i++) {
        if (suit_strs[i].includes(`${globals.TRICK_1}`)) {
            trick_1_suit = i
        };
        if (suit_strs[i].includes(`${globals.TRICK_2}`)) {
            trick_2_suit = i
        };
    };
    let allowed_suits = []
    if (trick_1_suit >= 0 && 
            suit_strs[trick_1_suit].includes(turn_str)) {
        allowed_suits = [trick_1_suit]
    }
    else if (trump_str != `${globals.NO_TRUMP_ID}` &&
            trick_1_suit >= 0 &&
            suit_strs[trumps].includes(turn_str)) {
        allowed_suits = [trumps]
    }
    else {
        allowed_suits = [0, 1, 2, 3]
    };
    var new_game_strs = []
    var new_game_ress = []
    var next_trick_id = NaN
    if (trick_2_suit >= 0) {
        next_trick_id = globals.TRICK_3
    }
    else if (trick_1_suit >= 0) {
        next_trick_id = globals.TRICK_2
    }
    else {
        next_trick_id = globals.TRICK_1
    };
    allowed_suits.forEach(suit => {
        var new_block = true
        for (let i=0; i<suit_strs[suit].length; i++) {
            if (new_block == true && `${suit_strs[suit][i]}` == turn_str) {
                var new_game_res = [0, 0, 0]
                var new_suit_str_ = suit_strs[suit].split('')
                new_suit_str_[i] = `${next_trick_id}`
                let new_suit_str = new_suit_str_.join('')
                var new_suit_strs = suits_str.split(' ')
                new_suit_strs[suit] = new_suit_str
                let new_turn = NaN;
                if (next_trick_id == globals.TRICK_3) {
                    let winner = settle_trick_(
                        new_suit_strs,
                        trick_1_suit,
                        trick_2_suit,
                        suit,
                        trumps)
                    new_turn = mod((parseInt(turn_str)+winner-2), 3)
                    new_game_res[new_turn] += 1
                    let regexp_1 = new RegExp(globals.TRICK_1, 'g');
                    new_suit_strs[trick_1_suit] = new_suit_strs[trick_1_suit].replace(regexp_1, '');
                    let regexp_2 = new RegExp(globals.TRICK_2, 'g');
                    new_suit_strs[trick_2_suit] = new_suit_strs[trick_2_suit].replace(regexp_2, '');
                    let regexp_3 = new RegExp(globals.TRICK_3, 'g');
                    new_suit_strs[suit] = new_suit_strs[suit].replace(regexp_3, '');
                }
                else {
                    new_turn = mod((parseInt(turn_str)+1), 3)
                }
                let new_suits_str = new_suit_strs.join(" ");
                let new_turn_str = `${new_turn}`
                let new_game_arr = [new_suits_str, new_turn_str, type_str, trump_str]
                let new_game_str = new_game_arr.join(".")
                new_game_strs.push(new_game_str)
                new_game_ress.push(new_game_res)
                new_block = false
            }
            else if (suit_strs[suit][i] != turn_str) {
                new_block = true
            };
        };
    });
    return {
        'new_game_strs': new_game_strs,
        'new_game_ress': new_game_ress}
};

export function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
    };
};

export function mod(n, m) {
    return ((n % m) + m) % m;
};