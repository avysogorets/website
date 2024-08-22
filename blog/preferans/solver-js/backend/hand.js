import {mod, assert, settle_trick } from './utils.js'


export class Hand {
    
    constructor(cards, trick_flag=false, auto_flush=true) {

        this.cards = Array.from(cards);
        this.trick_flag = trick_flag
        this.auto_flush = auto_flush
    };
    
    add(card) {
        this.cards.push(card)
    };
    
    remove(card) {
        let index = this.cards.indexOf(card)
        if (index >= 0) {
            this.cards.splice(index, 1)
        };
    };
    
    options(trick, trumps) {
        let options = []
        if (trick.cards.length == 0) {
            return this.cards
        }
        else {
            this.cards.forEach(card => {
                if (trick.cards[0].suit == card.suit) {
                    options.push(card)
                }; 
            });
        };
        if (options.length == 0) {
            this.cards.forEach(card => {
                if (card.suit == trumps) {
                    options.push(card)
                };
            });
        };
        if (options.length == 0) {
            return this.cards
        };
        return options
    };
    
    play_card(card, turn, trick, trumps) {
        assert(trick.cards.length <= 3);
        assert(this.trick_flag == false);
        let num_tricks = [0, 0, 0];
        let new_turn = 0;
        this.remove(card);
        if (trick.cards.length == 2) {
            if (trick.auto_flush == true) {
                let trick_order = [
                        mod((turn-2), 3),
                        mod((turn-1), 3),
                        turn];
                let new_trick = Array.from(trick.cards);
                new_trick.push(card);
                let winner = settle_trick(new_trick, trumps);
                winner = trick_order[winner];
                num_tricks[winner] += 1;
                new_turn = winner;
                trick.cards = [];
            }
            else {
                trick.cards.push(card);
                new_turn = turn;
            };
        }
        else {
            new_turn = mod((turn+1), 3);
            trick.cards.push(card);
        };
        return [num_tricks, new_turn];
    };
};
