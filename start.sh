#!/bin/sh
set -e

echo "Running database migrations..."
npx drizzle-kit push --force
echo "Migrations complete."

echo "Starting application..."
exec node server.js
