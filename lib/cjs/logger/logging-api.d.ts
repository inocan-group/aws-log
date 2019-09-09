import { IDictionary } from "common-types";
import { getCorrelationId } from "./state";
import { IAwsLog } from "../types";
export declare const loggingApi: {
    /** an alias for the "info" level of logging */
    log: typeof info;
    /** the most verbose level of logging, usually reserved for debugging purposes only */
    debug: typeof debug;
    /** informational messages about the state of the application/function/etc */
    info: typeof info;
    /** messages which represent a concern or possible concern */
    warn: typeof warn;
    /** reserved for when a known error is encountered; beyond basic messaging the stack trace will passed along to stdout */
    error: typeof error;
    /**
     * Allows the local context to be appended to
     */
    addToLocalContext: typeof addToLocalCtx;
    /**
     * **addToMaskedValues**
     *
     * _add_ one (to many) parameters of values which should be
     * treated as a secret and never displayed in the logs.
     *
     * If you need to reset this property use `setMaskedValues()`
     * instead.
     */
    addToMaskedValues: typeof addToMaskedValues;
    /**
     * **setMaskedValues**
     *
     * _clears_ out the prior value for "maskedValues" and resets
     * it will whatever is passed in. These values will become the
     * values which are now "masked" instead of what had been there
     * before
     */
    setMaskedValues: typeof setMaskedValues;
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
    pathBasedMaskingStrategy: typeof pathBasedMaskingStrategy;
    setStrategyForValue: typeof setStrategyForValue;
    getContext: () => import("../types").IAwsLogContext;
    /**
     * **getCorrelationId**
     *
     * Get's the current correlation ID
     */
    getCorrelationId: typeof getCorrelationId;
};
export declare type ILoggerApi = typeof loggingApi;
export declare type IAwsLogMaskingStrategy = 
/** just show astericks and always show length of 5 */
"astericksWidthFixed"
/** show only astericks but the number is equavalent to length of value with a max length of 15 */
 | "astericksWidthDynamic"
/**
 * show astericks but reveals the real value for last 4 characters
 * (must be at least 10 characters long or reverts to `astericksWidthFixed`)
 */
 | "revealEnd4"
/**
 * show astericks but reveals the real value for the first 4 characters
 * (must be at least 10 characters long or reverts to `astericksWidthFixed`)
 */
 | "revealStart4";
declare function addToMaskedValues(...props: Array<string | [string, IAwsLogMaskingStrategy]>): {
    /** an alias for the "info" level of logging */
    log: typeof info;
    /** the most verbose level of logging, usually reserved for debugging purposes only */
    debug: typeof debug;
    /** informational messages about the state of the application/function/etc */
    info: typeof info;
    /** messages which represent a concern or possible concern */
    warn: typeof warn;
    /** reserved for when a known error is encountered; beyond basic messaging the stack trace will passed along to stdout */
    error: typeof error;
    /**
     * Allows the local context to be appended to
     */
    addToLocalContext: typeof addToLocalCtx;
    /**
     * **addToMaskedValues**
     *
     * _add_ one (to many) parameters of values which should be
     * treated as a secret and never displayed in the logs.
     *
     * If you need to reset this property use `setMaskedValues()`
     * instead.
     */
    addToMaskedValues: typeof addToMaskedValues;
    /**
     * **setMaskedValues**
     *
     * _clears_ out the prior value for "maskedValues" and resets
     * it will whatever is passed in. These values will become the
     * values which are now "masked" instead of what had been there
     * before
     */
    setMaskedValues: typeof setMaskedValues;
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
    pathBasedMaskingStrategy: typeof pathBasedMaskingStrategy;
    setStrategyForValue: typeof setStrategyForValue;
    getContext: () => import("../types").IAwsLogContext;
    /**
     * **getCorrelationId**
     *
     * Get's the current correlation ID
     */
    getCorrelationId: typeof getCorrelationId;
};
/**
 * Sets a masking strategy for a specific value (versus using the default
 * masking strategy)
 */
declare function setStrategyForValue(value: string, strategy: IAwsLogMaskingStrategy): void;
/**
 * Sets the _masking strategy_ to be used at a particular **path** within the logging
 * structure.
 */
declare function pathBasedMaskingStrategy(strategy: IAwsLogMaskingStrategy, ...paths: string[]): void;
/**
 * Set values that when logged -- regardless of location/path -- should
 * be masked.
 */
