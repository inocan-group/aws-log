import { setCorrelationId, setContext, setLocalContext, findCorrelationId, createCorrelationId, loggingApi } from "./index";
export function lambda(event, ctx, options = {}) {
    setCorrelationId(findCorrelationId(event, ctx) || createCorrelationId());
    setContext(ctx);
    setLocalContext(options);
    return loggingApi;
}
