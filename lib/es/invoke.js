import { parseArn } from "./invoke/parseArn";
import { logger } from "./logger";
import { buildInvocationRequest } from "./invoke/buildInvocationRequest";
/**
 * **invoke**
 *
 * Invokes another Lambda function while passing the `correlation-id` along
 * to the next function for logging purposes.
 */
export async function invoke(
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
    const lambda = new (await import("aws-sdk")).Lambda();
    return new Promise((resolve, reject) => {
        lambda.invoke(buildInvocationRequest(parseArn(fnArn), request), (err, data) => {
            if (err) {
                const { error } = logger().reloadContext();
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
