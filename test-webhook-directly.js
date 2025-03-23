const fs = require("fs");
const path = require("path");
const http = require("http");
require("dotenv").config({ path: ".env.local" });

async function testWebhookDirectly() {
  try {
    console.log("Loading sample S3 event...");
    const eventData = fs.readFileSync(
      path.join(__dirname, "sample-s3-event.json"),
      "utf8"
    );
    const event = JSON.parse(eventData);

    // Update bucket name from env if available
    process.env.S3_BUCKET_NAME = "your-bucket-name";

    if (process.env.S3_BUCKET_NAME) {
      event.Records[0].s3.bucket.name = process.env.S3_BUCKET_NAME;
      event.Records[0].s3.bucket.arn = `arn:aws:s3:::${process.env.S3_BUCKET_NAME}`;
    }

    // Update the object key to match the problematic PDF file
    event.Records[0].s3.object.key = "inventory/05-versions-space.pdf";

    // Prepare the request body
    const requestBody = JSON.stringify(event);

    // Define the request options for the local development server
    const options = {
      hostname: "localhost",
      port: 3000,
      path: "/api/s3-webhook",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(requestBody),
      },
    };

    console.log("Sending direct request to webhook endpoint...");

    // Send the request
    const response = await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
          });
        });
      });

      req.on("error", (error) => {
        reject(error);
      });

      req.write(requestBody);
      req.end();
    });

    console.log("Webhook Response Status:", response.statusCode);
    console.log("Webhook Response Body:", response.body);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      console.log("✅ Webhook test completed successfully!");
    } else {
      console.log(
        "❌ Webhook test failed with status code:",
        response.statusCode
      );
    }
  } catch (error) {
    console.error("❌ Error during webhook test:", error);
  }
}

// Check if Next.js server is running
const checkServerRunning = () => {
  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname: "localhost",
        port: 3000,
        path: "/",
        method: "HEAD",
      },
      (res) => {
        resolve(res.statusCode === 200);
      }
    );

    req.on("error", () => {
      resolve(false);
    });

    req.end();
  });
};

(async () => {
  const serverRunning = await checkServerRunning();

  if (!serverRunning) {
    console.error("❌ Next.js server is not running on http://localhost:3000");
    console.error(
      "Please start the server with `npm run dev` before running this test"
    );
    process.exit(1);
  }

  await testWebhookDirectly();
})();
