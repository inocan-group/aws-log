"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionSample = void 0;
const sample_1 = require("./sample");
/**
 * **sessionConfig**
 *
 * converts all configs set to `sample-by-session` to either
 * `all` or `none` based on a sampling.
 *
 * @param config logging config
 */
function sessionSample(config) {
    // TODO: remove the "any" ... the error was a bit obtuse and runtime works
    return Object.keys(config).reduce((agg, i) => {
        agg[i] =
            config[i] === "sample-by-session"
                ? sample_1.sample(config.sampleRate)
                : config[i];
        return agg;
    }, {});
}
exports.sessionSample = sessionSample;
