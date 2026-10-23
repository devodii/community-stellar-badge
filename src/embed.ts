import { render, type BadgeOptions } from "./index.js";

const script = document.currentScript;

if (script instanceof HTMLScriptElement) {
  const link = document.createElement("a");
  link.href = "https://stellar.org";
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.style.display = "inline-block";
  link.style.lineHeight = "0";

  // render() only ever emits its own markup, whatever the attributes say.
  const { label, theme, size } = script.dataset;
  link.innerHTML = render({ label, theme, size } as BadgeOptions);

  script.insertAdjacentElement("beforebegin", link);
}
