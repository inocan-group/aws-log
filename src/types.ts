import { IDictionary } from "common-types";

export interface LooseContext extends Partial<IAwsLogContext> {
  [key: string]: any;
};

export interface IAwsLog extends IDictionary {
  /** a unique ID for a graph/fan of related function executions */
  "@x-correlation-id": string;
  "@severity": string;
  message: string;
  context?: LooseContext;
}

export interface IAwsLogContext {
  logger: "aws-shipper";
  /** the REST command (e.g., GET, PUT, POST, DELETE) */
  httpMethod: string;
  /** the path to the endpoint called */
  path: string;
  /** API-Gateway query parameters; aka, the name-value pairs after the "&" character */
  queryStringParameters?: string;
  /** API-Gateway parameters passed in via the path itself */
  pathParameters?: string;
  /** API-Gateway request body */
  body: string;
  /** the callers user agent string */
  userAgent?: string;
  /** the country which the request hit Cloudfront */
  country?: string;
  /** the function handler which led to this log message */
  functionName: string;
  /** the function version used */
  functionVersion: string;
  /** the AWS requestId which is unique for this function call */
  requestId: string;
}
