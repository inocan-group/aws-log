import { IDictionary, IAWSLambdaProxyIntegrationRequest, IAWSLambaContext } from "common-types";
export declare type ILambdaEvent<T = IDictionary> = IAWSLambdaProxyIntegrationRequest | T;
export declare function lambda(event: ILambdaEvent, ctx: IAWSLambaContext, options?: IDictionary): {
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
    getContext: () => import("..").IAwsLogContext;
    getCorrelationId: typeof import("./state").getCorrelationId;
};
