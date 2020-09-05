// tslint:disable:no-implicit-dependencies
import * as chai from "chai";
import { logger } from "../src/logger";
import { getState } from "../src/logger/state";
import { LogLevel } from "../src/types";
import { IDictionary, IAWSLambaContext } from "common-types";
import { getContext } from "../src/logger/state";

const expect = chai.expect;
process.env.LOG_LEVEL = "";

const lambdaEvent: IDictionary = {
  foo: 1,
  bar: 2,
  headers: {
    "@x-correlation-id": "1234"
  }
};
const lambdaContext: IAWSLambaContext = {
  functionName: "foobar",
  functionVersion: "1.0",
  invokedFunctionArn:
    "arn:aws:lambda:us-east-1:845955389040:function:abc-prod-fn",
  memoryLimitInMB: "512",
  awsRequestId: "rid1234",
  logGroupName: "log-group",
  logStreamName: "log-stream"
};

describe("Logger Basics", () => {
  before(() => {
    process.env.LOG_TESTING = "true";
  });
  it("logger() provides expected API", () => {
    const api = logger();
    // Logging functions
    testLoggingApi(api);
    // context setting
    expect(api).to.have.property("context");
    expect(api).to.have.property("lambda");
  });
  it("Initialization without context() works as expected", () => {
    const api = logger();
    const config = getState();
    expect(config.correlationId).is.not.equal(undefined);
    expect(config.severity).is.equal(LogLevel.info);
    expect(config.context).is.an("object");
    expect(Object.keys(config.context)).has.lengthOf(1);
    expect(config.context.logger).to.equal("aws-log");
  });
  it("Initialization with context() works as expected", () => {
    // process.env.LOG_LEVEL="info";
    const api = logger().context({ foo: 1, bar: 2 });

    testLoggingApi(api);
    missingContextApi(api);

    const config = getState();

    expect(config.correlationId).is.not.equal(undefined);
    expect(config.severity).is.equal(LogLevel.info);
    expect(config.context).to.be.an("object");
    expect(config.context.foo).to.equal(1);
    expect(config.context.bar).to.equal(2);
    expect(config.context.logger).to.equal("aws-log");
  });

  it("Initialization with lambda() works as expected", () => {
    const api = logger().lambda(lambdaEvent, lambdaContext);

    testLoggingApi(api);
    missingContextApi(api);
    const config = getState();

    expect(config.context).to.be.an("object");
    expect(config.context.functionName).to.equal(lambdaContext.functionName);
    expect(config.context.logStreamName).to.equal(lambdaContext.logStreamName);
    expect(config.correlationId).is.equal(
      lambdaEvent.headers["@x-correlation-id"]
    );
  });

  it("Initialization with lambda(), using additional context works as expected", () => {
    const api = logger().lambda(lambdaEvent, lambdaContext, {
      foo: 1,
      bar: 2,
      context: "conflict"
    });
    const config = getState();
    expect(config.context).to.be.an("object");
    expect(config.context.functionName).to.equal(lambdaContext.functionName);
    expect(config.context.logStreamName).to.equal(lambdaContext.logStreamName);
    expect(config.localContext.foo).to.equal(1);
    expect(config.localContext.bar).to.equal(2);
    expect(config.localContext.context).to.equal("conflict"); // will become a conflict when logged
    expect(config.correlationId).is.equal(
      lambdaEvent.headers["@x-correlation-id"]
    );
  });

  it("nothing logged when logging level is too low", () => {
    process.env.LOG_TESTING = "true";
    let { debug, info, warn, error } = logger({
      debug: "none",
      info: "none",
      warn: "all",
      error: "all"
    });
    expect(debug("testing")).to.equal(undefined);
    expect(info("testing")).to.equal(undefined);
    expect(warn("testing"))
      .to.not.equal(undefined)
      .and.to.be.a("string");

    expect(error("testing"))
      .to.not.equal(undefined)
      .and.to.be.a("string");

    process.env.LOG_TESTING = "";
  });

  it("before reloadContext() context is empty minus env-based context", () => {
    process.env.LOG_LEVEL = String(LogLevel.info);
    logger().lambda(lambdaEvent, lambdaContext); // set context
    logger(); // re-enter but with no context
    const context = getContext();
    expect(context.functionName).to.equal(undefined);
    expect(context.functionVersion).to.equal(undefined);
  });

  it("after reloadContext() context is returned", () => {
    process.env.LOG_LEVEL = String(LogLevel.info);
    logger().lambda(lambdaEvent, lambdaContext); // set context
    logger().reloadContext();
    const context = getContext();

    expect(context.functionName).to.equal(lambdaContext.functionName);
    expect(context.functionVersion).to.equal(lambdaContext.functionVersion);
  });

  it("Adding localContext later is additive and shows in logging", () => {
    process.env.AWS_STAGE = "dev";
    const log = logger().lambda(lambdaEvent, lambdaContext, { baz: "test" }); // set context
    log.addToLocalContext({ foo: "bar" });
    const response = log.info("test message", { p1: 1, p2: 2 });

    expect(response.local.foo).to.equal("bar");
    expect(response.local.baz).to.equal("test");
  });

  it("Getting context returns all context", async () => {
    process.env.AWS_STAGE = "dev";
    const log = logger().lambda(lambdaEvent, lambdaContext, { baz: "test" });
    const ctx = log.getContext();
    expect(ctx).to.be.an("object");

    ["awsRegion", "stage", "functionName", "awsRequestId"].map(prop => {
      expect(ctx).to.haveOwnProperty(prop);
      expect(ctx[prop]).to.be.a("string");
    });
  });

  it("Using random stage should use dev stage defaultConfig", () => {
    process.env.AWS_STAGE = "dev";
    const log = logger().lambda(lambdaEvent, lambdaContext, { baz: "test" }); 
    const infoLogResult = log.info("Test line")
    const debugLogResult = log.debug("Test line")
    const warnLogResult = log.warn("Test line")
    const errorLogResult = log.error("Test line")
    

    expect(infoLogResult).to.not.be.undefined
    expect(debugLogResult).to.not.be.undefined
    expect(warnLogResult).to.not.be.undefined
    expect(errorLogResult).to.not.be.undefined
  })
});

function testLoggingApi(api: any) {
  expect(api).to.have.property("debug");
  expect(api).to.have.property("log");
  expect(api).to.have.property("info");
  expect(api).to.have.property("warn");
  expect(api).to.have.property("error");
}

function missingContextApi(api: any) {
  expect(api).to.not.have.property("context");
  expect(api).to.not.have.property("lambda");
}
