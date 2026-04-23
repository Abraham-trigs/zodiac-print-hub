#!/bin/bash

BASE_URL="http://localhost:3000/api/jobs"
TOKEN="cmoa30is40001o0dwpfkom18r"

echo "=============================="
echo "1. AUTHED REQUEST (EXPECT 200)"
echo "=============================="

curl -i "$BASE_URL" \
  -H "Authorization: Bearer $TOKEN"

echo ""
echo ""

echo "=============================="
echo "2. NO AUTH (EXPECT 401)"
echo "=============================="

curl -i "$BASE_URL"

echo ""
echo ""

echo "=============================="
echo "3. INVALID TOKEN (EXPECT 401)"
echo "=============================="

curl -i "$BASE_URL" \
  -H "Authorization: Bearer invalid-token"

echo ""
echo ""

echo "=============================="
echo "DONE"
echo "=============================="
