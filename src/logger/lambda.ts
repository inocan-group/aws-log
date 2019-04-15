import {
  IDictionary,
  IAWSLambdaProxyIntegrationRequest,
  IAWSLambaContext
} from "common-types";
import { setCorrelationId, setContext, setLocalContext } from "./state";
import { findCorrelationId, createCorrelationId } from "./correlationId";
import { loggingApi } from "./logging-api";

export type ILambdaEvent<T = IDictionary> = IAWSLambdaProxyIntegrationRequest | T;

export function lambda(
  event: ILambdaEvent,
  ctx: IAWSLambaContext,
  options: IDictionary = {}
) {
  setCorrelationId(findCorrelationId(event, ctx) || createCorrelationId());
  setContext(ctx);
  setLocalContext(options);

  return loggingApi;
}
