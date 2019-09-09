import * as chai from "chai";
// import * as helpers from "./testing/helpers";
import { parseArn } from "../src/invoke/parseArn";
import { invoke } from "../src/invoke";
import { ensureFunctionName } from "../src/invoke/ensureFunctionName";
import { buildInvocationRequest } from "../src/invoke/buildInvocationRequest";
import { logger } from "../src/logger";
import { getStage } from "../src/logger/state";

const expect = chai.expect;

describe("ensureFunctionName() →", () => {
  it("name starting with invalid character fails", () => {
    try {
      ensureFunctionName("-abc");
      throw new Error("should not have gotten here");
    } catch (e) {
      expect(e.name).to.equal("InvalidName");
    }

    try {
      ensureFunctionName("1abc");
      throw new Error("should not have gotten here");
    } catch (e) {
      expect(e.name).to.equal("InvalidName");
    }

    try {
      ensureFunctionName("?abc");
      throw new Error("should not have gotten here");
    } catch (e) {
      expect(e.name).to.equal("InvalidName");
    }
  });

  it("name special characters in it fails", () => {
    try {
      ensureFunctionName("abc*");
      throw new Error("should not have gotten here");
    } catch (e) {
      expect(e.name).to.equal("InvalidName");
    }
    try {
      ensureFunctionName("abc&");
      throw new Error("should not have gotten here");
    } catch (e) {
      expect(e.name).to.equal("InvalidName");
    }
    try {
      ensureFunctionName("abc,");
      throw new Error("should not have gotten here");
    } catch (e) {
      expect(e.name).to.equal("InvalidName");
    }
  });

  it("valid name passes", () => {
    const name = ensureFunctionName("abc");
    expect(name).to.equal("abc");
  });
});

describe("invoke :: ARN Parsing →", () => {
  it("fully qualified ARN is parsed", () => {
    const arn =
      "arn:aws:lambda:us-east-1:9378553667040:function:test-services-prod-sentinel";
    const results = parseArn(arn);
    expect(results.region).to.equal("us-east-1");
    expect(results.account).to.equal("9378553667040");
    expect(results.stage).to.equal("prod");
    expect(results.fn).to.equal("sentinel");
    expect(results.appName).to.equal("test-services");
  });

  it("short ARN with all ENV is parsed", () => {
    const arn = "sentinel";
    process.env.AWS_STAGE = "prod";
    process.env.AWS_ACCOUNT = "9378553667040";
    process.env.AWS_REGION = "us-east-1";
    process.env.APP_NAME = "test-services";
    const results = parseArn(arn);
    expect(results.stage).to.equal("prod");
    expect(results.account).to.equal("9378553667040");
    expect(results.region).to.equal("us-east-1");
    expect(results.appName).to.equal("test-services");
  });

  it("short ARN without AWS_STAGE still works because it uses getStage's default", () => {
    const arn = "sentinel";
    process.env.AWS_STAGE = "";
    process.env.AWS_ACCOUNT = "9378553667040";
    process.env.AWS_REGION = "us-east-1";
    process.env.APP_NAME = "test-services";
    try {
      const results = parseArn(arn);
      expect(results.stage).to.equal(getStage());
    } catch (e) {
      throw e;
    }
  });

  it("short ARN without AWS_NAME errors out", () => {
    const arn = "sentinel";
    process.env.AWS_STAGE = "prod";
    process.env.AWS_ACCOUNT = "9378553667040";
    process.env.AWS_REGION = "us-east-1";
    process.env.APP_NAME = "";
    try {
      const results = parseArn(arn);
      throw new Error("should not have gotten here");
    } catch (e) {
      expect(e.message).to.include("appName");
      expect(e.name).to.equal("ArnParsingError");
    }
  });
});

describe("invoke :: buildInvocationRequest() →", () => {
  it("request is correct structure with basic params sent in", async () => {
    process.env.AWS_STAGE = "prod";
    process.env.AWS_ACCOUNT = "9378553667040";
    process.env.AWS_REGION = "us-east-1";
    process.env.APP_NAME = "my-services";
    const temp = logger();

    const response = buildInvocationRequest(parseArn("myFunc"), {
      foo: 1,
      bar: 2
    });
    expect(response.Payload).to.be.a("string");
    const payload = JSON.parse(response.Payload as string);
    expect(payload.headers)
      .to.be.an("object")
      .and.haveOwnProperty("X-Correlation-Id");
    expect(payload.headers["x-calling-function"]);

    expect(response.FunctionName).to.equal(
      `arn:aws:lambda:us-east-1:9378553667040:function:${process.env.APP_NAME}-${process.env.AWS_STAGE}-myFunc`
    );

    expect(response.LogType).to.equal("None");
    expect(response.InvocationType).to.equal("Event");
  });
});
