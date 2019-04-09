import { IDictionary } from "common-types";
import { IParsedArn } from "./parseStepArn";
import { getCorrelationId, getContext } from "../logger/state";
import { StepFunctions } from "aws-sdk";

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
export function buildStepFunctionRequest(
  arn: IParsedArn,
  request: IDictionary,
  name?: string
) {
  const stateMachineArn = `arn:aws:states:${arn.region}:${
    arn.account
  }:function:${arn.appName}-${arn.fn}`;

  let input: string;
  if (request.headers) {
    request.headers["x-correlation-id"] = getCorrelationId();
    request.headers["x-calling-function"] = getContext().functionName;
    request.headers["x-calling-request-id"] = getContext().requestId;
    input = JSON.stringify(request);
  } else {
    input = JSON.stringify({
      ...request,
      ...{
        headers: {
          "x-correlation-id": getCorrelationId(),
          "x-calling-function": getContext().functionName,
          "x-calling-request-id": getContext().requestId
        }
      }
    });
  }

  // if(!name) {
  //   name = 
  // }

  return {
    stateMachineArn,
    input,
    name
  } as StepFunctions.StartExecutionInput;
}
