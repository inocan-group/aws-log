import { ensureFunctionName } from "../invoke/ensureFunctionName";
// TODO: look into making the two arn parsing functions into one
export function parseStepArn(arn) {
    const isFullyQualified = arn.slice(0, 3) === "arn" ? true : false;
    return isFullyQualified
        ? parseFullyQualifiedString(arn)
        : parsePartiallyQualifiedString(arn);
}
function parseFullyQualifiedString(arn) {
    const [_, region, account, remain] = arn.match(/arn:aws:states:([\w-].*):([0-9].*):stateMachine:(.*)/);
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
function parsePartiallyQualifiedString(fn) {
    let output = Object.assign(Object.assign({}, getEnvironmentVars()), { fn: ensureFunctionName(fn.split(":").pop()) });
    ["region", "account", "stage", "appName"].forEach((section) => {
        if (!output[section]) {
            output[section] = seek(section, fn);
            if (!output[section]) {
                parsingError(section);
            }
        }
    });
    return output;
}
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
export function getEnvironmentVars() {
    const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || process.env.REGION;
    const account = process.env.AWS_ACCOUNT || process.env.AWS_ACCOUNT_ID;
    const stage = process.env.AWS_STAGE || process.env.ENVIRONMENT || process.env.NODE_ENV;
    const appName = process.env.SERVICE_NAME || process.env.APP_NAME;
    return { region, account, stage, appName };
}
const patterns = {
    account: /^[0-9]+$/,
    region: /\s+-\s+-[0-9]/,
    stage: /(prod|stage|test|dev)/,
    appName: /abc/
};
function seek(pattern, partialArn) {
    const parts = partialArn.split(":");
    parts.forEach(part => {
        const regEx = patterns[pattern];
        if (regEx.test(part)) {
            return part;
        }
    });
    return "";
}
function parsingError(section) {
    const e = new Error(`Problem finding "${section}" in the partial ARN which was passed in!`);
    e.name = "ArnParsingError";
    throw e;
}
