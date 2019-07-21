import { IAwsLogConfig } from "../types";
/**
 * **sessionConfig**
 *
 * converts all configs set to `sample-by-session` to either
 * `all` or `none` based on a sampling.
 *
 * @param config logging config
 */
export declare function sessionSample(config: IAwsLogConfig): IAwsLogConfig;
