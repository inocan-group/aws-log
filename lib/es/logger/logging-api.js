import { getContext, getRootProperties, getLocalContext, addToLocalContext as addLocalContext, getCorrelationId, getSessionSampling, } from "./state";
import { LogLevel } from "../types";
import traverse from "traverse";
import { config } from "../logger";
import { sample } from "../shared/sample";
export const loggingApi = {
    /** an alias for the "info" level of logging */
    log: info,
    /** the most verbose level of logging, usually reserved for debugging purposes only */
    debug,
    /** informational messages about the state of the application/function/etc */
    info,
    /** messages which represent a concern or possible concern */
    warn,
    /** reserved for when a known error is encountered; beyond basic messaging the stack trace will passed along to stdout */
    error,
    /**
     * Allows the local context to be appended to
     */
    addToLocalContext: addToLocalCtx,
    /**
     * **addToMaskedValues**
     *
     * _add_ one (to many) parameters of values which should be
     * treated as a secret and never displayed in the logs.
     *
     * If you need to reset this property use `setMaskedValues()`
     * instead.
     */
    addToMaskedValues,
    /**
     * **setMaskedValues**
     *
     * _clears_ out the prior value for "maskedValues" and resets
     * it will whatever is passed in. These values will become the
     * values which are now "masked" instead of what had been there
     * before
     */
    setMaskedValues,
    /**
     * **pathBasedMaskingStrategy**
     *
     * Allows a particular _path_ (or _paths_) to have a specific
     * masking strategy
     *
     * @param strategy a string value representing the strategy to employ
     * @param paths  one or more path strings; a "path" should point to the
     * property which you are aiming to effect and will use the period (`.`) character
     * to indicate properties within a hash/dictionary
     */
    pathBasedMaskingStrategy,
    setStrategyForValue,
    getContext: () => getContext(),
    /**
     * **getCorrelationId**
     *
     * Get's the current correlation ID
     */
    getCorrelationId,
};
/** values which should always be masked */
let _maskedValues = new Set([]);
/** properties in the log message which should be masked */
const _maskedProperties = [];
/**
 * A dictionary where the _keys_ are masked-values and _values_ are strategies
 */
let _maskingStrategy = {
    default: "astericksWidthDynamic",
};
function addToMaskedValues(...props) {
    const values = props.map((i) => {
        if (Array.isArray(i)) {
            const [value, strategy] = i;
            setStrategyForValue(value, strategy);
            return value;
        }
        else {
            return i;
        }
    });
    _maskedValues = new Set(Array.from(_maskedValues).concat(values));
    return loggingApi;
}
/**
 * Sets a masking strategy for a specific value (versus using the default
 * masking strategy)
 */
function setStrategyForValue(value, strategy) {
    _maskingStrategy[value] = strategy;
}
/**
 * Sets the _masking strategy_ to be used at a particular **path** within the logging
 * structure.
 */
function pathBasedMaskingStrategy(strategy, ...paths) {
    paths.map((path) => {
        _maskingStrategy[path] = strategy;
    });
}
/**
 * Set values that when logged -- regardless of location/path -- should
 * be masked.
 */
function setMaskedValues(...props) {
    _maskedValues = new Set();
    _maskingStrategy = { default: "astericksWidthDynamic" };
    addToMaskedValues(...props);
    return loggingApi;
}
/**
 * **mask**
 *
 * Given an input hash/dictionary, this function checks for masked values
 * and applies the masking strategy to each instance.
 */
function mask(hash) {
    // value-masking strategy
    const cb = function (v) {
        if (this.isLeaf && _maskedValues.has(v))
            this.update(applyMask(this.path, v));
    };
    return traverse.map(hash, cb);
}
/**
 * **maskMessage**
 *
 * looks within the message string for secrets and
 * removes them.
 */
