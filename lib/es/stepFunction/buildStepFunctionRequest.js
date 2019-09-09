import { getCorrelationId, getContext } from "../logger/state";
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
export function buildStepFunctionRequest(arn, request, name) {
    const stateMachineArn = `arn:aws:states:${arn.region}:${arn.account}:function:${arn.appName}-${arn.fn}`;
    let input;
    if (request.headers) {
        request.headers["X-Correlation-Id"] = getCorrelationId();
        request.headers["x-calling-function"] = getContext().functionName;
        request.headers["x-calling-request-id"] = getContext().requestId;
        input = JSON.stringify(request);
    }
    else {
        input = JSON.stringify(Object.assign(Object.assign({}, request), {
            headers: {
                "X-Correlation-Id": getCorrelationId(),
                "x-calling-function": getContext().functionName,
                "x-calling-request-id": getContext().requestId
            }
        }));
    }
    // if(!name) {
    //   name =
    // }
    return {
        stateMachineArn,
        input,
        name
    };
}
