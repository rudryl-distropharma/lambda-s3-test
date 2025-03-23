const https = require("https");
const url = require("url");

exports.handler = async (event, context) => {
  console.log("Received S3 event:", JSON.stringify(event, null, 2));

  try {
    // Get the first record (should only be one for testing)
    const record = event.Records[0];

    // Format the data to be sent to your API
    const requestBody = JSON.stringify({
      Records: [record],
    });

    // Your Next.js API webhook URL (update this with your actual URL when deployed)
    const apiUrl =
      process.env.WEBHOOK_URL || "http://localhost:3000/api/s3-webhook";

    // Parse the URL
    const parsedUrl = new url.URL(apiUrl);

    // Make request to your Next.js API
    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === "https:" ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(requestBody),
        },
      };

      const req = https.request(options, (res) => {
        let responseBody = "";

        res.on("data", (chunk) => {
          responseBody += chunk;
        });

        res.on("end", () => {
          console.log("Response status:", res.statusCode);
          console.log("Response body:", responseBody);

          resolve({
            statusCode: res.statusCode,
            body: responseBody,
          });
        });
      });

      req.on("error", (error) => {
        console.error("Error forwarding event to webhook:", error);
        reject(error);
      });

      req.write(requestBody);
      req.end();
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Event forwarded to webhook successfully",
        result,
      }),
    };
  } catch (error) {
    console.error("Error in Lambda function:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to process S3 event",
        details: error.message,
      }),
    };
  }
};
