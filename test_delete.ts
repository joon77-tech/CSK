import Database from 'better-sqlite3';
const db = new Database('csk.db');
db.pragma('foreign_keys = ON');

const del = db.prepare('DELETE FROM about_categories WHERE id = ?');
del.run(2);

const categories = db.prepare('SELECT * FROM about_categories').all();
console.log('Categories:', categories);
const members = db.prepare('SELECT * FROM about_members').all();
console.log('Members count:', members.length);
