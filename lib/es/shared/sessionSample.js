import { sample } from "./sample";
/**
 * **sessionConfig**
 *
 * converts all configs set to `sample-by-session` to either
 * `all` or `none` based on a sampling.
 *
 * @param config logging config
 */
export function sessionSample(config) {
    // TODO: remove the "any" ... the error was a bit obtuse and runtime works
    return Object.keys(config).reduce((agg, i) => {
        agg[i] =
            config[i] === "sample-by-session"
                ? sample(config.sampleRate)
                : config[i];
        return agg;
    }, {});
}
