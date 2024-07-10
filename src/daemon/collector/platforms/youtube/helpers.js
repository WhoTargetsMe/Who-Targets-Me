
// Function to find all renderers of a specific type in a youtube response Object
// @param {Object} obj - youtube response Object
// @param {String} ytRendererType - type of renderer, e.g. "videoOwnerRenderer", "adSlotRenderer"
export const findRenderers = (obj, ytRendererType) =>
  Object.entries(obj).flatMap(([key, value]) =>
    key === ytRendererType
      ? [value]
      : typeof value === "object"
        ? findRenderers(value, ytRendererType)
        : []
  );
