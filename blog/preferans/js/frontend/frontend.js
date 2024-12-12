import * as globals from '../globals.js'
import { Phase_1 } from './phase-1.js'
import { Phase_2 } from './phase-2.js'
import { Phase_3 } from './phase-3.js'
import { Phase_4 } from './phase-4.js'
import { Phase_5 } from './phase-5.js'
import { MouseEventHandler, updateButtonsLock, refreshLayout, applyCSSVariables, updateLayout } from './utils.js'
import { createAbout } from '../about.js'

export let IMAGES;
applyCSSVariables()
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});


class FrontendDispatcher {
    constructor() {
        this.event_handler = new MouseEventHandler(this)
        window.addEventListener('resize', () => {
            refreshLayout()
        })
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


document.addEventListener('DOMContentLoaded', async () => {
    await createAbout();
    document.addEventListener('dragover', (event) => {
        event.preventDefault();
    });
    IMAGES = await globals.preloadImages();
    const dispatcher = new FrontendDispatcher();
});