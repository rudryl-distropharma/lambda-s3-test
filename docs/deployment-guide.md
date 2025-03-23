# Deployment Guide

This guide explains how to deploy the Pharmacy Inventory Management System to a production environment.

## Prerequisites

Before deploying, ensure you have:

1. AWS account with appropriate permissions for:
   - S3
   - Lambda
   - IAM roles and policies
2. MongoDB Atlas account (or other MongoDB hosting)
3. Vercel account (recommended for Next.js deployment)
4. Domain name (optional but recommended)

## Step 1: Deploy the Next.js Application

### Option A: Deploy to Vercel (Recommended)

1. Push your code to a GitHub, GitLab, or Bitbucket repository
2. Log in to [Vercel](https://vercel.com)
3. Click "New Project" and import your repository
4. Configure the project settings:
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Add environment variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   AWS_REGION=your_aws_region
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   S3_BUCKET_NAME=your_bucket_name
   ```
6. Click "Deploy"

### Option B: Self-hosted Deployment

1. Build the Next.js application:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm start
   ```
3. Use a process manager like PM2 to keep the application running:
   ```bash
   npm install -g pm2
   pm2 start npm --name "pharmacy-inventory" -- start
   ```
4. Configure a reverse proxy (Nginx or Apache) to serve the application

## Step 2: Set Up MongoDB

1. Create a MongoDB Atlas cluster
2. Configure database access (username and password)
3. Set up network access (IP allowlist or 0.0.0.0/0 for all IPs)
4. Create a `pharmacy` database with an `inventory` collection
5. Copy the connection string and add it to your environment variables

## Step 3: Configure AWS S3

1. Create an S3 bucket with appropriate permissions
2. Set up CORS configuration to allow your application domain:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["https://your-app-domain.com"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```
3. Set up the bucket policy to allow your application to access the bucket

## Step 4: Create AWS Lambda Function

1. Create a new Lambda function in AWS Console:

   - Runtime: Node.js 18.x
   - Architecture: x86_64
   - Permissions: Create a new role with S3 read access

2. Copy the code from `lambda-function.js` to the Lambda function code editor

3. Configure environment variables:

   ```
   WEBHOOK_URL=https://your-app-domain.com/api/s3-webhook
   ```

4. Set the Lambda function timeout to at least 10 seconds

## Step 5: Set Up S3 Event Notifications

1. Go to your S3 bucket in AWS Console
2. Navigate to the "Properties" tab
3. Scroll down to "Event Notifications"
4. Click "Create event notification"
5. Configure the notification:
   - Name: `InventoryFileUpload`
   - Event types: Select "All object create events"
   - Destination: Lambda Function
   - Lambda function: Select the function created in Step 4
   - Prefix: `inventory/` (to only process files in this folder)
6. Click "Save changes"

## Step 6: Create IAM User for Your Application

1. Go to IAM in AWS Console
2. Create a new user with programmatic access
3. Attach the following policies:
   - `AmazonS3ReadOnlyAccess` (or custom policy with more limited permissions)
4. Copy the Access Key ID and Secret Access Key
5. Add these credentials to your environment variables

## Step 7: Test the Production Setup

1. Upload a file through the application UI
2. Check the Lambda function logs for any errors
3. Verify that the data appears in MongoDB
4. Check that the file status updates correctly in the UI

## Troubleshooting

### Lambda Function Errors

If the Lambda function is failing:

1. Check the CloudWatch logs for the Lambda function
2. Verify that the `WEBHOOK_URL` environment variable is correct
3. Ensure the Lambda function has permission to access S3
4. Increase the timeout if the function is timing out

### Application Errors

If the application is not processing files:

1. Check the application logs on Vercel (or your hosting platform)
2. Verify that all environment variables are set correctly
3. Ensure that the MongoDB connection string is valid
4. Check that the AWS credentials have the necessary permissions

### S3 Event Notifications

If event notifications are not triggering:

1. Verify the event notification configuration is correct
2. Check that the Lambda function ARN is correct
3. Ensure the S3 bucket has permission to invoke the Lambda function
4. Test the event notification by uploading a file directly to S3

## Security Considerations

1. Always use HTTPS for your webhook endpoint
2. Use the principle of least privilege for AWS IAM policies
3. Restrict S3 bucket access to only the necessary operations
4. Implement appropriate authentication for your application
5. Consider using AWS Secrets Manager or similar service for managing credentials
6. Set up monitoring and alerts for your Lambda function and application

## Monitoring and Maintenance

1. Set up CloudWatch alarms for Lambda function errors
2. Configure alerts for application errors
3. Regularly review and rotate AWS credentials
4. Monitor S3 usage and costs
5. Schedule regular backups of your MongoDB database
