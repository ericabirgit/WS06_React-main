const fs = require('fs');
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const pagesRouter = require('./routes/pages');
const postsRouter = require('./routes/posts');

const app = express();
const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, 'public');
const frontendDist = path.join(__dirname, '../frontend/dist');
const hasFrontendDist = fs.existsSync(frontendDist);

// ─── TODO: Write the connectToDatabase function ──────────────────────────────
// This function should:
//   1. Check if process.env.MONGODB_URI exists
//      - If missing, warn the user and return early
//      - Message: "MONGODB_URI is missing. Create a .env file in backend/ before testing database features."
//   2. Use a try-catch block to safely connect to MongoDB with mongoose.connect()
//      - Pass options: { dbName: 'blog' }
//      - Log success: "Connected to MongoDB"
//      - Log error: "MongoDB connection error: <error.message>"
//   3. Return a Promise (async/await)
//
// Hint: See WS05 Server.js for the completed version

async function connectToDatabase() {
  if (!process.env.MONGODB_URI) {
    console.warn('MONGODB_URI is missing. Create a .env file in backend/ before testing database features.')
    return
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'blog' })
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`)
  }
}

app.locals.publicDir = publicDir;
app.use(express.json());

if (hasFrontendDist) {
  app.use(express.static(frontendDist));
} else {
  app.use(express.static(publicDir));
}

app.use('/api/posts', postsRouter);

if (hasFrontendDist) {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }

    return res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  app.use('/', pagesRouter);

  app.use((req, res) => {
    res.status(404).sendFile(path.join(publicDir, '404.html'));
  });
}

app.use((error, req, res, next) => {
  console.error(error.stack);
  if (hasFrontendDist) {
    return res.status(500).sendFile(path.join(frontendDist, 'index.html'));
  }
  res.status(500).sendFile(path.join(publicDir, '500.html'));
});

connectToDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Mounted routers:');
    console.log('  / -> routes/pages.js');
    console.log('  /api/posts -> routes/posts.js');
  });
});
