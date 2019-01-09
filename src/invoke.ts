import { Lambda } from "aws-sdk";
import { IDictionary } from "common-types";
import { parseArn } from "./invoke/parseArn";
import { logger } from "./logger";
import { buildRequest } from "./invoke/buildRequest";

const lambda = new Lambda();

export async function invoke(fnArn: string, request: IDictionary, options: IDictionary = {}) {

  return new Promise((resolve, reject) => {

    lambda.invoke(
      buildRequest(parseArn(fnArn), request),
      (err, data) => {
        if(err) {
          const {error} = logger().reloadContext();
          const e = new Error(err.message);
          e.stack = err.stack;
          e.name = "InvocationError";
          error(e, err);
          throw e;
        }
        resolve(data);
      }
    );

  });
}