declare function setMaskedValues(...props: Array<string | [string, IAwsLogMaskingStrategy]>): {
    /** an alias for the "info" level of logging */
    log: typeof info;
    /** the most verbose level of logging, usually reserved for debugging purposes only */
    debug: typeof debug;
    /** informational messages about the state of the application/function/etc */
    info: typeof info;
    /** messages which represent a concern or possible concern */
    warn: typeof warn;
    /** reserved for when a known error is encountered; beyond basic messaging the stack trace will passed along to stdout */
    error: typeof error;
    /**
     * Allows the local context to be appended to
     */
    addToLocalContext: typeof addToLocalCtx;
    /**
     * **addToMaskedValues**
     *
     * _add_ one (to many) parameters of values which should be
     * treated as a secret and never displayed in the logs.
     *
     * If you need to reset this property use `setMaskedValues()`
     * instead.
     */
    addToMaskedValues: typeof addToMaskedValues;
    /**
     * **setMaskedValues**
     *
     * _clears_ out the prior value for "maskedValues" and resets
     * it will whatever is passed in. These values will become the
     * values which are now "masked" instead of what had been there
     * before
     */
    setMaskedValues: typeof setMaskedValues;
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
    pathBasedMaskingStrategy: typeof pathBasedMaskingStrategy;
    setStrategyForValue: typeof setStrategyForValue;
    getContext: () => import("../types").IAwsLogContext;
    /**
     * **getCorrelationId**
     *
     * Get's the current correlation ID
     */
    getCorrelationId: typeof getCorrelationId;
};
/**
 * **mask**
 *
 * Given an input hash/dictionary, this function checks for masked values
 * and applies the masking strategy to each instance.
 */
declare function mask<T extends IDictionary = IDictionary>(hash: T): any;
/**
 * **maskMessage**
 *
 * looks within the message string for secrets and
 * removes them.
 */
declare function maskMessage(msg: string): string;
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
export declare function stdout(hash: Partial<IAwsLog> & {
    message: string;
}): IAwsLog;
export declare function debug(message: string, params?: IDictionary): IAwsLog;
export declare function info(message: string, params?: IDictionary): IAwsLog;
export declare function warn(message: string, params?: IDictionary): IAwsLog;
/**
 * Newer versions of JS will have the `code` property
 * on Error but most do not so we are simply extending
 * the boring old Error class to optionally include it
 */
export interface IErrorWithCode extends Error {
    code?: string;
}
export declare function error(
/** either a string message, or an error */
msgOrError: string | IErrorWithCode, 
/** a contextual dictionary or an error */
paramsOrErr?: IDictionary | IErrorWithCode, 
/** an error object */
err?: IErrorWithCode): IAwsLog;
export declare function addToLocalCtx(ctx: IDictionary): {
    /** an alias for the "info" level of logging */
    log: typeof info;
    /** the most verbose level of logging, usually reserved for debugging purposes only */
    debug: typeof debug;
    /** informational messages about the state of the application/function/etc */
    info: typeof info;
    /** messages which represent a concern or possible concern */
    warn: typeof warn;
    /** reserved for when a known error is encountered; beyond basic messaging the stack trace will passed along to stdout */
    error: typeof error;
    /**
     * Allows the local context to be appended to
     */
    addToLocalContext: typeof addToLocalCtx;
    /**
     * **addToMaskedValues**
     *
     * _add_ one (to many) parameters of values which should be
     * treated as a secret and never displayed in the logs.
     *
     * If you need to reset this property use `setMaskedValues()`
     * instead.
     */
    addToMaskedValues: typeof addToMaskedValues;
    /**
     * **setMaskedValues**
     *
     * _clears_ out the prior value for "maskedValues" and resets
     * it will whatever is passed in. These values will become the
     * values which are now "masked" instead of what had been there
     * before
     */
    setMaskedValues: typeof setMaskedValues;
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
    pathBasedMaskingStrategy: typeof pathBasedMaskingStrategy;
    setStrategyForValue: typeof setStrategyForValue;
    getContext: () => import("../types").IAwsLogContext;
    /**
     * **getCorrelationId**
     *
     * Get's the current correlation ID
     */
    getCorrelationId: typeof getCorrelationId;
};
export declare const __testAccess__: {
    mask: typeof mask;
    maskStrategies: {
        astericksWidthFixed: (v: string) => string;
        astericksWidthDynamic: (v: string) => string;
        revealEnd4: (v: string) => string;
        revealStart4: (v: string) => string;
    };
    setMaskedValues: typeof setMaskedValues;
    pathBasedMaskingStrategy: typeof pathBasedMaskingStrategy;
    maskMessage: typeof maskMessage;
};
export {};
