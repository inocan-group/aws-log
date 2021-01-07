"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stepFunction = void 0;
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
