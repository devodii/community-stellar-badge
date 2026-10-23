import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "../src/index.js";

class FakeScript {
  dataset: Record<string, string>;
  inserted: FakeLink | undefined;

  constructor(dataset: Record<string, string>) {
    this.dataset = dataset;
  }

  insertAdjacentElement(position: string, element: FakeLink): void {
    expect(position).toBe("beforebegin");
    this.inserted = element;
  }
}

class FakeLink {
  href = "";
  target = "";
  rel = "";
  innerHTML = "";
  style: Record<string, string> = {};
}

async function runEmbed(dataset: Record<string, string>): Promise<FakeLink | undefined> {
  const script = new FakeScript(dataset);
  vi.stubGlobal("HTMLScriptElement", FakeScript);
  vi.stubGlobal("document", {
    currentScript: script,
    createElement: () => new FakeLink(),
  });
  vi.resetModules();
  await import("../src/embed.js");
  return script.inserted;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("embed", () => {
  it("inserts a link to stellar.org holding the inline badge", async () => {
    const link = await runEmbed({ label: "powered-by", theme: "dark", size: "lg" });
    expect(link?.href).toBe("https://stellar.org");
    expect(link?.rel).toBe("noopener noreferrer");
    expect(link?.innerHTML).toBe(render({ label: "powered-by", theme: "dark", size: "lg" }));
  });

  it("falls back to the defaults when attributes are missing or invalid", async () => {
    const link = await runEmbed({ theme: '"><script>' });
    expect(link?.innerHTML).toBe(render());
  });

  it("does nothing when it is not run from a script tag", async () => {
    vi.stubGlobal("HTMLScriptElement", FakeScript);
    vi.stubGlobal("document", { currentScript: null });
    vi.resetModules();
    await expect(import("../src/embed.js")).resolves.toBeDefined();
  });
});
