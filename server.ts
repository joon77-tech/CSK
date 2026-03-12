import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';

app.use(express.json());

// Initialize SQLite Database
const db = new Database('csk.db');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    year TEXT NOT NULL,
    description TEXT,
    imageUrl TEXT NOT NULL,
    showOnHome INTEGER DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS about_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quote TEXT NOT NULL,
    description TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS about_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    is_representative INTEGER DEFAULT 0,
    order_index INTEGER DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS about_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    FOREIGN KEY (category_id) REFERENCES about_categories(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Clean up orphaned members just in case
db.exec('DELETE FROM about_members WHERE category_id NOT IN (SELECT id FROM about_categories)');

try {
  db.exec('ALTER TABLE projects ADD COLUMN showOnHome INTEGER DEFAULT 0');
  db.exec('UPDATE projects SET showOnHome = 1 WHERE id IN (1, 2, 3)');
} catch (e) {
  // Column might already exist
}

// Insert sample data if empty
const stmt = db.prepare('SELECT COUNT(*) as count FROM projects');
const { count } = stmt.get() as { count: number };
if (count === 0) {
  const insert = db.prepare('INSERT INTO projects (title, year, description, imageUrl, showOnHome) VALUES (?, ?, ?, ?, ?)');
  insert.run('The Modern Villa', '2025', '자연과 조화를 이루는 미니멀리스트 빌라', 'https://picsum.photos/seed/villa1/800/800', 1);
  insert.run('Urban Office', '2024', '도심 속 창의적인 업무 공간', 'https://picsum.photos/seed/office1/800/800', 1);
  insert.run('Seaside Pavilion', '2023', '바다를 품은 휴식 공간', 'https://picsum.photos/seed/pavilion/800/800', 1);
  insert.run('Cultural Center', '2024', '지역 사회를 위한 열린 문화 공간', 'https://picsum.photos/seed/culture/800/800', 0);
  insert.run('Eco Residence', '2025', '지속 가능한 친환경 주거 프로젝트', 'https://picsum.photos/seed/eco/800/800', 0);
  insert.run('Art Gallery', '2023', '빛과 공간이 빚어내는 예술 전시관', 'https://picsum.photos/seed/gallery/800/800', 0);
}

const infoStmt = db.prepare('SELECT COUNT(*) as count FROM about_info');
const { count: infoCount } = infoStmt.get() as { count: number };
if (infoCount === 0) {
  const insertInfo = db.prepare('INSERT INTO about_info (quote, description) VALUES (?, ?)');
  insertInfo.run(
    '"건축은 단순한 구조물이 아닌, 사람의 삶을 담는 그릇입니다."',
    'CSK architects는 2015년에 설립된 건축사사무소로, 주거, 상업, 문화 시설 등 다양한 분야에서 혁신적이고 지속 가능한 디자인을 선보이고 있습니다. 우리는 클라이언트의 비전을 현실로 만들며, 주변 환경과 조화를 이루는 아름다운 공간을 창조합니다.'
  );
}

const seedStmt = db.prepare("SELECT value FROM system_settings WHERE key = 'about_seeded'");
const isSeeded = seedStmt.get();

if (!isSeeded) {
  const catStmt = db.prepare('SELECT COUNT(*) as count FROM about_categories');
  const { count: catCount } = catStmt.get() as { count: number };
  
  if (catCount === 0) {
    const insertCat = db.prepare('INSERT INTO about_categories (name, is_representative, order_index) VALUES (?, ?, ?)');
    const res1 = insertCat.run('회사 대표', 1, 0);
    
    const insertMem = db.prepare('INSERT INTO about_members (category_id, name, role, description, image_url, order_index) VALUES (?, ?, ?, ?, ?, ?)');
    insertMem.run(res1.lastInsertRowid, '김건축', '대표 건축가', '자연과 인간이 공존하는 공간을 설계합니다. 20년 이상의 실무 경험을 바탕으로 지속 가능한 건축의 새로운 패러다임을 제시하고 있습니다.', 'https://picsum.photos/seed/arch1/600/800', 0);
    insertMem.run(res1.lastInsertRowid, '이공간', '공동 대표 / 수석 디자이너', '사용자의 삶을 깊이 이해하고, 그들의 이야기가 담긴 따뜻한 공간을 만듭니다. 미니멀리즘과 실용성의 조화를 추구합니다.', 'https://picsum.photos/seed/arch2/600/800', 1);

    const res2 = insertCat.run('디자이너', 0, 1);
    for (let i = 1; i <= 13; i++) {
      insertMem.run(res2.lastInsertRowid, `디자이너 ${i}`, '인테리어 디자이너', null, `https://picsum.photos/seed/designer${i}/400/400`, i);
    }
  }
  db.prepare("INSERT INTO system_settings (key, value) VALUES ('about_seeded', 'true')").run();
}

const contactSeedStmt = db.prepare("SELECT value FROM system_settings WHERE key = 'contact_seeded'");
const isContactSeeded = contactSeedStmt.get();

if (!isContactSeeded) {
  const insertSetting = db.prepare('INSERT OR REPLACE INTO system_settings (key, value) VALUES (?, ?)');
  insertSetting.run('contact_address', '서울특별시 강남구 테헤란로 123, 4층');
  insertSetting.run('contact_phone', '02-1234-5678');
  insertSetting.run('contact_email', 'info@cskarchitects.com');
  insertSetting.run('contact_map_image', 'https://picsum.photos/seed/map/800/400'); // Example map image
  insertSetting.run('contact_seeded', 'true');
} else {
  // Ensure contact_map_image exists and has a default if missing
  const mapImageStmt = db.prepare("SELECT value FROM system_settings WHERE key = 'contact_map_image'");
  const mapImage = mapImageStmt.get();
  if (!mapImage) {
    db.prepare("INSERT OR REPLACE INTO system_settings (key, value) VALUES ('contact_map_image', 'https://picsum.photos/seed/map/800/400')").run();
  }
}

const adminPasswordStmt = db.prepare("SELECT value FROM system_settings WHERE key = 'admin_password'");
const adminPassword = adminPasswordStmt.get();
if (!adminPassword) {
  const hashedPassword = bcrypt.hashSync('1017', 10);
  db.prepare("INSERT INTO system_settings (key, value) VALUES ('admin_password', ?)").run(hashedPassword);
}

// Auth Middleware
const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    (req as any).user = user;
    next();
  });
};

