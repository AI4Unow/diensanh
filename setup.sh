#!/bin/bash
# Setup script for Diên Sanh Chatbot

set -e

echo "🏛️ Diên Sanh Chatbot - Setup"
echo "================================"

# Check Python version
python3 --version || { echo "❌ Python 3 is required"; exit 1; }

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Install Playwright browsers
echo "🌐 Installing Playwright browsers..."
playwright install chromium

# Create data directory
mkdir -p data

# Check for API key
if [ ! -f ".env" ] || ! grep -q "AI4U_API_KEY" .env; then
    echo ""
    echo "⚠️  API key not found in .env file"
    echo "Please add your API key:"
    echo ""
    echo "  echo 'AI4U_API_KEY=your_key_here' >> .env"
    echo ""
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Add your API key: echo 'AI4U_API_KEY=your_key' >> .env"
echo "  2. Run scrapers: ./run.sh scrape"
echo "  3. Build index: ./run.sh index"
echo "  4. Start server: ./run.sh serve"
