import * as globals from '../globals.js'
import { Phase_1 } from './phase-1.js'
import { Phase_2 } from './phase-2.js'
import { Phase_3 } from './phase-3.js'
import { Phase_4 } from './phase-4.js'
import { Phase_5 } from './phase-5.js'
import { MouseEventHandler, updateButtonsLock, drawCard } from './utils.js'


document.documentElement.style.setProperty(
        '--card-width', `${globals.CARD_WIDTH}px`);
document.documentElement.style.setProperty(
        '--card-height', `${globals.CARD_HEIGHT}px`);
document.documentElement.style.setProperty(
        '--card-border', `${globals.CARD_BORDER}px`);
document.documentElement.style.setProperty(
        '--border-width', `${globals.BORDER_WIDTH}px`);
document.documentElement.style.setProperty(
        '--transition-time', `${globals.TRANSITION_TIME}s`);

export let IMAGES;

class FrontendDispatcher {
    constructor(is_mobile) {
        this.event_handler = new MouseEventHandler(this)
        this.is_mobile = is_mobile;
        this.init();
    };

    init() {
        this.hands = [
            document.getElementById('hand-' + globals.SOUTH),
            document.getElementById('hand-' + globals.WEST),
            document.getElementById('hand-' + globals.EAST)];
        this.phases = [
                new Phase_1(this),
                new Phase_2(this),
                new Phase_3(this),
                new Phase_4(this),
                new Phase_5(this)]
        this.phase_id = -1;
        this.dispatch()
    };

    async dispatch() {
        await updateButtonsLock(globals.RESTART)
        this.phase_id += 1;
        await this.phases[this.phase_id].init()
        refreshLayout()
    };

    restart() {
        this.init()
    };
};

function refreshLayout() {
    const middleMain = document.getElementById('middle-main');
    const middleMainHeight = parseFloat(getComputedStyle(middleMain).height);
    const handContainerVerts = document.querySelectorAll('.hand-container-vert');
    for (const handContainerVert of handContainerVerts) {
        const minHeight = parseFloat(getComputedStyle(handContainerVert).minHeight);
        handContainerVert.style.height = `${Math.max(middleMainHeight, minHeight)}px`;
    }
    Object.keys(globals.CARDS).forEach(card_id => drawCard(card_id));
}


document.addEventListener('DOMContentLoaded', async () => {
    document.addEventListener('dragover', (event) => {
        event.preventDefault();
    });
    IMAGES = await globals.preloadImages();
    let is_mobile = false;
    if (window.innerWidth < 768) {
        is_mobile = true;
    };
    const dispatcher = new FrontendDispatcher(is_mobile);
});