function maskMessage(msg) {
    Array.from(_maskedValues).map((v) => {
        const regEx = new RegExp(v, "g");
        const strategy = _maskingStrategy[v] || _maskingStrategy.default;
        msg = msg.replace(regEx, maskStrategies[strategy](v));
    });
    return msg;
}
function applyMask(path, v) {
    const dotPath = path.join(".");
    const strategy = _maskingStrategy[v] ||
        _maskingStrategy[dotPath] ||
        _maskingStrategy.default;
    return maskStrategies[strategy](v);
}
const maskStrategies = {
    astericksWidthFixed: (v) => "*".repeat(5),
    astericksWidthDynamic: (v) => "*".repeat(Math.min(v.length, 25)),
    revealEnd4: (v) => v.length >= 5 ? "*".repeat(v.length - 4) + v.slice(-4) : "*".repeat(5),
    revealStart4: (v) => v.length >= 5 ? v.slice(0, 4) + "*".repeat(v.length - 4) : "*".repeat(5),
};
/**
 * stdout
 *
 * Takes a localized logging message and adds "context" and all
 * "root level props" (aka, those starting with "@") to the message
 * before logging it to StdOut.
 *
 * @param hash the hash/dictionary coming from one of the logging
 * functions; it should include a "message", optional hash values
 */
export function stdout(hash) {
    const context = getContext();
    const rootProps = getRootProperties();
    const local = getLocalContext();
    hash = mask(hash);
    const output = Object.assign(Object.assign(Object.assign({ message: hash.message, severity: hash.severity, payload: hash.payload }, { local }), rootProps), { context });
    if (process.env.LOG_TESTING) {
        return output;
    }
    else {
        console.log(JSON.stringify(output, null, 2));
        return output;
    }
}
export function debug(message, params = {}) {
    if (statusForLogLevel("debug") === "all") {
        return stdout({
            message: maskMessage(message),
            severity: LogLevel.debug,
            payload: params,
        });
    }
}
export function info(message, params = {}) {
    if (statusForLogLevel("info") === "all") {
        return stdout({
            message: maskMessage(message),
            severity: LogLevel.info,
            payload: params,
        });
    }
}
function statusForLogLevel(logLevel) {
    let status;
    switch (config[logLevel]) {
        case "all":
        case "none":
            status = config[logLevel];
            break;
        case "sample-by-session":
            status = getSessionSampling();
            break;
        case "sample-by-event":
            status = sample(config.sampleRate);
            break;
        default:
            throw new Error(`Logging API configured incorrectly for 'info' logging`);
    }
    return status;
}
export function warn(message, params = {}) {
    const status = config.warn === "sample-by-event"
        ? sample(config.sampleRate)
        : config.warn;
    if (status === "all") {
        return stdout({
            message: maskMessage(message),
            severity: LogLevel.warn,
            payload: params,
        });
    }
}
export function error(
/** either a string message, or an error */
msgOrError, 
/** a contextual dictionary or an error */
paramsOrErr, 
/** an error object */
err) {
    const status = config.error === "sample-by-event"
        ? sample(config.sampleRate)
        : config.error;
    const context = getContext();
    const { message, params, theError } = parseErrParameters(msgOrError, paramsOrErr, err);
    if (status === "all") {
        return stdout({
            message,
            severity: LogLevel.error,
            isError: true,
            payload: {
                params,
                theError,
            },
        });
    }
}
function parseErrParameters(msgOrError, paramsOrErr, err) {
    const isAnError = (thingy) => {
        return typeof thingy === "object" && thingy.message && thingy.name
            ? true
            : false;
    };
    return isAnError(msgOrError)
        ? {
            message: msgOrError.message,
            params: {},
            error: msgOrError,
        }
        : isAnError(paramsOrErr)
            ? {
                message: msgOrError,
                params: {},
                error: paramsOrErr,
            }
            : {
                message: msgOrError,
                params: paramsOrErr,
                theError: err,
            };
}
export function addToLocalCtx(ctx) {
    addLocalContext(ctx);
    return loggingApi;
}
export const __testAccess__ = {
    mask,
    maskStrategies,
    setMaskedValues,
    pathBasedMaskingStrategy,
    maskMessage,
};
