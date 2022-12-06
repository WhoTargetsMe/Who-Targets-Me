export const shouldOpenResultsPage = (userData) => {
  return !userData || !userData.isNotifiedRegister;
};
