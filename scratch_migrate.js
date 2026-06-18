const { Pool } = require('pg');
const fs = require('fs');

// Simple dotenv parser
const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '').trim();
  }
});

const pool = new Pool({
  user: env.PG_USER,
  password: env.PG_PASSWORD,
  host: env.PG_HOST,
  port: env.PG_PORT,
  database: env.PG_DATABASE || env.PG_DB,
  ssl: {
    rejectUnauthorized: false,
  },
});

console.log("Connecting to:", env.PG_HOST, env.PG_PORT);

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    
    const { rows: checkTable } = await client.query(`
      SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename='restaurant_support_tickets';
    `);

    if (checkTable.length > 0) {
      await client.query(`ALTER TABLE restaurant_support_tickets RENAME TO restaurant_contact_tickets`);
      console.log("Renamed restaurant_support_tickets to restaurant_contact_tickets");
    } else {
      console.log("Table restaurant_support_tickets not found or already renamed.");
    }

    await client.query(`
      CREATE TABLE IF NOT EXISTS restaurant_support_tickets (
        id SERIAL PRIMARY KEY,
        tenant_id INT REFERENCES ress_tenants(tenant_id) ON DELETE CASCADE,
        user_id INT REFERENCES restaurant_users(id) ON DELETE SET NULL,
        subject VARCHAR(255),
        status VARCHAR(50) DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Created restaurant_support_tickets table.");

    await client.query(`
      CREATE TABLE IF NOT EXISTS restaurant_support_messages (
        id SERIAL PRIMARY KEY,
        tenant_id INT REFERENCES ress_tenants(tenant_id) ON DELETE CASCADE,
        ticket_id INT REFERENCES restaurant_support_tickets(id) ON DELETE CASCADE,
        sender_type VARCHAR(50) CHECK (sender_type IN ('user', 'manager')),
        sender_id INT,
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Created restaurant_support_messages table.");

    await client.query(`DROP POLICY IF EXISTS tenant_isolation_policy_contact ON restaurant_contact_tickets`);
    await client.query(`DROP POLICY IF EXISTS tenant_isolation_policy ON restaurant_contact_tickets`);
    await client.query(`DROP POLICY IF EXISTS tenant_isolation_policy ON restaurant_support_tickets`);
    await client.query(`DROP POLICY IF EXISTS tenant_isolation_policy ON restaurant_support_messages`);

    // Only apply if the table actually exists
    const { rows: checkContact } = await client.query(`
      SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename='restaurant_contact_tickets';
    `);
    if (checkContact.length > 0) {
        await client.query(`ALTER TABLE restaurant_contact_tickets ENABLE ROW LEVEL SECURITY`);
        await client.query(`
          CREATE POLICY tenant_isolation_policy_contact ON restaurant_contact_tickets 
          USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::int)
        `);
    }

    await client.query(`ALTER TABLE restaurant_support_tickets ENABLE ROW LEVEL SECURITY`);
    await client.query(`
      CREATE POLICY tenant_isolation_policy ON restaurant_support_tickets 
      USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::int)
    `);

    await client.query(`ALTER TABLE restaurant_support_messages ENABLE ROW LEVEL SECURITY`);
    await client.query(`
      CREATE POLICY tenant_isolation_policy ON restaurant_support_messages 
      USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::int)
    `);

    await client.query("COMMIT");
    console.log("Migration successful");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", err);
  } finally {
    client.release();
    process.exit(0);
  }
}

migrate();
