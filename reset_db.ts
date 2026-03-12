import Database from 'better-sqlite3';
const db = new Database('csk.db');
db.pragma('foreign_keys = ON');

try {
  db.exec('DELETE FROM about_categories');
  db.exec('DROP TABLE IF EXISTS system_settings');
  console.log('Reset complete');
} catch (e) {
  console.error(e);
}
