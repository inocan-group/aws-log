import { IAWSLambaContext, isLambdaProxyRequest } from "common-types";

import { ILambdaEvent } from "./lambda";
export type IPossibleCorrelationIds = {
  "X-Correlation-Id"?: string;
  "x-correlation-id"?: string;
  "@x-correlation-id"?: string;
  "@X-Correlation-Id"?: string;
};

export function hasHeadersProperty(
  obj: unknown
): obj is Record<string, unknown> & { headers: IPossibleCorrelationIds } {
  return (
    obj &&
    typeof obj === "object" &&
    Object.keys(obj).includes("headers") &&
    typeof (obj as Record<string, unknown>)?.headers === "object"
  );
}

/**
 * Looks for a Correlation ID in:
 *
 * - AWS Gateway headers (if they exist),
 * - in a `headers` property of the **body** (if it exists)
 */
export function findCorrelationId(
  event: ILambdaEvent,
  ctx: IAWSLambaContext
): string | false {
  const lookIn: Array<keyof IPossibleCorrelationIds> = [
    "X-Correlation-Id",
    "x-correlation-id",
    "@x-correlation-id",
    "@X-Correlation-Id",
  ];

  let result: string | undefined;
  if (hasHeadersProperty(event)) {
    for (const key of lookIn) {
      if (Object.keys(event.headers).includes(key)) {
        result = event.headers?.[key]
          ? (event.headers?.[key] as string)
          : result;
      }
    }
  }

  if (result) {
    return result;
  }

  const body = event?.body 
    ? ((typeof event?.body  === "string")
      ? JSON.parse(event?.body || "") 
      : event?.body)
    : undefined;

  if (hasHeadersProperty(body)) {
    for (const key of lookIn) {
      if (Object.keys(body.headers).includes(key)) {
        result = body.headers?.[key];
      }
    }
  }

  return result ? result : false;
}
