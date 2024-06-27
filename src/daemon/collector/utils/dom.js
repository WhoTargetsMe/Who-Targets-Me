
export const findScriptWhereContentStartsWith = (content) => {
  try {
    const scripts = Array.from(document.querySelectorAll("script"));
    const matchingScript = scripts.find((script) => script.textContent.trim().startsWith(content));
    return matchingScript ? matchingScript.innerHTML : null;
  } catch (error) {
    console.error("Error finding script:", error);
    return null;
  }
};
