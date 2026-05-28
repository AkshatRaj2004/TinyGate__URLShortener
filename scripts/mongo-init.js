// ── MongoDB initialisation script ─────────────────────────────────────────────
// Runs once when the container is first created.
// Creates a dedicated app-level user with limited privileges.

const dbName  = process.env.MONGO_INITDB_DATABASE || 'tinygate';
const appUser = process.env.MONGO_USER             || 'tinygate_admin';
const appPass = process.env.MONGO_PASSWORD         || 'changeme';

db = db.getSiblingDB(dbName);

db.createUser({
  user: appUser,
  pwd:  appPass,
  roles: [
    { role: 'readWrite', db: dbName },
  ],
});

// Seed indexes for performance
db.urls.createIndex({ shortCode: 1 },     { unique: true });
db.urls.createIndex({ user: 1 });
db.urls.createIndex({ expiresAt: 1 },     { expireAfterSeconds: 0, sparse: true });
db.users.createIndex({ email: 1 },        { unique: true });

print(`✅  MongoDB initialised: database="${dbName}", user="${appUser}"`);
