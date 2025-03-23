# S3 File Processing Flow

This document explains the complete flow of how files uploaded to S3 are automatically processed by the application.

## Overview

When a pharmacy inventory file is uploaded to S3, a series of events are triggered:

1. The file is uploaded to the S3 bucket (either directly or through our application)
2. S3 sends an event notification to a Lambda function
3. The Lambda function forwards the event to our application's webhook endpoint
4. The webhook endpoint processes the file and stores the data in MongoDB
5. The application UI displays the processing status and results

## Detailed Process Flow

### 1. File Upload Paths

There are two ways a file can be uploaded to the S3 bucket:

- **Through the application**: Using the UI upload button

  - The file is sent to `/api/upload` endpoint
  - The endpoint uploads the file to S3
  - The endpoint returns a response with the file key
  - The UI displays the file as "uploaded"

- **Directly to S3**: Using AWS CLI, SDK, or console
  - The file is uploaded directly to the S3 bucket
  - No immediate feedback in the application UI

### 2. S3 Event Notifications

When a file is uploaded to S3 (regardless of the upload path), S3 can be configured to send an event notification:

- The S3 bucket is configured with an event notification for `ObjectCreated` events
- The notification is filtered to only trigger for files in the `inventory/` prefix
- The notification target is an AWS Lambda function

### 3. Lambda Function

The Lambda function receives the S3 event:

- It extracts information about the uploaded file (bucket name, file key)
- It formats this information into a POST request
- It sends the request to your application's webhook endpoint: `YOUR_NEXTJS_API_URL/api/s3-webhook`

### 4. Webhook Processing

The webhook endpoint processes the file:

1. It validates the incoming request is a legitimate S3 event
2. It extracts the bucket name and file key from the event
3. It downloads the file from S3
4. It determines the file type (CSV, Excel, PDF)
5. It processes the file using the appropriate method:
   - For CSV: Parses using the CSV parser
   - For Excel: Parses using the XLSX library
   - For PDF: Extracts text and parses it
6. It identifies the medication names, quantities, and prices:
   - Uses the intelligent medication detection algorithm to find drug names
   - Finds numeric columns for quantities and prices
7. It stores the processed data in MongoDB
8. It returns a success response

### 5. Status Checking

The application UI checks the status of processed files:

- When a file is uploaded through the UI, it's displayed with an initial "uploaded" status
- The UI periodically calls the `/api/status?key={fileKey}` endpoint
- The status endpoint checks MongoDB for records matching the file key
- The status is updated to "processing", "processed", or "failed" as appropriate
- The UI updates to display the current status

## Setting Up S3 Event Notifications

To configure S3 to trigger the Lambda function:

1. Create an AWS Lambda function using the provided `lambda-function.js` code
2. Configure environment variables for the Lambda:
   - `WEBHOOK_URL`: Your application's webhook URL (e.g., `https://your-app.com/api/s3-webhook`)
3. Grant the Lambda function permission to be invoked by S3
4. In the S3 console, go to your bucket properties
5. Under "Event Notifications", create a new notification:
   - Event types: Select "All object create events"
   - Destination: Lambda Function
   - Lambda function: Select your function
   - Prefix: `inventory/` (to only process files in this folder)
6. Save the configuration

## Testing the Setup

To test the entire flow:

1. Ensure your Next.js application is running (locally or deployed)
2. Use the provided `upload-test-file.js` script to upload a file to S3
3. The upload should trigger the S3 event → Lambda → webhook flow
4. Check your application's logs for processing information
5. Verify that the data appears in the MongoDB collection
6. Check the UI to see if the file status is updated

## Troubleshooting

If files are not being processed:

1. Verify S3 event notifications are properly configured
2. Check Lambda function logs for any errors
3. Ensure the webhook URL in the Lambda is correct
4. Check your application logs for any errors processing the file
5. Verify that your application has the necessary AWS credentials to access S3
6. Test the webhook endpoint directly with a sample S3 event using the provided test scripts
