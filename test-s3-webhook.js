const fs = require("fs");
const path = require("path");
const lambda = require("./lambda-function");

async function testS3Webhook() {
  try {
    console.log("Loading sample S3 event...");
    const eventData = fs.readFileSync(
      path.join(__dirname, "sample-s3-event.json"),
      "utf8"
    );
    const event = JSON.parse(eventData);

    // Update bucket name from env if available
    if (process.env.S3_BUCKET_NAME) {
      event.Records[0].s3.bucket.name = process.env.S3_BUCKET_NAME;
      event.Records[0].s3.bucket.arn = `arn:aws:s3:::${process.env.S3_BUCKET_NAME}`;
    }

    console.log("Simulating Lambda function with S3 event...");
    const result = await lambda.handler(event, {});

    console.log("Lambda function result:", JSON.stringify(result, null, 2));

    if (result.statusCode >= 200 && result.statusCode < 300) {
      console.log("✅ Test completed successfully!");
    } else {
      console.log("❌ Test failed with status code:", result.statusCode);
    }
  } catch (error) {
    console.error("❌ Error during test:", error);
  }
}

testS3Webhook();
