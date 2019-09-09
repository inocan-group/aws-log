import { ILambdaEvent } from "./lambda";
import { IHttpRequestHeaders } from "common-types";
/**
 * Looks in various places to find an existing `correlationId`
 */
export declare function findCorrelationId(event: ILambdaEvent, headers?: IHttpRequestHeaders): string | false;