// API Routes
app.get('/api/admin/verify', authenticateToken, (req, res) => {
  res.json({ valid: true });
});

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  try {
    const row = db.prepare("SELECT value FROM system_settings WHERE key = 'admin_password'").get() as { value: string };
    if (!row) return res.status(500).json({ error: 'Admin password not set' });

    const isValid = bcrypt.compareSync(password, row.value);
    if (!isValid) return res.status(401).json({ error: 'Invalid password' });

    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/admin/change-password', authenticateToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const row = db.prepare("SELECT value FROM system_settings WHERE key = 'admin_password'").get() as { value: string };
    if (!row) return res.status(500).json({ error: 'Admin password not set' });

    const isValid = bcrypt.compareSync(currentPassword, row.value);
    if (!isValid) return res.status(401).json({ error: '현재 비밀번호가 일치하지 않습니다.' });

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    db.prepare("UPDATE system_settings SET value = ? WHERE key = 'admin_password'").run(hashedPassword);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to change password' });
  }
});

app.get('/api/contact-info', (req, res) => {
  try {
    const settings = db.prepare("SELECT key, value FROM system_settings WHERE key IN ('contact_address', 'contact_phone', 'contact_email', 'contact_map_image')").all() as { key: string, value: string }[];
    const info = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);
    res.json(info);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contact info' });
  }
});

app.put('/api/contact-info', authenticateToken, (req, res) => {
  const { contact_address, contact_phone, contact_email, contact_map_image } = req.body;
  try {
    const update = db.prepare('UPDATE system_settings SET value = ? WHERE key = ?');
    update.run(contact_address, 'contact_address');
    update.run(contact_phone, 'contact_phone');
    update.run(contact_email, 'contact_email');
    update.run(contact_map_image || '', 'contact_map_image');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update contact info' });
  }
});

