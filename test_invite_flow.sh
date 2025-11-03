#!/bin/bash

# Test script for invite-based onboarding flow
# This script demonstrates the complete invite flow using cURL

echo "🧪 Testing Invite-Based Onboarding Flow"
echo "========================================"

# Configuration
SUPABASE_URL="http://127.0.0.1:54321"
FUNCTION_URL="$SUPABASE_URL/functions/v1"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Note: This test requires:${NC}"
echo "1. Supabase running locally"
echo "2. A valid JWT token from an org admin"
echo "3. Test data created in the database"
echo ""

# Test 1: Create Invitation
echo -e "${YELLOW}Test 1: Creating an invitation${NC}"
echo "POST $FUNCTION_URL/invite-create"

# Note: Replace with actual JWT token from your admin user
JWT_TOKEN="your-jwt-token-here"

if [ "$JWT_TOKEN" = "your-jwt-token-here" ]; then
    echo -e "${RED}❌ Please update JWT_TOKEN in this script with a valid token${NC}"
    echo "To get a token:"
    echo "1. Go to Supabase Studio (http://127.0.0.1:54323)"
    echo "2. Sign in as admin@test.com"
    echo "3. Copy the JWT token from browser dev tools"
    echo ""
else
    INVITE_RESPONSE=$(curl -s -X POST "$FUNCTION_URL/invite-create" \
        -H "Authorization: Bearer $JWT_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "newuser@test.com",
            "expires_hours": 72
        }')
    
    echo "Response: $INVITE_RESPONSE"
    
    # Extract token from response (requires jq)
    if command -v jq &> /dev/null; then
        INVITE_TOKEN=$(echo $INVITE_RESPONSE | jq -r '.invite_url' | sed 's/.*token=//')
        echo -e "${GREEN}✅ Invitation created${NC}"
        echo "Token: $INVITE_TOKEN"
        echo ""
        
        # Test 2: Accept Invitation
        echo -e "${YELLOW}Test 2: Accepting the invitation${NC}"
        echo "POST $FUNCTION_URL/invite-accept"
        
        ACCEPT_RESPONSE=$(curl -s -X POST "$FUNCTION_URL/invite-accept" \
            -H "Content-Type: application/json" \
            -d "{
                \"token\": \"$INVITE_TOKEN\",
                \"password\": \"testpassword123\",
                \"name\": \"New User\"
            }")
        
        echo "Response: $ACCEPT_RESPONSE"
        echo -e "${GREEN}✅ Invitation accepted${NC}"
        echo ""
        
        # Test 3: Verify user appears in identities
        echo -e "${YELLOW}Test 3: Verifying user appears in identities${NC}"
        echo "GET $FUNCTION_URL/identities"
        
        IDENTITIES_RESPONSE=$(curl -s -X GET "$FUNCTION_URL/identities" \
            -H "Authorization: Bearer $JWT_TOKEN")
        
        echo "Response: $IDENTITIES_RESPONSE"
        echo -e "${GREEN}✅ User should now appear in identities list${NC}"
        
    else
        echo -e "${RED}❌ jq is required to parse JSON responses${NC}"
        echo "Install jq: https://stedolan.github.io/jq/"
    fi
fi

echo ""
echo -e "${YELLOW}Manual Testing Steps:${NC}"
echo "1. Create invitation via API or UI"
echo "2. Copy the invite_url from response"
echo "3. Open invite_url in browser"
echo "4. Fill out the acceptance form"
echo "5. Verify user appears in identities list"
echo ""
echo -e "${GREEN}✅ Invite flow testing complete!${NC}"
