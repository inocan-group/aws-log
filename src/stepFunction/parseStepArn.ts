import { IDictionary } from "common-types";
import { ensureFunctionName } from "../invoke/ensureFunctionName";

export interface IParsedArn {
  region: string;
  account: string;
  stage: string;
  appName: string;
  fn: string;
}

// TODO: look into making the two arn parsing functions into one

export function parseStepArn(arn: string): IParsedArn {
  const isFullyQualified = arn.slice(0, 3) === "arn" ? true : false;

  return isFullyQualified
    ? parseFullyQualifiedString(arn)
    : parsePartiallyQualifiedString(arn);
}

function parseFullyQualifiedString(arn: string): IParsedArn {
  const [_, region, account, remain] = arn.match(
    /arn:aws:states:([\w-].*):([0-9].*):stateMachine:(.*)/
  );
  const parts = remain.split("-");
  const fn = parts[parts.length - 1];
  const stage = parts[parts.length - 2];
  const appName = parts.slice(0, parts.length - 2).join("-");

  return {
    region,
    account,
    fn: ensureFunctionName(fn),
    stage,
    appName
  };
}

/**
 * assumes the input parameter is just the function name
 * and the rest of the ARN can be deduced by environment
 * variables.
 */
function parsePartiallyQualifiedString(fn: string): IParsedArn {
  let output: IParsedArn = {
    ...getEnvironmentVars(),
    ...{ fn: ensureFunctionName(fn.split(":").pop()) }
  };

  ["region", "account", "stage", "appName"].forEach(
    (section: keyof IParsedArn) => {
      if (!output[section]) {
        output[section] = seek(section, fn);
        if (!output[section]) {
          parsingError(section);
        }
      }
    }
  );

  return output;
}

/**
 * Looks for aspects of the ARN in environment variables
 */
export function getEnvironmentVars() {
  const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;
  const account = process.env.AWS_ACCOUNT;
  const stage =
    process.env.ENVIRONMENT || process.env.STAGE || process.env.AWS_STAGE;
  const appName = process.env.APP_NAME;

  return { region, account, stage, appName };
}

const patterns: IDictionary<RegExp> = {
  account: /^[0-9]+$/,
  region: /\s+-\s+-[0-9]/,
  stage: /(prod|stage|test|dev)/,
  appName: /abc/
};

function seek(pattern: keyof typeof patterns, partialArn: string) {
  const parts = partialArn.split(":");

  parts.forEach(part => {
    const regEx = patterns[pattern];
    if (regEx.test(part)) {
      return part;
    }
  });

  return "";
}

function parsingError(section: keyof typeof patterns) {
  const e = new Error(
    `Problem finding "${section}" in the partial ARN which was passed in!`
  );
  e.name = "ArnParsingError";
  throw e;
}
