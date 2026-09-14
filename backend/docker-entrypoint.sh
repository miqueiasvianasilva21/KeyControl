#!/bin/sh
set -e

echo "Waiting for database to be ready..."
MAX_TRIES=30
COUNT=0

until node -e '
const { Client } = require("pg");
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect()
  .then(() => { client.end(); process.exit(0); })
  .catch(() => process.exit(1));
' 2>/dev/null; do
  COUNT=$((COUNT + 1))
  if [ $COUNT -ge $MAX_TRIES ]; then
    echo "Database check timed out, continuing anyway..."
    break
  fi
  sleep 1
done

echo "Running database migrations..."
npx prisma migrate deploy

echo "Seeding database..."
node dist/database/seed.js

echo "Starting backend process..."
exec "$@"
