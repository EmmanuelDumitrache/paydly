#!/bin/bash

# Paydly Cron Job Test Script
# This script tests the automated reminder cron endpoint

set -e

echo "🧪 Testing Paydly Cron Job"
echo "================================"
echo ""

# Load environment variables
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

# Check if CRON_SECRET is set
if [ -z "$CRON_SECRET" ]; then
  echo "❌ Error: CRON_SECRET not found in .env.local"
  exit 1
fi

# Determine the target URL
if [ "$1" == "local" ]; then
  URL="http://localhost:3000/api/cron/check-invoices"
  echo "🏠 Testing LOCAL endpoint: $URL"
else
  URL="https://www.paydly.io/api/cron/check-invoices"
  echo "🌐 Testing PRODUCTION endpoint: $URL"
fi

echo ""
echo "📡 Sending request with Authorization header..."
echo ""

# Make the request
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer $CRON_SECRET" \
  "$URL")

# Extract status code and body
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "📊 Response:"
echo "Status Code: $HTTP_CODE"
echo ""
echo "Body:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

# Check result
if [ "$HTTP_CODE" == "200" ]; then
  echo "✅ Cron job executed successfully!"
  echo ""
  echo "📈 Summary:"
  echo "$BODY" | jq -r '"  - Reminders sent: \(.remindersSent // 0)\n  - Reminders failed: \(.remindersFailed // 0)\n  - Invoices synced: \(.invoicesSynced // 0)\n  - Syncs failed: \(.syncsFailed // 0)\n  - Users processed: \(.usersProcessed // 0)"' 2>/dev/null || echo "  (Unable to parse summary)"
else
  echo "❌ Cron job failed with status $HTTP_CODE"
  exit 1
fi

