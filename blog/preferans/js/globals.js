export const IMG_PATH = "/blog/preferans/imgs/"
export const PLAYER_NAMES = ["SOUTH", "WEST", "EAST"]
export const SUIT_NAMES = ["SPADES", "DIAMONDS", "CLUBS", "HEARTS"]
export const GAME_NAMES = ["PLAY", "MISERE"]
export const CARD_HEIGHT = 90;
export const CARD_WIDTH = 64
export const BORDER_WIDTH = 2;
export const CARD_BORDER = 0.5;
export const TRANSITION_TIME = 0.3;
export const SELECTED_COLOR = "lightskyblue"
export const MASTER_MIDDLE = "master-middle"
export const INFO_FONT_SIZE = 24;
export const FONT_SIZE = 20;
export const DRAG_THRESHOLD = CARD_HEIGHT / 12;
export const START = 0;
export const END = 1;
export const RESTART = 2;
export const RADIO_LOCK = 2;
export const RADIO_UNLOCK = 1;

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

export const preloadImages = async () => {
    return new Promise((resolve) => {
        const images = {
            "disabled": [],
            "normal": [],
            "optimal": []}
        const imageLoadPromises = [];
        Object.keys(images).forEach(key => {
            Object.keys(CARDS).forEach(card_id => {
                const img = new Image();
                const card_key = `${CARDS[card_id].suit}_${CARDS[card_id].kind}`;
                img.src = IMG_PATH + `card_imgs_${key}/${card_key}.png`;
                const imgLoadPromise = new Promise((imgResolve) => {
                    img.onload = imgResolve;
                });
                imageLoadPromises.push(imgLoadPromise);
                images[key].push(img)
            });
        });
        images["suits"] = {"normal": {}, "selected": {}};
        for (const suit of SUIT_NAMES) {
            Object.keys(images["suits"]).forEach(key => {
                const img = new Image();
                const img_key = `${suit[0]}_${key}`
                img.src = IMG_PATH + `card_utils/${img_key}.png`
                const imgLoadPromise = new Promise((imgResolve) => {
                    img.onload = imgResolve;
                });
                imageLoadPromises.push(imgLoadPromise);
                images["suits"][key][suit] = img
            });
        }
        Promise.all(imageLoadPromises).then(() => {
            resolve(images)
        })
    })
};

let transitionLock = false;
export function setTransitionLock(val) {
    transitionLock = val;
}
export function getTransitionLock() {
    return transitionLock;
}


