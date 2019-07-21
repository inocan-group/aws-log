/**
 * **sample**
 *
 * samples a random number and sees if it is within the
 * sampling rate, if so it returns `all` otherwise `none`
 */
export function sample(samplingRate) {
    const s = Math.random();
    const rate = samplingRate || 0.1;
    return s <= rate ? "all" : "none";
}
