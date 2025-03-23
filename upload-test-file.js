const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: ".env.local" });

// Validate environment variables
const requiredEnvVars = [
  "AWS_REGION",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "S3_BUCKET_NAME",
];
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(
    `❌ Missing required environment variables: ${missingVars.join(", ")}`
  );
  console.error("Please check your .env.local file");
  process.exit(1);
}

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function uploadTestFile() {
  try {
    const filePath = path.join(__dirname, "test-medications.csv");
    const fileContent = fs.readFileSync(filePath);
    const destinationKey = "inventory/test-medications.csv";

    console.log(
      `Uploading file to s3://${process.env.S3_BUCKET_NAME}/${destinationKey}...`
    );

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: destinationKey,
      Body: fileContent,
      ContentType: "text/csv",
    });

    const response = await s3Client.send(command);

    console.log("✅ File uploaded successfully!");
    console.log("Upload details:", {
      ETag: response.ETag,
      Bucket: process.env.S3_BUCKET_NAME,
      Key: destinationKey,
    });

    console.log("\nThis upload should trigger:");
    console.log("1. S3 event notification to Lambda (if configured)");
    console.log("2. Lambda calling your webhook endpoint");
    console.log("3. Your application processing the file");
  } catch (error) {
    console.error("❌ Error uploading file:", error);
  }
}

uploadTestFile();
