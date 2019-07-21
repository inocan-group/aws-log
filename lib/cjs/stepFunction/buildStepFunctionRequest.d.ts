import { IDictionary } from "common-types";
import { IParsedArn } from "./parseStepArn";
/**
 * buildRequest
 *
 * Builds a request object for the AWS StepFunctions start() method
 * parameters
 *
 * @param arn ta full or partial string representation of the state machine's ARN
 * @param request the dictionary of name/value pairings to be sent
 *    as the EVENT payload to the new Lambda function
 */
export declare function buildStepFunctionRequest(arn: IParsedArn, request: IDictionary, name?: string): import("aws-sdk/clients/stepfunctions").StartExecutionInput;
