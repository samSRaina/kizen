curl -X POST "http://localhost:8080/tickets" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test ticket",
    "description": "Something is broken"
  }'
