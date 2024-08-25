export const IMG_PATH = "/blog/preferans/imgs/"
export const PLAYER_NAMES = ["SOUTH", "WEST", "EAST"]
export const SUIT_NAMES = ["SPADES", "DIAMONDS", "CLUBS", "HEARTS"]
export const GAME_NAMES = ["PLAY", "MISERE"]
export const ROOT_STYLES = getComputedStyle(document.documentElement);
export const CARD_HEIGHT = parseInt(ROOT_STYLES.getPropertyValue('--card-height').trim().replace("px", ""))
export const CARD_WIDTH = parseInt(ROOT_STYLES.getPropertyValue('--card-width').trim().replace("px", ""))
export const BORDER_WIDTH = parseInt(ROOT_STYLES.getPropertyValue('--border-width').trim().replace("px", ""))
export const CARD_BORDER = parseInt(ROOT_STYLES.getPropertyValue('--card-border').trim().replace("px", ""))
export const TRANSITION_TIME= parseFloat(ROOT_STYLES.getPropertyValue('--transition-time').trim().replace("s", ""))
export const SELECTED_COLOR = "lightskyblue"

export const SUITS = ["0", "1", "2", "3"]
export const KINDS = ["0", "1", "2", "3", "4", "5", "6", "7"]
export const NO_TRUMP_ID = 9;
export const TRICK = 3;
export const TRICK_1 = 3;
export const TRICK_2 = 4;
export const TRICK_3 = 5;
export const NORMAL = 0;
export const PLAY = 0;
export const MISERE = 1;
export const SPADES = 0;
export const DIAMONDS = 1;
export const CLUBS = 2;
export const HEARTS = 3;
export const SOUTH = 0;
export const WEST = 1;
export const EAST = 2;

class Card {
    constructor(suit, kind) {
        this.suit = suit
        this.kind = kind
        this.id = suit + kind
        this.image = {
            'disabled': IMG_PATH + "card_imgs_disabled/" + this.suit + "_" + this.kind + '.png',
            'normal': IMG_PATH + "card_imgs_normal/" + this.suit + "_" + this.kind + '.png',
            'optimal': IMG_PATH + "card_imgs_optimal/" + this.suit + "_" + this.kind + '.png',
        }
    };
};

function createCards() {
    const cards = [];
    SUITS.forEach(suit => {
        KINDS.forEach(kind => {
            let card = new Card(suit, kind)
            cards.push(card);
        });
    });
    return cards
};

export const CARDS = createCards();