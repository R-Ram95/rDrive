const fs = require("fs");
const { pipeline } = require("stream");
const { promisify } = require("util");

const streamPipeline = promisify(pipeline);

async function downloadFile(downloadPath, presignedUrl) {
  try {
    const response = await fetch(presignedUrl);

    if (!response.ok) {
      throw new Error(`Failed to download file, status: ${response.status}`);
    }

    await streamPipeline(response.body, fs.createWriteStream(downloadPath));

    console.log("File downloaded successfully!");
  } catch (error) {
    console.error("Error downloading file:", error);
  }
}

const downloadPath = "";
const presignedUrl = "";

downloadFile(downloadPath, presignedUrl);
