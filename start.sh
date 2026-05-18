#!/bin/bash
pip install -r requirements.txt
if [ ! -f .env ]; then
  cp .env.example .env
fi

echo "Backend:"
echo "  uvicorn backend.main:app --reload --port 8000"
echo ""
echo "Frontend:"
echo "  cd frontend && npm install && npm run dev"
