// Parse date string "YYYY-MM-DD" sebagai tengah malam WIB (UTC+7),
// lalu simpan sebagai UTC equivalent-nya, biar gak geser hari
// pas dibaca ulang di timezone manapun.
function parseDateAsWIB(dateString) {
  if (!dateString) return undefined;
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, -7));
}

// Format Date (tersimpan sbg UTC) balik ke "YYYY-MM-DD" versi WIB (UTC+7)
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
