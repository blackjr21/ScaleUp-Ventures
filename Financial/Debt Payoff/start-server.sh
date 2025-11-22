#!/bin/bash

# Simple script to start a local web server for the dynamic debt dashboard

echo "🚀 Starting local web server..."
echo ""
echo "📊 Your dynamic debt dashboard will be available at:"
echo "   http://localhost:8000/debt-strategy-dynamic.html"
echo ""
echo "📝 To stop the server, press Ctrl+C"
echo ""
echo "----------------------------------------"
echo ""

# Start Python web server
python3 -m http.server 8000
