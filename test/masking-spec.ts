import * as chai from "chai";
import * as helpers from "./testing/helpers";
import { logger } from "../src/logger";
import { __testAccess__ } from "../src/logger/logging-api";

const expect = chai.expect;

const mask = __testAccess__.mask;
const strategy = __testAccess__.maskStrategies;
const setMaskedValues = __testAccess__.setMaskedValues;
const pathBasedMaskingStrategy = __testAccess__.pathBasedMaskingStrategy;

describe("masking values => ", () => {
  const data1 = {
    foo: "badsfdf99asdffdfdfdfd",
    bar: "sdfsdfsdfdsfdf",
    baz: "2343kjsdflsfdfsdf",
    nested: {
      deeply: {
        value: "234234234324abc"
      },
      repetitive: "2343kjsdflsfdfsdf"
    }
  };

  it("masking strategies work", async () => {
    expect(strategy.astericksWidthDynamic("12345678")).to.equal("*".repeat(8));
    expect(strategy.astericksWidthFixed("12345678")).to.equal("*".repeat(5));
    expect(strategy.revealEnd4("12345678ab")).to.equal("*".repeat(6) + "78ab");
    expect(strategy.revealStart4("12345678ab")).to.equal("1234" + "*".repeat(6));
  });

  it("mask function works with root values set to be masked", async () => {
    setMaskedValues(data1.foo, data1.baz);
    const result = mask(data1);
    // masked
    expect(result.foo).to.equal("*".repeat(data1.foo.length));
    expect(result.baz).to.equal("*".repeat(data1.baz.length));
    // not masked
    expect(result.bar).to.equal(data1.bar);
  });

  it("mask function works with nested values", async () => {
    setMaskedValues(data1.nested.deeply.value);
    const result = mask(data1);
    // masked
    expect(result.nested.deeply.value).to.equal(
      "*".repeat(result.nested.deeply.value.length)
    );
    // not masked
    expect(result.foo).to.equal(data1.foo);
    expect(result.bar).to.equal(data1.bar);
    expect(result.baz).to.equal(data1.baz);
  });

  it("mask function works across all properties with the same value", async () => {
    setMaskedValues(data1.baz);
    const result = mask(data1);
    // masked
    expect(result.baz).to.equal("*".repeat(data1.baz.length));
    expect(result.nested.repetitive).to.equal("*".repeat(data1.nested.repetitive.length));
    expect(result.baz).to.equal(result.nested.repetitive);
    // not masked
    expect(result.foo).to.equal(data1.foo);
    expect(result.bar).to.equal(data1.bar);
  });

  it("mask function uses path specific strategy when stated", async () => {
    setMaskedValues(data1.foo, data1.baz, data1.nested.deeply.value);
    pathBasedMaskingStrategy("revealEnd4", "baz");

    const result = mask(data1);
    // bespoke masked
    expect(result.baz).to.equal("*".repeat(data1.baz.length - 4) + result.baz.slice(-4));
    // default masked
    expect(result.foo).to.equal("*".repeat(data1.foo.length));
    expect(result.nested.repetitive).to.equal("*".repeat(data1.nested.repetitive.length));
    // not masked
    expect(result.bar).to.equal(data1.bar);
  });
});
