"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const state_1 = require("../logger/state");
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
function buildInvocationRequest(arn, request) {
    const FunctionName = `arn:aws:lambda:${arn.region}:${arn.account}:function:${arn.appName}-${arn.stage}-${arn.fn}`;
    const correlationHeaders = {
        "X-Correlation-Id": state_1.getCorrelationId(),
        "x-calling-function": state_1.getContext().functionName,
        "x-calling-request-id": state_1.getContext().requestId
    };
    request.headers = request.headers
        ? Object.assign(Object.assign({}, correlationHeaders), request.headers) : correlationHeaders;
    const Payload = JSON.stringify(request);
    return {
        FunctionName,
        Payload,
        LogType: "None",
        InvocationType: "Event"
    };
}
exports.buildInvocationRequest = buildInvocationRequest;
