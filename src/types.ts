import { IDictionary, numberAsString } from "common-types";

export interface IAwsLog extends IDictionary {
  /** a unique ID for a graph/fan of related function executions */
  "@x-correlation-id": string;
  "@severity": LogLevel;
  /** the text/unstructured description that is passed in as first param of all log levels */
  "@message": string;
  context: IAwsLogContext;
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
    "x-correlation-id": string;
    "x-calling-function": string;
    "x-calling-request-id": string;
  };
}

export interface IAwsLogWithoutContext extends Partial<IAwsLog> {
  "@message": string;
}

export enum LogLevel {
  debug,
  info,
  warn,
  error
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
  stage?: "dev" | "prod" | "stage" | "test";
  awsRegion?: string;
}
