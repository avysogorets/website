import * as globals from '../globals.js'
import { Phase_1 } from './phase-1.js'
import { Phase_2 } from './phase-2.js'
import { Phase_3 } from './phase-3.js'
import { Phase_4 } from './phase-4.js'
import { Phase_5 } from './phase-5.js'


export const IMAGES = globals.preloadImages();


document.documentElement.style.setProperty(
        '--card-width', `${globals.CARD_WIDTH}px`);
document.documentElement.style.setProperty(
        '--card-height', `${globals.CARD_HEIGHT}px`);
document.documentElement.style.setProperty(
        '--card-border', `${globals.CARD_BORDER}px`);
document.documentElement.style.setProperty(
        '--border-width', `${globals.BORDER_WIDTH}px`);
document.documentElement.style.setProperty(
        '--transition_time', `${globals.TRANSITION_TIME}s`);


class FrontendDispatcher {
    constructor() {
        this.init()
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

    dispatch() {
        this.phase_id += 1;
        console.log(this.phase_id)
        this.phases[this.phase_id].init()
    };

    restart() {
        this.init()
    };
};

document.addEventListener('DOMContentLoaded', () => {
    const dispatcher = new FrontendDispatcher();
});