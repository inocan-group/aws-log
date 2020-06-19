import { IHttpRequestHeaders } from "common-types";
import { ILambdaEvent } from "./lambda";
/**
 * Looks in various places to find an existing `correlationId`
 */
export declare function findCorrelationId(event: ILambdaEvent, headers?: IHttpRequestHeaders): string | false;
