export interface IParsedArn {
    region: string;
    account: string;
    stage: string;
    appName: string;
    fn: string;
}
export declare function parseArn(arn: string): IParsedArn;
/**
 * Looks for aspects of the ARN in environment variables
 */
export declare function getEnvironmentVars(): {
    region: string;
    account: string;
    stage: string;
    appName: string;
};
