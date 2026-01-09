#!/bin/bash

# Script to create GitHub repository and push code
# Repository name: patient-experience-hub

REPO_NAME="patient-experience-hub"
REPO_DESCRIPTION="Patient Experience Hub - Journey Observation Tool"

# Get GitHub token
if [ -n "$GITHUB_TOKEN" ]; then
    TOKEN="$GITHUB_TOKEN"
elif [ -f ~/.github_token ]; then
    TOKEN=$(cat ~/.github_token)
else
    echo "GitHub Personal Access Token required to create repository."
    echo "Get one at: https://github.com/settings/tokens"
    echo "Required scope: 'repo' (full control of private repositories)"
    echo ""
    read -sp "Enter your GitHub Personal Access Token: " TOKEN
    echo ""
fi

if [ -z "$TOKEN" ]; then
    echo "Error: GitHub token is required"
    exit 1
fi

# Get GitHub username from API
echo "Fetching GitHub username..."
USERNAME=$(curl -s -H "Authorization: token $TOKEN" https://api.github.com/user | grep -o '"login": "[^"]*' | cut -d'"' -f4)

if [ -z "$USERNAME" ]; then
    echo "Error: Could not determine GitHub username. Please check your token."
    exit 1
fi

echo "GitHub username: $USERNAME"
echo "Creating repository: $REPO_NAME..."

# Create the repository
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  -H "Authorization: token $TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user/repos \
  -d "{
    \"name\": \"$REPO_NAME\",
    \"description\": \"$REPO_DESCRIPTION\",
    \"private\": false
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 201 ]; then
    echo "✓ Repository created successfully!"
elif [ "$HTTP_CODE" -eq 422 ]; then
    echo "Repository already exists. Continuing with setup..."
elif [ "$HTTP_CODE" -eq 401 ]; then
    echo "Error: Authentication failed. Please check your token."
    exit 1
else
    echo "Error: Failed to create repository (HTTP $HTTP_CODE)"
    echo "$BODY"
    exit 1
fi

# Set up git remote
echo "Setting up git remote..."
git remote remove origin 2>/dev/null
git remote add origin https://github.com/$USERNAME/$REPO_NAME.git

# Rename branch to main if needed
git branch -M main 2>/dev/null

# Push to GitHub
echo "Pushing code to GitHub..."
if git push -u origin main; then
    echo ""
    echo "✓ Success! Your repository is now available at:"
    echo "  https://github.com/$USERNAME/$REPO_NAME"
else
    echo ""
    echo "Error: Failed to push code. You may need to:"
    echo "  1. Check your git credentials"
    echo "  2. Push manually: git push -u origin main"
    exit 1
fi
