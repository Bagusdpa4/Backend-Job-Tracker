// Parse date string "YYYY-MM-DD" sebagai tengah malam WIB (UTC+7),
// lalu simpan sebagai UTC equivalent-nya, biar gak geser hari
// pas dibaca ulang di timezone manapun.
function parseDateAsWIB(dateString) {
  if (!dateString) return undefined;
  // anggap input selalu format "YYYY-MM-DD"
  const [year, month, day] = dateString.split("-").map(Number);
  // WIB = UTC+7, jadi UTC-nya adalah jam 00:00 WIB dikurangi 7 jam
  return new Date(Date.UTC(year, month - 1, day, -7));
}

module.exports = { parseDateAsWIB };
