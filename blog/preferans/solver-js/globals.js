export const IMG_PATH = "/blog/preferans/imgs/"
export const PLAYER_NAMES = ["SOUTH", "WEST", "EAST"]
export const SUIT_NAMES = ["SPADES", "DIAMONDS", "CLUBS", "HEARTS"]
export const GAME_NAMES = ["PLAY", "MISERE"]
export const CARD_HEIGHT = 90;
export const CARD_WIDTH = 64
export const BORDER_WIDTH = 2;
export const CARD_BORDER = 0.5;
export const TRANSITION_TIME = 0.2;
export const SELECTED_COLOR = "lightskyblue"
export const MESSAGE_CONTAINER = "message-container"
export const MASTER_MIDDLE = "master-middle"
export const INFO_FONT_SIZE = 24;
export const FONT_SIZE = 20;

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
    };
};

export function createCards() {
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

export function preloadImages() {
    const images = {
        "disabled": [],
        "normal": [],
        "optimal": []};

    Object.keys(images).forEach(key => {
        Object.keys(CARDS).forEach(card_id => {
            const img = new Image();
            const card_key = `${CARDS[card_id].suit}_${CARDS[card_id].kind}`;
            img.src = IMG_PATH + `card_imgs_${key}/${card_key}.png`;
            images[key].push(img)
        });
    });
    return images
};


