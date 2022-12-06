const checkScripts = (src, targets) => {
  let scriptExists = false;
  for (const target of targets) {
    let existing = target.querySelectorAll(`[src="${src}"]`);

    if (existing && existing.length) {
      scriptExists = true;
      if (existing.length > 1) {
        for (let i = 0; i < existing.length; i++) {
          if (i > 0) {
            target.removeChild(s);
          }
        }
      }
    }
  }
  return scriptExists;
};
export function injectOverload() {
  const s2 = document.createElement("script");
  s2.src =
    chrome.runtime.getURL("daemon/overload.js") || chrome.extension.getURL("daemon/overload.js");
  const targets = [document.head, document.documentElement];
  const scriptExists = checkScripts(s2.src, targets);
  if (!scriptExists) {
    (targets[0] || targets[1]).appendChild(s2);
  }
}
