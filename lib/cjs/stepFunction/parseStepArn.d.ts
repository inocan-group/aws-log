export interface IParsedArn {
    region: string;
    account: string;
    stage: string;
    appName: string;
    fn: string;
}
export declare function parseStepArn(arn: string): IParsedArn;
/**
 * **getEnvironmentVars**
 *
 * Looks for aspects of the ARN in environment variables. Ideally looking for:
 *
 * - AWS_REGION
 * - AWS_ACCOUNT
 * - AWS_STAGE (*or NODE_ENV, ENVIRONMENT*)
 * - SERVICE_NAME (*or APP_NAME*)
 */
export declare function getEnvironmentVars(): {
    region: string;
    account: string;
    stage: string;
    appName: string;
};
