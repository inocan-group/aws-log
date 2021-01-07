"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sample = void 0;
/**
 * **sample**
 *
 * samples a random number and sees if it is within the
 * sampling rate, if so it returns `all` otherwise `none`
 */
function sample(samplingRate) {
    const s = Math.random();
    const rate = samplingRate || 0.1;
    return s <= rate ? "all" : "none";
}
exports.sample = sample;
