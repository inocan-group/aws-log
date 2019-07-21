import * as chai from "chai";
import * as helpers from "./testing/helpers";
import { logger } from "../src/logger";
import { IDictionary } from "common-types";
import { clearState } from "../src/logger/state";

const expect = chai.expect;
const ctx = {
  foo: 1,
  bar: 2
};
const payload = { name: "bob", age: 46 };

describe("logger (to console) => ", () => {
  it("logging context goes to context, local msg to 'payload'", async () => {
    process.env.AWS_STAGE = "test";
    const end = helpers.captureStdout();
    const log = logger().context(ctx);
    end();
    let logEntries = [];
    logEntries = logEntries.concat(log.info("This is a test", payload));
    expect(logEntries).to.has.lengthOf(1);
    expect(logEntries[0]).to.be.an("object");
    expect(logEntries[0].payload.name)
      .to.be.an("string")
      .and.equal(payload.name);
    expect(logEntries[0].context).to.be.an("object");
    expect(logEntries[0].correlationId).to.be.an("string");
    expect(logEntries[0].severity).to.be.an("number");
    expect(logEntries[0].stage).to.be.an("string");
    expect(logEntries[0].region).to.be.an("string");
  });

  it("When per-event sampling, we get a statistically reasonable balance", async () => {
    process.env.AWS_STAGE = "prod";
    const end = helpers.captureStdout();
    const log = logger({
      warn: "all",
      info: "sample-by-event",
      sampleRate: 0.3
    }).context(ctx);
    let info: Array<IDictionary | false> = [];
    let warn: Array<IDictionary | false> = [];
    for (let i = 0; i < 100; i++) {
      const iResult = log.info("ho hum", payload);
      const iWarn = log.warn("yikes", payload);
      info.push(iResult ? iResult : false);
      warn.push(iWarn ? iWarn : false);
    }
    end();

    const warnLog = warn.filter(i => i);
    const infoLog = info.filter(i => i);

    expect(infoLog.length).to.be.lessThan(100 - infoLog.length);
    expect(warnLog.length).to.equal(100);
    // NOTE: this test could show a false positive in statistically unlikely events
    expect(infoLog.length)
      .to.greaterThan(16)
      .and.lessThan(44);
  });

  it("when using session-based sampling, the sampling decision is the same for full session", async () => {
    process.env.AWS_STAGE = "prod";
    for (let x = 0; x < 50; x++) {
      const end = helpers.captureStdout();
      const log = logger({
        info: "sample-by-session",
        sampleRate: 0.3
      }).context(ctx);
      let info: Array<IDictionary | false> = [];
      for (let i = 0; i < 25; i++) {
        const iResult = log.info("ho hum", payload);
        info.push(iResult ? iResult : false);
      }
      end();

      const infoLog = info.filter(i => i);
      const sessionWasSet = info[0] ? true : false;
      if (sessionWasSet) {
        expect(infoLog).to.have.lengthOf(25);
      } else {
        expect(infoLog).to.have.lengthOf(0);
      }
      clearState();
    }
  });
});
