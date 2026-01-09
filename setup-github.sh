#!/bin/bash

# Script to set up GitHub repository for Patient Experience Hub
# Run this after creating the repository on GitHub

echo "Setting up GitHub remote for Patient Experience Hub..."

# Get GitHub username
read -p "Enter your GitHub username: " GITHUB_USERNAME

# Set remote
git remote add origin https://github.com/${GITHUB_USERNAME}/patient-experience-hub.git

# Rename branch to main if needed
git branch -M main

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin main

echo "Done! Your repository is now available at:"
echo "https://github.com/${GITHUB_USERNAME}/patient-experience-hub"
