export * from "./api/sendRawLog";
export * from "./api/createUserCredentials";

export * from "./utils/readStorage";
export * from "./utils/setToStorage";
export * from "./utils/removeFromStorage";
export * from "./utils/shouldOpenResultsPage";
export * from "./utils/postMessageToFirstActiveTab";
export * from "./utils/getActiveBrowser";

export * from "./handlers/onMessageEventHandler";
export * from "./handlers/handleOpeningResultsPage";
export * from "./handlers/handleUserRegistration";
export * from "./handlers/handleUserDeletion";
export * from "./handlers/handleScriptInjection";
export * from "./handlers/handleYGToken";
export * from "./handlers/onInstalledBackgroundEventListener";
export * from "./handlers/handleConsentUpdate";
