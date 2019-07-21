import { ILambdaEvent } from "./lambda";
import { IAWSLambaContext } from "common-types";
export declare function createCorrelationId(): string;
/**
 * Looks in various places to find an existing correlationId
 */
export declare function findCorrelationId(event: ILambdaEvent, context: IAWSLambaContext): string | false;
