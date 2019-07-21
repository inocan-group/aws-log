import { IDictionary } from "common-types";
import { IParsedArn } from "./parseArn";
import { Lambda } from "aws-sdk";
/**
 * buildRequest
 *
 * Builds a request object for the AWS Lambda invoke() functions
 * parameters
 *
 * @param request the dictionary of name/value pairings to be sent
 *    as the EVENT payload to the new Lambda function
 * @param arn the ARN identification of the resource being called in
 *    the structured components that parseArn() provides
 */
export declare function buildInvocationRequest<T extends IDictionary>(arn: IParsedArn, request: T): Lambda.InvocationRequest;
