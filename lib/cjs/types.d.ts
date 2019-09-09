import { IDictionary, numberAsString } from "common-types";
export declare type IAwsLogLevel = "none" | "all"
/**
 * sampling rate is evaluated once when this session is started
 * and then remains either on or off. This sampling has the benefit
 * that when the sampling is _on_ it is on for the whole function execution
 * (although NOT cross function).
 */
 | "sample-by-session"
/**
 * the sampling rate is queried for each log entry/event
 */
 | "sample-by-event";
export interface IAwsLogConfig {
    debug: IAwsLogLevel;
    info: IAwsLogLevel;
    warn: IAwsLogLevel;
    error: IAwsLogLevel;
    /**
     * If you are using sampling for any of the log levels
     * then you must indicate the percentage of log events
     * which will be passed through to AWS CloudWatch. By
     * default the sample rate will be set to 0.1 (aka, 10%)
     */
    sampleRate?: number;
}
export interface IAwsLog extends IDictionary {
    /** a unique ID for a graph/fan of related function executions */
    correlationId: string;
    /**
     * **severity**
     *
     * the "log-level" represented numerically where:
     *
     *   0: debug
     *   1: info
     *   2: warn
     *   3: error
     *
     * numeric representation provides a better basis for conditional logic
     */
    severity: LogLevel;
    /** The environmental stage that the function was executing under */
    stage: IEnvStage;
    /** the text/unstructured description that is passed in as first param of all log levels */
    message: string;
    /** global context information */
    context?: IAwsLogContext;
    /** the payload of the structure content from the message */
    payload?: IDictionary;
    /** local context set in aws-log */
    local?: IDictionary;
}
/**
 * **IAwsInvocationContext**
 *
 * When you use the `invoke` or `stepFunction` API's you are calling another
 * function and _of course_ get to state what "Request" object you will be
 * sending in but in addition to this information calling these API's will
 * add these properties automatically for you.
 */
export interface IAwsInvocationContext {
    headers: {
        "X-Correlation-Id": string;
        "x-calling-function": string;
        "x-calling-request-id": string;
    };
}
export interface IAwsLogWithoutContext extends Partial<IAwsLog> {
    message: string;
}
export declare type IEnvStage = "dev" | "test" | "stage" | "prod" | "unknown" | "all";
export declare enum LogLevel {
    debug = 0,
    info = 1,
    warn = 2,
    error = 3
}
export interface IAwsLogContext extends IDictionary {
    logger: "aws-log";
    /** the REST command (e.g., GET, PUT, POST, DELETE) */
    httpMethod?: string;
    /** the path to the endpoint called */
    path?: string;
    /** API-Gateway query parameters; aka, the name-value pairs after the "&" character */
    queryStringParameters?: string;
    /** API-Gateway parameters passed in via the path itself */
    pathParameters?: string;
    /** API-Gateway request body */
    body?: string;
    /** the callers user agent string */
    userAgent?: string;
    /** the country which the request hit Cloudfront */
    country?: string;
    /** the function handler which led to this log message */
    functionName?: string;
    /** the function version used */
    functionVersion?: string;
    /** the AWS requestId which is unique for this function call */
    awsRequestId?: string;
    /** the full ARN name for the given function  */
    invokedFunctionArn?: string;
    /** the structured path to this functions logging group */
    logGroupName?: string;
    logStreamName?: string;
    /**
     * boolean flag indicating whether function should wait for the event
     * loop to conclude before exiting */
    callbackWaitsForEmptyEventLoop?: boolean;
    memoryLimitInMB?: numberAsString;
    awsStage?: "dev" | "prod" | "stage" | "test";
    awsRegion?: string;
}
