import {
  IDictionary,
  IAWSLambdaProxyIntegrationRequest,
  IAWSLambaContext,
} from "common-types";
import { setCorrelationId, setContext, setLocalContext } from "./state";
import { findCorrelationId } from "./findCorrelationId";
import { createCorrelationId } from "./createCorrelationId";
import { ILoggerApi, loggingApi } from "./logging-api";

export type ILambdaEvent<T = IDictionary> =
  | IAWSLambdaProxyIntegrationRequest
  | T;

export function lambda(
  event: ILambdaEvent,
  ctx: IAWSLambaContext,
  options: IDictionary = {}
): ILoggerApi {
  setCorrelationId(findCorrelationId(event, ctx) || createCorrelationId());
  setContext(ctx);
  setLocalContext(options);

  return loggingApi;
}
