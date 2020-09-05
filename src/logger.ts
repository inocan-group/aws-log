import { IDictionary } from "common-types";
import { loggingApi } from "./logger/logging-api";
import {
  initSeverity,
  setCorrelationId,
  clearState,
  contextApi
} from "./logger/state";
import { IAwsLogConfig } from "./types";
import { sessionSample } from "./shared/sessionSample";
import { createCorrelationId } from "./logger/createCorrelationId";

export const logLevelLookup: IDictionary<number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

export let config: IAwsLogConfig;
const defaultConfigs: IDictionary<IAwsLogConfig> = {
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

export function logger(requestedConfig?: Partial<IAwsLogConfig>) {
  const environment = process.env.AWS_STAGE || "dev";
  const defaultConfig = environment in defaultConfigs ? defaultConfigs[environment] : defaultConfigs["dev"];
  if (requestedConfig) {
    config = sessionSample({ ...defaultConfig, ...requestedConfig });
  } else {
    config = defaultConfig;
  }
  clearState();
  initSeverity();
  setCorrelationId(createCorrelationId());

  return { ...loggingApi, ...contextApi };
}
