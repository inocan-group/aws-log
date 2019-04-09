import { ILambdaEvent } from "./lambda";
import { IAWSLambaContext } from "common-types";

export function createCorrelationId(): string {
  return (
    "c-" +
    Math.random()
      .toString(36)
      .substr(2, 16)
  );
}

/**
 * Looks in various places to find an existing correlationId
 */
export function findCorrelationId(
  event: ILambdaEvent,
  context: IAWSLambaContext
): string | false {
  return event.headers && event.headers["@x-correlation-id"]
    ? event.headers["@x-correlation-id"]
    : event.headers && event.headers["x-correlation-id"]
    ? event.headers && event.headers["x-correlation-id"]
    : false;
}
