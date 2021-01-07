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
exports.invoke = void 0;
const parseArn_1 = require("./invoke/parseArn");
const logger_1 = require("./logger");
const buildInvocationRequest_1 = require("./invoke/buildInvocationRequest");
/**
 * **invoke**
 *
 * Invokes another Lambda function while passing the `correlation-id` along
 * to the next function for logging purposes.
 */
async function invoke(
/**
 * A reference to the serverless function you are calling; can be a
 * fully qualified AWS arn but if your execution environment has the
 * appropriate ENV variables set then only the actual handlers name
 * is needed.
 *
 * ENV variables that will be used to _resolve_ the full ARN include:
 * - AWS_REGION
 * - AWS_ACCOUNT
 * - AWS_STAGE (*or alternatively NODE_ENV, ENVIRONMENT*)
 * - SERVICE_NAME (*or alternatively APP_NAME*)
 */
fnArn, 
/** the request object to be passed to the calling function */
request, 
/**
 * The request headers to send along with the request
 */
headers) {
    // TODO: come back to this idea of "headers" here
    const lambda = new (await Promise.resolve().then(() => __importStar(require("aws-sdk")))).Lambda();
    return new Promise((resolve, reject) => {
        lambda.invoke(buildInvocationRequest_1.buildInvocationRequest(parseArn_1.parseArn(fnArn), request), (err, data) => {
            if (err) {
                const { error } = logger_1.logger().reloadContext();
                const e = new Error(err.message);
                e.stack = err.stack;
                e.name = "InvocationError";
                error(e, err);
                throw e;
            }
            resolve(data);
        });
    });
}
exports.invoke = invoke;
