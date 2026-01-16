#!/bin/bash
# Run script for Diên Sanh Chatbot

set -e

# Activate virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "❌ Virtual environment not found. Run ./setup.sh first"
    exit 1
fi

# Load environment variables
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

case "$1" in
    scrape)
        echo "🕷️ Running scrapers..."
        echo ""
        echo "Scraping main site..."
        python3 src/scraper/mainsite-scraper.py
        echo ""
        echo "Scraping public services portal (this may take a while)..."
        python3 src/scraper/dichvucong-scraper.py
        echo ""
        echo "✅ Scraping complete! Data saved to ./data/"
        ;;

    scrape-main)
        echo "🕷️ Scraping main site only..."
        python3 src/scraper/mainsite-scraper.py
        ;;

    scrape-services)
        echo "🕷️ Scraping public services portal..."
        python3 src/scraper/dichvucong-scraper.py
        ;;

    scrape-debug)
        echo "🔍 Debug mode - opening browser..."
        python3 src/scraper/dichvucong-scraper.py debug
        ;;

    index)
        echo "📊 Building vector index..."
        python3 src/vector-store.py
        echo "✅ Index built successfully!"
        ;;

    search)
        shift
        echo "🔍 Searching: $*"
        python3 src/vector-store.py search "$@"
        ;;

    serve)
        echo "🚀 Starting API server..."
        echo "   API: http://localhost:8000"
        echo "   Docs: http://localhost:8000/docs"
        echo ""
        cd src/api && python3 -m uvicorn api-server:app --host 0.0.0.0 --port 8000 --reload
        ;;

    widget)
        echo "🌐 Opening chat widget in browser..."
        open src/widget/chat-widget.html || xdg-open src/widget/chat-widget.html
        ;;

    all)
        echo "🚀 Running full pipeline..."
        $0 scrape
        $0 index
        echo ""
        echo "✅ Ready! Start server with: ./run.sh serve"
        ;;

    *)
        echo "🏛️ Diên Sanh Chatbot - Commands"
        echo ""
        echo "Usage: ./run.sh <command>"
        echo ""
        echo "Commands:"
        echo "  setup          - Initial setup (run setup.sh instead)"
        echo "  scrape         - Run all scrapers"
        echo "  scrape-main    - Scrape main site only"
        echo "  scrape-services - Scrape public services portal only"
        echo "  scrape-debug   - Debug scraper with visible browser"
        echo "  index          - Build vector search index"
        echo "  search <query> - Test search functionality"
        echo "  serve          - Start API server"
        echo "  widget         - Open chat widget in browser"
        echo "  all            - Run scrape + index (full pipeline)"
        echo ""
        ;;
esac
