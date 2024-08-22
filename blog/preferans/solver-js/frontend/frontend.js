import * as globals from '../globals.js'
import { Phase_1 } from './phase-1.js'
import { Phase_2 } from './phase-2.js'
import { Phase_3 } from './phase-3.js'


class FrontendDispatcher {
    constructor() {
        this.hands = [
            document.getElementById('hand-' + globals.SOUTH),
            document.getElementById('hand-' + globals.WEST),
            document.getElementById('hand-' + globals.EAST)];
        this.phases = [
                new Phase_1(this),
                new Phase_2(this),
                new Phase_3(this)]
        this.phase_id = -1;
        this.dispatch()
    };
    dispatch() {
        this.phase_id += 1;
        this.phases[this.phase_id].init()
    };
};

document.addEventListener('DOMContentLoaded', () => {
    const dispatcher = new FrontendDispatcher();
});