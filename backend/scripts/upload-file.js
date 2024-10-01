const fs = require("fs");

async function uploadFile(presignedUrl, filePath) {
  try {
    const file = fs.readFileSync(filePath);

    const response = await fetch(presignedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": "image/jpeg",
      },
    });

    if (response.ok) {
      console.log("File uploaded successfully");
    } else {
      console.log(`Failed to upload file. Status code: ${response.status}`);
    }
  } catch (error) {
    console.error("Error uploading file:", error.message);
  }
}

const presignedUrl = ":";
const filePath = "";

uploadFile(presignedUrl, filePath);
