#!/bin/bash

echo "🚀 Setting up The Fridge Backend..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install it first:"
    echo "npm install -g pnpm"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Check if wrangler is available
if ! command -v wrangler &> /dev/null; then
    echo "📦 Installing Wrangler globally..."
    pnpm install -g wrangler
fi

# Apply database migrations
echo "🗄️ Setting up database..."
pnpm run worker:db:migrate

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start the backend: pnpm run worker:dev"
echo "2. Start the frontend: pnpm run dev"
echo "3. Open http://localhost:3000"
echo ""
echo "For more details, see BACKEND_SETUP.md"
