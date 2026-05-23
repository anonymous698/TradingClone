#!/bin/bash
echo "╔══════════════════════════════════════════════════╗"
echo "║         CRYPTEX TRADING PLATFORM                 ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
echo "Starting Django API server on http://localhost:8000"
echo "Starting React frontend on http://localhost:5173"
echo ""
echo "Demo credentials: demo / demo1234"
echo "Press Ctrl+C to stop"
echo ""

# Start Django
cd "$(dirname "$0")/backend"
python manage.py runserver 8000 &
DJANGO_PID=$!

# Start Vite dev server
cd "$(dirname "$0")/frontend"
npm run dev &
VITE_PID=$!

trap "kill $DJANGO_PID $VITE_PID 2>/dev/null" EXIT
wait
