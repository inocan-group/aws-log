import { getCorrelationId, getContext } from "../logger/state";
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
export function buildInvocationRequest(arn, request) {
    const FunctionName = `arn:aws:lambda:${arn.region}:${arn.account}:function:${arn.appName}-${arn.stage}-${arn.fn}`;
    const correlationHeaders = {
        "x-correlation-id": getCorrelationId(),
        "x-calling-function": getContext().functionName,
        "x-calling-request-id": getContext().requestId
    };
    request.headers = request.headers
        ? Object.assign({}, correlationHeaders, request.headers) : correlationHeaders;
    const Payload = JSON.stringify(request);
    return {
        FunctionName,
        Payload,
        LogType: "None",
        InvocationType: "Event"
    };
}
