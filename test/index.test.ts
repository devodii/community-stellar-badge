import { describe, expect, it } from "vitest";
import type { BadgeOptions } from "../src/index.js";

describe("types", () => {
  it("accepts an empty options object", () => {
    const options: BadgeOptions = {};
    expect(options).toEqual({});
  });
});
