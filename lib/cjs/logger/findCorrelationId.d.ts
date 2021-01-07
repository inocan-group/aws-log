import { IAWSLambaContext } from "common-types";
import { ILambdaEvent } from "./lambda";
export declare type IPossibleCorrelationIds = {
    "X-Correlation-Id"?: string;
    "x-correlation-id"?: string;
    "@x-correlation-id"?: string;
    "@X-Correlation-Id"?: string;
};
/**
 * Looks for a Correlation ID in:
 *
 * - AWS Gateway headers (if they exist),
 * - in a `headers` property of the **body** (if it exists)
 */
export declare function findCorrelationId(event: ILambdaEvent, ctx: IAWSLambaContext): string | false;
