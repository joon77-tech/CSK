import Database from 'better-sqlite3';
const db = new Database('csk.db');
const categories = db.prepare('SELECT * FROM about_categories').all();
console.log('Categories:', categories);
const members = db.prepare('SELECT * FROM about_members').all();
console.log('Members count:', members.length);
