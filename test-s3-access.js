const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");
require("dotenv").config({ path: ".env.local" });

// Create an S3 client with the credentials from .env.local
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function testS3Access() {
  try {
    console.log("Testing S3 access...");
    console.log("AWS_REGION:", process.env.AWS_REGION);
    console.log("AWS_BUCKET_NAME:", process.env.AWS_BUCKET_NAME);
    console.log(
      "AWS_ACCESS_KEY_ID:",
      process.env.AWS_ACCESS_KEY_ID?.substring(0, 5) + "..."
    );

    // List objects in the bucket
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_BUCKET_NAME,
      MaxKeys: 5, // Limit to 5 objects
    });

    const response = await s3Client.send(command);

    console.log("Success! Bucket accessed:", process.env.AWS_BUCKET_NAME);
    console.log("Objects in bucket:", response.Contents?.length || 0);

    if (response.Contents && response.Contents.length > 0) {
      console.log("First few objects:");
      response.Contents.forEach((obj) => {
        console.log(`- ${obj.Key} (${obj.Size} bytes)`);
      });
    } else {
      console.log("Bucket is empty");
    }
  } catch (error) {
    console.error("Error accessing S3 bucket:", error);
  }
}

testS3Access();
