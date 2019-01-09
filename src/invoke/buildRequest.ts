import { IDictionary } from "common-types";
import { IParsedArn } from "./parseArn";
import { getCorrelationId } from "../logger/state";
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
export function buildRequest(arn: IParsedArn, request: IDictionary, ) {
  const FunctionName = `arn:aws:lambda:${arn.region}:${arn.account}:function:${arn.appName}-${arn.fn}`;
  let Payload: string;
  if (request.headers) {
    request.headers["x-correlation-id"] = getCorrelationId();
    Payload = JSON.stringify(request);
  } else {
    Payload = JSON.stringify({
      ...request,
      ...{headers: {"x-correlation-id": getCorrelationId()}}
    });
  }

  return {
    FunctionName,
    Payload,
    LogType: "None",
    InvocationType: "Event"
  } as Lambda.InvocationRequest
}
