import { LogLevel, IAwsLogContext, IAwsLog, IEnvStage } from "../types";
import { IDictionary } from "common-types";
import { lambda } from "./lambda";
export interface IAwsLogState {
    correlationId: string;
    kind: "lambda"
    /** this is effectively Lambda metrics */
     | "report" | "browser-log" | "brower-metrics" | "browser-event" | "performance-test" | "devops";
    severity: LogLevel;
    stage: IEnvStage;
    region?: string;
    context: IAwsLogContext;
    localContext: IDictionary;
}
/**
 * Set the "context" which are properties sent with
 * every request and hanging off the "context" property
 */
export declare function setContext(ctx: IDictionary): {
    log: typeof import("./logging-api").info;
    debug: typeof import("./logging-api").debug;
    info: typeof import("./logging-api").info;
    warn: typeof import("./logging-api").warn;
    error: typeof import("./logging-api").error;
    addToLocalContext: typeof import("./logging-api").addToLocalCtx;
    addToMaskedValues: (...props: (string | [string, import("./logging-api").IAwsLogMaskingStrategy])[]) => any;
    setMaskedValues: (...props: (string | [string, import("./logging-api").IAwsLogMaskingStrategy])[]) => any;
    pathBasedMaskingStrategy: (strategy: import("./logging-api").IAwsLogMaskingStrategy, ...paths: string[]) => void;
    setStrategyForValue: (value: string, strategy: import("./logging-api").IAwsLogMaskingStrategy) => void;
    getContext: () => IAwsLogContext;
    getCorrelationId: typeof getCorrelationId;
};
/**
 * Sets a localized context, this is a set of properties which are included
 * as part of the base properties of the message. Where the local logging has
 * a conflicting property name the local logging will overwrite this context
 */
export declare function setLocalContext(ctx: IDictionary): {
    log: typeof import("./logging-api").info;
    debug: typeof import("./logging-api").debug;
    info: typeof import("./logging-api").info;
    warn: typeof import("./logging-api").warn;
    error: typeof import("./logging-api").error;
    addToLocalContext: typeof import("./logging-api").addToLocalCtx;
    addToMaskedValues: (...props: (string | [string, import("./logging-api").IAwsLogMaskingStrategy])[]) => any;
    setMaskedValues: (...props: (string | [string, import("./logging-api").IAwsLogMaskingStrategy])[]) => any;
    pathBasedMaskingStrategy: (strategy: import("./logging-api").IAwsLogMaskingStrategy, ...paths: string[]) => void;
    setStrategyForValue: (value: string, strategy: import("./logging-api").IAwsLogMaskingStrategy) => void;
    getContext: () => IAwsLogContext;
    getCorrelationId: typeof getCorrelationId;
};
/**
 * Allows the local context to be added to after the intial setting
 */
export declare function addToLocalContext(ctx: IDictionary): {
    log: typeof import("./logging-api").info;
    debug: typeof import("./logging-api").debug;
    info: typeof import("./logging-api").info;
    warn: typeof import("./logging-api").warn;
    error: typeof import("./logging-api").error;
    addToLocalContext: typeof import("./logging-api").addToLocalCtx;
    addToMaskedValues: (...props: (string | [string, import("./logging-api").IAwsLogMaskingStrategy])[]) => any;
    setMaskedValues: (...props: (string | [string, import("./logging-api").IAwsLogMaskingStrategy])[]) => any;
    pathBasedMaskingStrategy: (strategy: import("./logging-api").IAwsLogMaskingStrategy, ...paths: string[]) => void;
    setStrategyForValue: (value: string, strategy: import("./logging-api").IAwsLogMaskingStrategy) => void;
    getContext: () => IAwsLogContext;
    getCorrelationId: typeof getCorrelationId;
};
export declare function getState(): IAwsLogState;
/** gets the logging context */
export declare const getContext: () => IAwsLogContext;
export declare function getLocalContext(): IDictionary<any>;
export declare function getCorrelationId(): string;
export declare function setCorrelationId(id: string): void;
export declare function setStage(stage: IEnvStage): void;
export declare function getStage(): IEnvStage;
export declare function getRootProperties(): Partial<IAwsLog>;
export declare function clearState(): void;
export declare function restoreState(): {
    log: typeof import("./logging-api").info;
    debug: typeof import("./logging-api").debug;
    info: typeof import("./logging-api").info;
    warn: typeof import("./logging-api").warn;
    error: typeof import("./logging-api").error;
    addToLocalContext: typeof import("./logging-api").addToLocalCtx;
    addToMaskedValues: (...props: (string | [string, import("./logging-api").IAwsLogMaskingStrategy])[]) => any;
    setMaskedValues: (...props: (string | [string, import("./logging-api").IAwsLogMaskingStrategy])[]) => any;
    pathBasedMaskingStrategy: (strategy: import("./logging-api").IAwsLogMaskingStrategy, ...paths: string[]) => void;
    setStrategyForValue: (value: string, strategy: import("./logging-api").IAwsLogMaskingStrategy) => void;
    getContext: () => IAwsLogContext;
    getCorrelationId: typeof getCorrelationId;
};
export declare function initSeverity(): void;
export declare function setSeverity(s: LogLevel): void;
export declare function getSeverity(): LogLevel;
export declare const contextApi: {
    /** set the context for logging with any hash object */
    context: typeof setContext;
    /** set the context for logging with the Lambda event and context */
    lambda: typeof lambda;
    /** allow for reloading context to last known point */
    reloadContext: typeof restoreState;
};
export declare function getSessionSampling(): "all" | "none";
