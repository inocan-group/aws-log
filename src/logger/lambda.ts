import {
  IDictionary,
  IAWSLambdaProxyIntegrationRequest,
  IAWSLambaContext
} from "common-types";
import {
  setCorrelationId,
  setContext,
  setLocalContext,
  findCorrelationId,
  createCorrelationId,
  loggingApi
} from "./index";

export type ILambdaEvent<T = IDictionary> =
  | IAWSLambdaProxyIntegrationRequest
  | T;

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
