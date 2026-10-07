const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function runSeed() {
  try {
    console.log('[SeedRunner] Reading SQL seed file...');
    const seedPath = path.join(__dirname, '../../database/seed.sql');
    const content = fs.readFileSync(seedPath, 'utf8');

    // Split statements by semicolon
    const statements = content
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.toLowerCase().startsWith('use '));

    const conn = await db.getConnection();
    console.log(`[SeedRunner] Executing ${statements.length} seed statements...`);

    for (const statement of statements) {
      if (statement.trim()) {
        await conn.query(statement);
      }
    }

    conn.release();
    console.log('[SeedRunner] Seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('[SeedRunner] Error during seeding:', err);
    process.exit(1);
  }
}

runSeed();
