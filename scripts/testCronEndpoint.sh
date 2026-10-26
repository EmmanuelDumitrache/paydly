#!/bin/bash

# Test Cron Endpoint Script
# This tests the cron endpoint to verify it's working

CRON_SECRET="${CRON_SECRET:-your_cron_secret_here}"
APP_URL="${NEXT_PUBLIC_APP_URL:-http://localhost:3000}"

echo "🧪 Testing Cron Endpoint"
echo "=========================="
echo "URL: $APP_URL/api/cron/check-invoices"
echo ""

# Make the request
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
  -X GET \
  "$APP_URL/api/cron/check-invoices" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json")

# Extract HTTP code and body
HTTP_CODE=$(echo "$RESPONSE" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE:/d')

echo "Response:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""
echo "HTTP Status: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Cron endpoint is working!"
  echo ""
  echo "Check Supabase → cron_runs table to see the execution log."
else
  echo "❌ Cron endpoint returned error"
  echo ""
  echo "Common issues:"
  echo "  - CRON_SECRET mismatch"
  echo "  - Missing environment variables"
  echo "  - Database connection issues"
  echo "  - cron_runs table doesn't exist (run migration 002)"
fi

