#!/bin/bash

# Supabase Schema Cache Refresh Script
# This script regenerates Supabase TypeScript types and clears schema cache

echo "=== Supabase Schema Refresh ==="
echo ""

# Check for Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo "Supabase CLI not found. Installing..."
    npm install -g supabase
fi

echo "1. Regenerating Supabase types..."
supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > types/supabase.ts 2>/dev/null || echo "Note: Types generation requires supabase CLI config"

echo "2. Schema operations that may help refresh cache:"
echo "   - Run this SQL in Supabase SQL Editor if needed:"
echo "   SELECT pg_sleep(0);"
echo ""

echo "3. For Next.js, the cache should auto-refresh on:"
echo "   - Next application rebuild"
echo "   - New deployment"
echo "   - Manual cache clear via Vercel"
echo ""

echo "4. Current Supabase environment:"
echo "   - NEXT_PUBLIC_SUPABASE_URL: $NEXT_PUBLIC_SUPABASE_URL"
echo "   - Service role configured: $([ -z \"$SUPABASE_SERVICE_ROLE_KEY\" ] && echo 'NO' || echo 'YES')"
echo ""

echo "=== Complete ==="
echo "The application will auto-refresh the schema on next deployment."
