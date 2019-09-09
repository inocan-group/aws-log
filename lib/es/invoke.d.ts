import { IDictionary, IHttpRequestHeaders } from "common-types";
export declare type InvocationResponse = import("aws-sdk").Lambda.InvocationResponse;
/**
 * **invoke**
 *
 * Invokes another Lambda function while passing the `correlation-id` along
 * to the next function for logging purposes.
 */
export declare function invoke<T = IDictionary>(
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
fnArn: string, 
/** the request object to be passed to the calling function */
request: T, 
/**
 * The request headers to send along with the request
 */
headers?: IHttpRequestHeaders): Promise<InvocationResponse>;
