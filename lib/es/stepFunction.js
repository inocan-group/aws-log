import { buildStepFunctionRequest } from "./stepFunction/buildStepFunctionRequest";
import { parseStepArn } from "./stepFunction/parseStepArn";
import { logger } from "./logger";
export async function stepFunction(stepArn, request, options = {}) {
    const stepFn = new (await import("aws-sdk")).StepFunctions();
    return new Promise((resolve, reject) => {
        stepFn.startExecution(buildStepFunctionRequest(parseStepArn(stepArn), request), (err, data) => {
            if (err) {
                const log = logger()
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
