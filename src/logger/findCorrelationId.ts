import { IDictionary, IHttpRequestHeaders } from "common-types";

import { ILambdaEvent } from "./lambda";

/**
 * Looks in various places to find an existing `correlationId`
 */
export function findCorrelationId(
  event: ILambdaEvent,
  headers?: IHttpRequestHeaders
): string | false {
  const lookIn = [
    "X-Correlation-Id",
    "x-correlation-id",
    "@x-correlation-id",
    "@X-Correlation-Id"
  ];

  if (headers) {
    let result: false | string = false;
    let idx = 0;
    while (!result && idx <= lookIn.length - 1) {
      if (headers[lookIn[idx]]) {
        result = headers[lookIn[idx]] as string;
      }
      idx++;
    }

    if (result) {
      return result;
    }
  }

  if (typeof event === "object" && event && event.headers) {
    let result: false | string = false;
    let idx = 0;
    while (!result && idx <= lookIn.length - 1) {
      if (event.headers[lookIn[idx]]) {
        result = event.headers[lookIn[idx]] as string;
      }
      idx++;
    }

    if (result) {
      return result;
    }
  }

  if (typeof event === "object") {
    let result: false | string = false;
    let idx = 0;
    while (!result && idx <= lookIn.length - 1) {
      if ((event as IDictionary)[lookIn[idx]]) {
        result = (event as IDictionary)[lookIn[idx]] as string;
      }
      idx++;
    }

    if (result) {
      return result;
    }
  }

  return false;
}
