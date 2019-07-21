import { SSM } from "aws-sdk";
import { CredentialsOptions } from "aws-sdk/lib/credentials";
import { IServerlessConfig } from "common-types";
export declare function getSSM(): Promise<SSM>;
export declare function getAwsCredentials(profile: string): CredentialsOptions;
export declare function getParameter(Name: string): Promise<SSM.Parameter>;
export declare function setParameter(Name: string, Value: string, options?: Partial<SSM.PutParameterRequest>): Promise<{}>;
export declare function listParameters(options?: SSM.DescribeParametersRequest): Promise<SSM.ParameterMetadata[]>;
export declare function removeParameter(Name: string, options?: Partial<SSM.DeleteParameterRequest>): Promise<SSM.DeleteParameterResult>;
/** tests whether the running function is running withing Lambda */
export declare function isLambda(): boolean;
export declare function getServerlessConfig(): Promise<IServerlessConfig>;
