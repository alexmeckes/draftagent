#!/bin/bash

echo "🚀 AI Fantasy Draft Assistant - Setup Script"
echo "==========================================="

# Check if npm is installed
if ! command -v npm &> /dev/null
then
    echo "❌ npm is not installed. Please install Node.js first."
    exit 1
fi

echo "📦 Installing root dependencies..."
npm install

echo "📦 Installing backend dependencies..."
cd backend
npm install

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating backend .env file..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env with your API keys!"
fi

cd ..

echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your API keys"
echo "2. Run the Supabase schema (see supabase/SETUP.md)"
echo "3. Start the app with: npm run dev"
echo ""
echo "Happy drafting! 🏈"