app.get('/api/projects', (req, res) => {
  try {
    const projects = db.prepare('SELECT * FROM projects ORDER BY id DESC').all();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

app.post('/api/projects', authenticateToken, (req, res) => {
  const { title, year, description, imageUrl, showOnHome } = req.body;
  const show = showOnHome ? 1 : 0;
  try {
    const insert = db.prepare('INSERT INTO projects (title, year, description, imageUrl, showOnHome) VALUES (?, ?, ?, ?, ?)');
    const result = insert.run(title, year, description, imageUrl, show);
    res.status(201).json({ id: result.lastInsertRowid, title, year, description, imageUrl, showOnHome: show });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

app.put('/api/projects/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, year, description, imageUrl, showOnHome } = req.body;
  const show = showOnHome ? 1 : 0;
  try {
    const update = db.prepare('UPDATE projects SET title = ?, year = ?, description = ?, imageUrl = ?, showOnHome = ? WHERE id = ?');
    update.run(title, year, description, imageUrl, show, id);
    res.json({ id, title, year, description, imageUrl, showOnHome: show });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

app.delete('/api/projects/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  try {
    const del = db.prepare('DELETE FROM projects WHERE id = ?');
    del.run(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

app.post('/api/contact', async (req, res) => {
  const { name, email, phone, message } = req.body;
  try {
    // 1. Save to database
    const insert = db.prepare('INSERT INTO contacts (name, email, phone, message) VALUES (?, ?, ?, ?)');
    insert.run(name, email, phone, message);

    // 2. Forward to Formspree
    const formspreeUrl = process.env.FORMSPREE_URL || 'https://formspree.io/f/xyknwaay';
    
    try {
      const response = await fetch(formspreeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          message,
          _subject: `[CSK architects] New Contact Inquiry from ${name}`
        })
      });

      if (!response.ok) {
        console.error('Formspree submission failed:', await response.text());
      }
    } catch (fetchError) {
      console.error('Error forwarding to Formspree:', fetchError);
    }

    res.status(201).json({ success: true });
  } catch (error: any) {
    console.error('Contact form error:', error);
    res.status(500).json({ 
      error: 'Failed to submit contact form', 
      details: error.message || 'Unknown error'
    });
  }
});

app.get('/api/contacts', (req, res) => {
  try {
    const contacts = db.prepare('SELECT * FROM contacts ORDER BY createdAt DESC').all();
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

app.delete('/api/contacts/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  try {
    const del = db.prepare('DELETE FROM contacts WHERE id = ?');
    del.run(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete inquiry' });
  }
});

// About API Routes
app.get('/api/about/info', (req, res) => {
  try {
    const info = db.prepare('SELECT * FROM about_info LIMIT 1').get();
    res.json(info);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch about info' });
  }
});

app.put('/api/about/info', authenticateToken, (req, res) => {
  const { quote, description } = req.body;
  try {
    const update = db.prepare('UPDATE about_info SET quote = ?, description = ? WHERE id = (SELECT id FROM about_info LIMIT 1)');
    update.run(quote, description);
    res.json({ quote, description });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update about info' });
  }
});

app.get('/api/about', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM about_categories ORDER BY order_index ASC').all() as any[];
    for (const cat of categories) {
      cat.members = db.prepare('SELECT * FROM about_members WHERE category_id = ? ORDER BY order_index ASC').all(cat.id);
    }
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch about data' });
  }
});

app.post('/api/about/categories', authenticateToken, (req, res) => {
  const { name, is_representative, order_index } = req.body;
  try {
    const insert = db.prepare('INSERT INTO about_categories (name, is_representative, order_index) VALUES (?, ?, ?)');
    const result = insert.run(name, is_representative ? 1 : 0, order_index || 0);
    res.status(201).json({ id: result.lastInsertRowid, name, is_representative, order_index });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category' });
  }
});

app.put('/api/about/categories/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, is_representative, order_index } = req.body;
  try {
    const update = db.prepare('UPDATE about_categories SET name = ?, is_representative = ?, order_index = ? WHERE id = ?');
    update.run(name, is_representative ? 1 : 0, order_index, id);
    res.json({ id, name, is_representative, order_index });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

app.delete('/api/about/categories/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  try {
    const del = db.prepare('DELETE FROM about_categories WHERE id = ?');
    del.run(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

app.post('/api/about/members', authenticateToken, (req, res) => {
  const { category_id, name, role, description, image_url, order_index } = req.body;
  try {
    const insert = db.prepare('INSERT INTO about_members (category_id, name, role, description, image_url, order_index) VALUES (?, ?, ?, ?, ?, ?)');
    const result = insert.run(category_id, name, role, description || null, image_url, order_index || 0);
    res.status(201).json({ id: result.lastInsertRowid, category_id, name, role, description, image_url, order_index });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create member' });
  }
});

app.put('/api/about/members/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, role, description, image_url, order_index } = req.body;
  try {
    const update = db.prepare('UPDATE about_members SET name = ?, role = ?, description = ?, image_url = ?, order_index = ? WHERE id = ?');
    update.run(name, role, description || null, image_url, order_index, id);
    res.json({ id, name, role, description, image_url, order_index });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update member' });
  }
});

app.delete('/api/about/members/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  try {
    const del = db.prepare('DELETE FROM about_members WHERE id = ?');
    del.run(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete member' });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
