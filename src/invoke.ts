import { Lambda } from "aws-sdk";
import { IDictionary } from "common-types";
import { parseArn } from "./invoke/parseArn";
import { logger } from "./logger";
import { buildInvocationRequest } from "./invoke/buildInvocationRequest";

const lambda = new Lambda();

export async function invoke<T = IDictionary>(
  /**
   * A reference to the serverless function you are calling; can be a
   * fully qualified AWS arn but if your execution environment has the
   * appropriate ENV variables set then only the actual handlers name
   * is needed.
   *
   * ENV variables that will be used to _resolve_ the full ARN include:
   * - AWS_REGION
   * - AWS_ACCOUNT
   * - AWS_STAGE
   */
  fnArn: string,
  /** the request object to be passed to the calling function */
  request: T,
  options: IDictionary = {}
) {
  return new Promise((resolve, reject) => {
    lambda.invoke(buildInvocationRequest(parseArn(fnArn), request), (err, data) => {
      if (err) {
        const { error } = logger().reloadContext();
        const e = new Error(err.message);
        e.stack = err.stack;
        e.name = "InvocationError";
        error(e, err);
        throw e;
      }
      resolve(data);
    });
  });
}
