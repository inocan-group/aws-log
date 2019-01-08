import { IDictionary } from "common-types";
import { getSeverity, getContext, getRootProperties } from "./state";
import { LogLevel, IAwsLog } from "../types";

/**
 * If the context object passed in contains a "context" property
 * move it out of the way so it doesn't collide with
 */
function avoidContextCollision(options: IDictionary) {
  if (options.context) {
    options["_context"] = options.context;
    delete options.context;
  }

  return options;
}

/**
 * stdout
 *
 * Takes a localized logging message and adds "context" and all
 * "root level props" (aka, those starting with "@") to the message
 * before logging it to StdOut.
 *
 * @param hash the hash/dictionary coming from one of the logging
 * functions; it should include a "message", optional hash values
 */
export function stdout(hash: Partial<IAwsLog> & { message: string }) {
  const context = getContext();
  const rootProps = getRootProperties();
  const output: IAwsLog = { ...hash, ...rootProps, ...{ context } };

  if (process.env.LOG_TESTING) {
    return output;
  } else {
    console.log(JSON.stringify(output, null, 2));
  }
}

export function debug(message: string, params: IDictionary = {}) {
  if (getSeverity() === LogLevel.debug) {
    return stdout({
      ...{ message },
      ...avoidContextCollision(params),
    });
  }
}

export function info(message: string, params: IDictionary = {}) {

  if (getSeverity() <= LogLevel.info) {
    return stdout({
      ...{ message },
      ...avoidContextCollision(params)
    });
  }
}

export function warn(message: string, params: IDictionary = {}) {
  if (getSeverity() <= LogLevel.warn) {
    return stdout({
      ...{ message },
      ...avoidContextCollision(params)
    });
  }
}

function error(
  msgOrError: string | IDictionary,
  paramsOrErr?: IDictionary,
  err?: IDictionary
) {
  const context = getContext();
  // errors are logged at all log levels
}



export const loggingApi = {
  log: info,
  debug,
  info,
  warn,
  error
};
