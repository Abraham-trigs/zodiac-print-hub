#!/usr/bin/env bash

BASE_URL="http://localhost:3000/api/jobs"
TOKEN="cmoa30is40001o0dwpfkom18r"

echo "=============================="
echo "1. UNAUTH REQUEST (EXPECT 401)"
echo "=============================="

curl -i "$BASE_URL"

echo ""
echo "=============================="
echo "2. INVALID TOKEN (EXPECT 401)"
echo "=============================="

curl -i -H "Authorization: Bearer invalid" "$BASE_URL"

echo ""
echo "=============================="
echo "3. GET JOBS (EXPECT 200)"
echo "=============================="

curl -i -H "Authorization: Bearer $TOKEN" "$BASE_URL"

echo ""
echo "=============================="
echo "4. CREATE JOB (EXPECT 200)"
echo "=============================="

CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "cmoa30ivk0006o0dwct66tk1l",
    "service": {
      "id": "svc_test_001",
      "name": "Test Banner",
      "unit": "sqm",
      "priceGHS": 100
    },
    "quantity": 2,
    "width": 2,
    "height": 3,
    "notes": "integration test job"
  }')

echo "$CREATE_RESPONSE" | jq .

JOB_ID=$(echo "$CREATE_RESPONSE" | jq -r '.data.id')

echo ""
echo "=============================="
echo "5. PATCH STATUS (EXPECT 200)"
echo "=============================="

curl -i -X PATCH "$BASE_URL/$JOB_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS"
  }'

echo ""
echo "=============================="
echo "6. FINAL GET (VERIFY UPDATE)"
echo "=============================="

curl -i -H "Authorization: Bearer $TOKEN" "$BASE_URL"

echo ""
echo "DONE"
