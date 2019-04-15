import * as chai from "chai";
import * as helpers from "./testing/helpers";
import { logger } from "../src/logger";
import { getState, setSeverity } from "../src/logger/state";
import { LogLevel, IAwsLog } from "../src/types";
import { IDictionary, IAWSLambaContext } from "common-types";
import { getContext } from "../src/logger/state";

const expect = chai.expect;
process.env.LOG_LEVEL = "debug";
process.env.LOG_TESTING = "";

describe("logger (to console) => ", () => {
  const end = helpers.captureStdout();
  it("logging context goes to context, local msg to 'payload'", async () => {
    const ctx = {
      foo: 1,
      bar: 2
    };
    const payload = { name: "bob", age: 46 };
    const log = logger().context(ctx);
    log.info("This is a test", payload);
    const stdout = end().map(i => JSON.parse(i));
    expect(stdout).to.has.lengthOf(1);
    expect(stdout[0]).to.be.an("object");
    expect(stdout[0].payload.name)
      .to.be.an("string")
      .and.equal(payload.name);
    expect(stdout[0].context).to.be.an("object");
    expect(stdout[0].correlationId).to.be.an("string");
    expect(stdout[0].severity).to.be.an("number");
    expect(stdout[0].stage).to.be.an("string");
    expect(stdout[0].region).to.be.an("string");
  });
});
