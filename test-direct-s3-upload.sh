#!/bin/bash

# Load environment variables
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
  echo "Environment variables loaded from .env.local"
else
  echo "Error: .env.local file not found"
  exit 1
fi

# Check for required environment variables
if [ -z "$AWS_BUCKET_NAME" ] || [ -z "$AWS_REGION" ]; then
  echo "Error: Required environment variables are missing (AWS_BUCKET_NAME, AWS_REGION)"
  exit 1
fi

# Create a test file
echo "This is a test file for S3 upload" > test-upload.txt
echo "Created test file: test-upload.txt"

# Upload the file using AWS CLI
echo "Uploading to S3 bucket: $AWS_BUCKET_NAME"
aws s3 cp test-upload.txt s3://$AWS_BUCKET_NAME/test-upload.txt

# Check if upload was successful
if [ $? -eq 0 ]; then
  echo "Upload successful!"
  
  # List the file in the bucket to confirm
  echo "Listing files in bucket:"
  aws s3 ls s3://$AWS_BUCKET_NAME --recursive
else
  echo "Upload failed!"
fi

# Clean up
rm test-upload.txt
echo "Test file removed locally" 