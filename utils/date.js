function formatDateToWIB(date) {
  if (!date) return null;
  const wib = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return wib.toISOString().slice(0, 10);
}

function withWIBDate(application) {
  if (!application) return application;
  return {
    ...application,
    appliedDate: formatDateToWIB(application.appliedDate),
  };
}

module.exports = { parseDateAsWIB, formatDateToWIB, withWIBDate };
