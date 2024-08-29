export const domainMapping = {
  facebook: { domains: ["facebook.com"], overload: "XMLHttpRequest", hasInlineAdvertContent: true },
  youtube: { domains: ["youtube.com"], overload: "fetch", hasInlineAdvertContent: true },
  twitter: { domains: ["twitter.com", "x.com"], overload: "XMLHttpRequest" },
  instagram: {
    domains: ["instagram.com"],
    overload: "XMLHttpRequest",
    hasInlineAdvertContent: true,
  },
};

export const getPlatform = () => {
  const url = new URL(window.location.href);
  const hostname = url.hostname;

  for (const [platform, { domains }] of Object.entries(domainMapping)) {
    if (domains.some((domain) => hostname.endsWith(domain))) {
      return platform;
    }
  }
  return null; // Not a supported platform
};
