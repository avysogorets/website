export const _CSS_VARIABLES = {
    'transition-time': 0.4,
    'font-size': 20,
    'border-width': 2,
    'button-font-size': 18,
    'button-padding': 4,
    'info-font-size': 24,
    'card-height': 90,
    'card-width': 64,
    'card-border': 0.5,
    'suit-container-margin': 10,
    'info-font-size-pad': 5}
export let CSS_VARIABLES = Object.assign({}, _CSS_VARIABLES);
export const MOBILE_FACTOR = 0.8
export const MAX_MOBILE_WIDTH = 680
export const IMG_PATH = "/blog/preferans/imgs/"
export const PLAYER_NAMES = ["SOUTH", "WEST", "EAST"]
export const SUIT_NAMES = ["SPADES", "DIAMONDS", "CLUBS", "HEARTS"]
export const GAME_NAMES = ["PLAY", "MISERE"]
export const MASTER_MIDDLE = "master-middle"
export const DRAG_THRESHOLD = 8;
export const START = 0;
export const END = 1;
export const RESTART = 2;
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
export const LAYOUT_MOBILE = 0;
export const LAYOUT_DESKTOP = 1;

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


