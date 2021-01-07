import { IDictionary, IAWSLambdaProxyIntegrationRequest, IAWSLambaContext } from "common-types";
import { ILoggerApi } from "./logging-api";
export declare type ILambdaEvent<T = IDictionary> = IAWSLambdaProxyIntegrationRequest | T;
export declare function lambda(event: ILambdaEvent, ctx: IAWSLambaContext, options?: IDictionary): ILoggerApi;
