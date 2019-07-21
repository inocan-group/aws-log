"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const buildStepFunctionRequest_1 = require("./stepFunction/buildStepFunctionRequest");
const parseStepArn_1 = require("./stepFunction/parseStepArn");
const logger_1 = require("./logger");
async function stepFunction(stepArn, request, options = {}) {
    const stepFn = new (await Promise.resolve().then(() => __importStar(require("aws-sdk")))).StepFunctions();
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
