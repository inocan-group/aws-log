import { SSM } from "aws-sdk";
import * as fs from "fs";
import { CredentialsOptions } from "aws-sdk/lib/credentials";
import { IServerlessConfig } from "common-types";
import { readFileSync } from "fs";

export async function getSSM() {
  let ssm;
  if (!isLambda()) {
    const config = await getServerlessConfig();
    const profile = config.provider.profile || process.env.AWS_PROFILE || "default";
    const region = config.provider.region || "us-west-2" || process.env.AWS_REGION;
    const credentials = getAwsCredentials(profile);
    ssm = new SSM({ region, apiVersion: "2014-11-06", credentials });
  } else {
    ssm = new SSM({ apiVersion: "2014-11-06" });
  }
  return ssm;
}

export function getAwsCredentials(profile: string) {
  const homedir = require("os").homedir();
  let credentials = fs
    .readFileSync(`${homedir}/.aws/credentials`, { encoding: "utf-8" })
    .split("[")
    .map(i => i.split("\n"))
    .filter(i => i[0].includes(profile))
    .pop()
    .slice(1, 3);

  const credentialsObj: CredentialsOptions = {
    accessKeyId: "",
    secretAccessKey: ""
  };
  credentials.map(i => {
    if (i.includes("aws_access_key_id")) {
      credentialsObj.accessKeyId = i.replace(/.*aws_access_key_id\s*=\s*/, "");
    }
    if (i.includes("aws_secret_access_key")) {
      credentialsObj.secretAccessKey = i.replace(/.*aws_secret_access_key\s*=\s*/, "");
    }
  });

  return credentialsObj;
}

export async function getParameter(Name: string) {
  const ssm = await getSSM();

  return new Promise((resolve, reject) => {
    ssm.getParameter({ Name, WithDecryption: true }, (err, data) => {
      if (err) {
        const e = new Error(`Problem in getting the "${Name}" SSM parameter: ${err.message}`);
        reject(e);
      } else {
        resolve(data.Parameter);
      }
    });
  }) as Promise<SSM.Parameter>;
}

export async function setParameter(
  Name: string,
  Value: string,
  options: Partial<SSM.PutParameterRequest> = { Type: "SecureString", Overwrite: false }
) {
  const ssm = await getSSM();
  return new Promise((resolve, reject) => {
    ssm.putParameter({ Name, Value, ...options } as SSM.PutParameterRequest, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.Version);
      }
    });
  });
}

export async function listParameters(options: SSM.DescribeParametersRequest = {}) {
  const ssm = await getSSM();
  return new Promise((resolve, reject) => {
    const options: SSM.DescribeParametersRequest = {};
    ssm.describeParameters(options, (err, data) => {
      if (err) {
        reject(err);
      } else {
        const list: SSM.ParameterMetadata[] = data.Parameters;
        resolve(list);
      }
    });
  }) as Promise<SSM.ParameterMetadata[]>;
}

export async function removeParameter(
  Name: string,
  options: Partial<SSM.DeleteParameterRequest> = {}
) {
  const ssm = await getSSM();
  const request: SSM.DeleteParameterRequest = { Name, ...options };

  return new Promise((resolve, reject) => {
    ssm.deleteParameter(request, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  }) as Promise<SSM.DeleteParameterResult>;
}

/** tests whether the running function is running withing Lambda */
export function isLambda() {
  return !!((process.env.LAMBDA_TASK_ROOT && process.env.AWS_EXECUTION_ENV) || false);
}

export async function getServerlessConfig() {
  const yaml = await import("js-yaml");
  const config: IServerlessConfig = yaml.safeLoad(
    readFileSync(`${process.env.PWD}/serverless.yml`, { encoding: "utf-8" })
  );

  return config;
}
