import { Solver } from "../backend/solver"; // TODO: verify pass is correct

self.onmessage = function (e) {
    const { game } = e.data;
    // Pass self to Solver so it can report progress to main thread.
    const solver = new Solver(game, self);
    // This will solve is blocking manner but post messages to main thread context that is not blocked.
    solver.solve();

    self.close(); // Terminate the worker
};