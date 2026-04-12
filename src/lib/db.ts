import oracledb from 'oracledb';

export async function getConnection() {
  // Inisialisasi client (penting untuk Windows/Node terbaru)
  try {
    oracledb.initOracleClient();
  } catch (e) {
    // Biarkan jika sudah terinisialisasi
  }

  return await oracledb.getConnection({
    user: "system",
    password: "PasswordPuskod123",
    connectString: "localhost:1521/xe"
  });
}