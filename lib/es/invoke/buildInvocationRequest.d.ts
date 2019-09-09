import { IDictionary } from "common-types";
import { IParsedArn } from "./parseArn";
/**
 * buildRequest
 *
 * Builds a request object for the AWS Lambda invoke() functions
 * parameters
 *
 * @param arn the ARN identification of the resource being called in
 *    the structured components that parseArn() provides
 * @param request the dictionary of name/value pairings to be sent
 *    as the EVENT payload to the new Lambda function
 */
export declare function buildInvocationRequest<T extends IDictionary & {
    headers?: IDictionary<string>;
}>(arn: IParsedArn, request: T): import("aws-sdk").Lambda.InvocationRequest;
