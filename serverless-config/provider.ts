// tslint:disable:no-invalid-template-strings
import { IServerlessProvider, IServerlessIAMRole } from "common-types";

const ACCOUNT_ID = "7419-7656-9717";
const REGION = "us-west-1";

const iamRoleStatements: IServerlessIAMRole[] = [
  {
    // PERMISSIONS FOR X-RAY TRACING
    Effect: "Allow",
    Action: ["xray:PutTraceSegments", "xray:PutTelemetryRecords"],
    Resource: ["*"]
  },
  {
    Effect: "Allow",
    Action: ["ssm:GetParameter", "ssm:GetParametersByPath"],
    Resource: [`arn:aws:ssm:${REGION}*`]
  },
  {
    // PERMISSIONS FOR STEP FUNCTIONS
    Effect: "Allow",
    Action: [
      "states:ListStateMachines",
      "states:CreateActivity",
      "states:StartExecution",
      "states:ListExecutions",
      "states:DescribeExecution",
      "states:DescribeStateMachineForExecution",
      "states:GetExecutionHistory"
    ],
    Resource: [
      `arn:aws:states:${REGION}:${ACCOUNT_ID}:stateMachine:*`,
      `arn:aws:states:${REGION}:${ACCOUNT_ID}:execution:*:*`
    ]
  }
];

const provider: IServerlessProvider = {
  name: "aws",
  runtime: "nodejs8.10",
  stage: "prod",
  region: REGION,
  environment: "${file(serverless-config/env.yml):${self:custom.stage}}",
  iamRoleStatements
};

export default provider;
