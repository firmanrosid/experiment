#!/usr/bin/env bash

# Read JSON file path from input
JSON_FILE=$1

# Extract values from JSON
status=$(jq -r '.status' "$JSON_FILE")
message=$(jq -r '.message' "$JSON_FILE")

# Output the values to GitHub Actions
echo "status=$status" >> $GITHUB_OUTPUT
echo "message=$message" >> $GITHUB_OUTPUT
