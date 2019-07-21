"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = require("aws-sdk");
const buildStepFunctionRequest_1 = require("./stepFunction/buildStepFunctionRequest");
const parseStepArn_1 = require("./stepFunction/parseStepArn");
const logger_1 = require("./logger");
const stepFn = new aws_sdk_1.StepFunctions();
async function stepFunction(stepArn, request, options = {}) {
    return new Promise((resolve, reject) => {
        stepFn.startExecution(buildStepFunctionRequest_1.buildStepFunctionRequest(parseStepArn_1.parseStepArn(stepArn), request), (err, data) => {
            if (err) {
                const log = logger_1.logger()
                    .reloadContext()
                    .addToLocalContext({ workflow: "aws-log/stepFunction" });
                const e = new Error(err.message);
                e.stack = err.stack;
                e.name = "InvocationError";
                log.error(`Problem starting the step function '${stepArn}'`, e);
                throw e;
            }
            resolve(data);
        });
    });
}
exports.stepFunction = stepFunction;
