const path = require('path')
const express = require('express')
const session = require('express-session')
const sqlite3 = require('sqlite3').verbose()

const app = express()
const db = new sqlite3.Database(path.join(__dirname, 'data.sqlite'))
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(session({
  secret: 'change-me-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true }
}))
app.use(express.static(__dirname))

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err)
      resolve(this)
    })
  })
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err)
      resolve(row)
    })
  })
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err)
      resolve(rows)
    })
  })
}

db.serialize(() => {
  db.run(
    'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE, password_hash TEXT)'
  )
  db.run(
    'CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, items_json TEXT, total REAL, created_at TEXT)'
  )
})

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' })
  next()
}

app.get('/api/me', (req, res) => {
  if (!req.session.userId) return res.status(200).json({ loggedIn: false })
  res.json({ loggedIn: true, email: req.session.email })
})

app.post('/api/register', async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase()
    const password = req.body.password || ''
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

    const existing = await get('SELECT id FROM users WHERE email = ?', [email])
    if (existing) return res.status(409).json({ error: 'Email already registered' })

    await run('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, password])
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/login', async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase()
    const password = req.body.password || ''
    const user = await get('SELECT * FROM users WHERE email = ?', [email])
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    if (password !== user.password_hash) return res.status(401).json({ error: 'Invalid credentials' })

    req.session.userId = user.id
    req.session.email = user.email
    res.json({ ok: true, email: user.email })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true })
  })
})

app.get('/api/orders', requireAuth, async (req, res) => {
  try {
    const rows = await all(
      'SELECT id, items_json, total, created_at FROM orders WHERE user_id = ? ORDER BY id DESC',
      [req.session.userId]
    )
    const orders = rows.map(row => ({
      id: row.id,
      items: JSON.parse(row.items_json || '[]'),
      total: row.total,
      createdAt: row.created_at
    }))
    res.json({ orders })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/orders', requireAuth, async (req, res) => {
  try {
    const items = Array.isArray(req.body.items) ? req.body.items : []
    const total = Number(req.body.total || 0)
    if (!items.length) return res.status(400).json({ error: 'Cart is empty' })

    const createdAt = new Date().toISOString()
    await run(
      'INSERT INTO orders (user_id, items_json, total, created_at) VALUES (?, ?, ?, ?)',
      [req.session.userId, JSON.stringify(items), total, createdAt]
    )
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
