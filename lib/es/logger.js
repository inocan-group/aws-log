import { loggingApi } from "./logger/logging-api";
import { initSeverity, setCorrelationId, clearState, contextApi } from "./logger/state";
import { sessionSample } from "./shared/sessionSample";
import { createCorrelationId } from "./logger/createCorrelationId";
export const logLevelLookup = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
};
export let config;
const defaultConfigs = {
    dev: {
        debug: "all",
        info: "all",
        warn: "all",
        error: "all"
    },
    test: {
        debug: "all",
        info: "all",
        warn: "all",
        error: "all"
    },
    stage: {
        debug: "none",
        info: "sample-by-session",
        warn: "all",
        error: "all"
    },
    prod: {
        debug: "none",
        info: "sample-by-session",
        warn: "all",
        error: "all"
    }
};
export function logger(requestedConfig) {
    const environment = process.env.AWS_STAGE || "dev";
    const defaultConfig = defaultConfigs[environment];
    if (requestedConfig) {
        config = sessionSample(Object.assign(Object.assign({}, defaultConfig), requestedConfig));
    }
    else if (config === undefined) {
        config = defaultConfig;
    }
    clearState();
    initSeverity();
    setCorrelationId(createCorrelationId());
    return Object.assign(Object.assign({}, loggingApi), contextApi);
}
