import { setCorrelationId, setContext, setLocalContext } from "./state";
import { findCorrelationId, createCorrelationId } from "./correlationId";
import { loggingApi } from "./logging-api";
export function lambda(event, ctx, options = {}) {
    setCorrelationId(findCorrelationId(event, ctx) || createCorrelationId());
    setContext(ctx);
    setLocalContext(options);
    return loggingApi;
}
