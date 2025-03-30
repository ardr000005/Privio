require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const nodemailer = require("nodemailer");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const generatedIDs = new Set();

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173", // Change this to match your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

const upload = multer({ dest: "uploads/", limits: { fileSize: 5 * 1024 * 1024 } });
const videoUpload = multer({
  dest: "uploads/videos/",
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

const compressVideo = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    ffmpeg(inputPath)
      .output(outputPath)
      .size("640x360")
      .videoCodec("libx264")
      .on("end", () => resolve(outputPath))
      .on("error", (err) => reject(err))
      .run();
  });
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_PASS,
  },
});

function generateUniqueID() {
  let uniqueNum;
  do {
    uniqueNum = Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit number
  } while (generatedIDs.has(uniqueNum)); // Ensures uniqueness

  generatedIDs.add(uniqueNum);
  return uniqueNum;
}

async function uploadToPinata(filePath) {
  const formData = new FormData();
  formData.append("file", fs.createReadStream(filePath));

  const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
    headers: {
      ...formData.getHeaders(),
      pinata_api_key: process.env.PINATA_API_KEY,
      pinata_secret_api_key: process.env.PINATA_SECRET_KEY,
    },
  });
  return response.data.IpfsHash;
}



async function sendEmail(subject, text) {
  await transporter.sendMail({
    from: process.env.SENDER_EMAIL,
    to: process.env.RECIPIENT_EMAIL,
    subject,
    text,
  });
}

app.post("/upload/webcam", upload.single("image"), async (req, res) => { 
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const { violationDescription, lat, lon } = req.body;
    description = violationDescription;
    let resolvedLocation3 = `https://www.google.com/maps?q=${lat},${lon}`;

  const formObj = new FormData();
  formObj.append("file", fs.createReadStream(filePath));
  console.log('r0');
  const objResponse = await axios.post(
    `https://detect.roboflow.com/vehicles-openimages-2epp8/1?api_key=${process.env.ROBOFLOW_API_KEY}`,
    formObj,
    { headers: { ...formObj.getHeaders() } }
  );

  if (!objResponse.data || !objResponse.data.predictions || objResponse.data.predictions.length === 0) {
    return res.json({ status: "irrelevant" });
  }
  console.log('r1');
  // **Violation Detection API**
  const formViolation = new FormData();
  formViolation.append("file", fs.createReadStream(filePath));

  const violationResponse = await axios.post(
    "<hugging face custom model >/",
    formViolation,
    { headers: { ...formViolation.getHeaders() } }
  );

  const violationData = violationResponse.data;
  console.log('processed request 1');
  // **Upload to Pinata (IPFS)**
  const ipfsHash = await uploadToPinata(filePath);

  // **Construct IPFS Link**
  const ipfsLink = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
  console.log('processed request 2');
  // **Send email with report**
  description1=description;
  let id;
    id=generateUniqueID();
    const blockResponse = await axios.post(
      "http://localhost:3002/upload-violation",
      {
        id,
        location: resolvedLocation3,
        reporter: description1,
        report: violationData.detections.map(d => d.class).join(", "),
        pinataLink: ipfsLink
      },
      { headers: { "Content-Type": "application/json" } }
    );
    
    if (blockResponse?.data?.error) {
      console.error("Upload failed:", blockResponse.data.error);
    }
    

    // **Send email with report**
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: process.env.RECIPIENT_EMAIL,
      subject: "Traffic Violation Detected",
      text: `Traffic Violation Reported:
      ID: ${id}\n
  
      Check the website: http://localhost:5173/admin`
    };
  await transporter.sendMail(mailOptions);
  console.log('Mailed the violation');
  // **Final Response**
  res.json({
    status: "processed",
    message: "Email sent successfully. Thank you for reporting the violation.",
    ipfsHash,
    violations: violationData || "No data",
  });

} catch (error) {
  console.error("Error processing image:", error);
  res.status(500).json({ error: "Internal Server Error" });
}
});

app.post("/upload/image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }
    console.log('received request 1');
    const filePath = req.file.path;
    const { violationDescription, location} = req.body;
    description = violationDescription;
    let description1 = description; 
    let resolvedLocation1 = location;
    if (!fs.existsSync(filePath)) {
      return res.status(500).json({ error: "File not found" });
    }

    
    // **Fake Detector API**
    const formFake = new FormData();
    formFake.append("image", fs.createReadStream(filePath));

    const fakeResponse = await axios.post(
      "http://127.0.0.1:5000/detect",
      formFake,
      { headers: { ...formFake.getHeaders() } }
    );

    if (fakeResponse.data.result && fakeResponse.data.result.includes("Computer Generated")) {
      return res.json({ status: "edited" });
    }

    // **Roboflow Object Detection API**
    const formObj = new FormData();
    formObj.append("file", fs.createReadStream(filePath));

    const objResponse = await axios.post(
      `https://detect.roboflow.com/vehicles-openimages-2epp8/1?api_key=${process.env.ROBOFLOW_API_KEY}`,
      formObj,
      { headers: { ...formObj.getHeaders() } }
    );

    if (!objResponse.data || !objResponse.data.predictions || objResponse.data.predictions.length === 0) {
      return res.json({ status: "irrelevant" });
    }

    // **Violation Detection API**
    const formViolation = new FormData();
    formViolation.append("file", fs.createReadStream(filePath));

    const violationResponse = await axios.post(
      "<hugging face custom model >/",
      formViolation,
      { headers: { ...formViolation.getHeaders() } }
    );
    
    const violationData = violationResponse.data;
    console.log('processed request 1');
    // **Upload to Pinata (IPFS)**
    const ipfsHash = await uploadToPinata(filePath);

    // **Construct IPFS Link**
    const ipfsLink = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    console.log('processed request 2');

    let id;
    id=generateUniqueID();
    const blockResponse = await axios.post(
      "http://localhost:3002/upload-violation",
      {
        id,
        location: resolvedLocation1,
        reporter: description1,
        report: violationData.detections.map(d => d.class).join(", "),
        pinataLink: ipfsLink
      },
      { headers: { "Content-Type": "application/json" } }
    );
    
    if (blockResponse?.data?.error) {
      console.error("Upload failed:", blockResponse.data.error);
    }
    

    // **Send email with report**
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: process.env.RECIPIENT_EMAIL,
      subject: "Traffic Violation Detected",
      text: `Traffic Violation Reported:
      ID: ${id}\n
  
      Check the website: http://localhost:5173/admin`
    };
    

    await transporter.sendMail(mailOptions);
    console.log('Mailed the violation');
    // **Final Response**
    res.json({
      status: "processed",
      message: "Email sent successfully. Thank you for reporting the violation.",
      ipfsHash,
      violations: violationData?.detections?.length 
        ? violationData.detections.map(d => d.class).join(", ") 
        : "No data"
    });
    

  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

 // 📌 Import FFmpeg

 app.post("/upload/video", videoUpload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No video uploaded" });
    }
    console.log('received request video');

    const filePath = req.file.path;
    const compressedFilePath = path.join(__dirname, "uploads", `compressed_${req.file.filename}.mp4`);
    const { violationDescription, location} = req.body;
    description = violationDescription;
    let resolvedLocation4 = location;

    // 📌 Compress the video
    try {
      await compressVideo(filePath, compressedFilePath);
    } catch (error) {
      console.error("Video compression failed:", error);
      return res.status(500).json({ error: "Video compression failed" });
    }

    if (!fs.existsSync(compressedFilePath)) {
      console.error("Compressed video not found");
      return res.status(500).json({ error: "Compressed video not found" });
    }

    // 📌 Send compressed video to FastAPI for object detection
    const formData = new FormData();
    formData.append("file", fs.createReadStream(compressedFilePath));
    const detectionResponse = await axios.post(
      "http://127.0.0.1:8000/process-video/",
      formData,
      { headers: formData.getHeaders() }
    );
  
    if (detectionResponse.data.relevant === false) {
        return res.status(200).json({ message: "Irrelevant image" }); 
    }
    

    

    // 📌 Upload original video to Pinata (IPFS)
    const ipfsHash = await uploadToPinata(filePath);
    const ipfsLink = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

    // 📌 Send email report
    let id;
    id=generateUniqueID();
    const blockResponse = await axios.post(
      "http://localhost:3002/upload-violation",
      {
        id,
        location: resolvedLocation4,
        reporter: description,
        report: "No information available",
        pinataLink: ipfsLink
      },
      { headers: { "Content-Type": "application/json" } }
    );
    
    if (blockResponse?.data?.error) {
      console.error("Upload failed:", blockResponse.data.error);
    }
    

    // **Send email with report**
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: process.env.RECIPIENT_EMAIL,
      subject: "Traffic Violation Detected",
      text: `Traffic Violation Reported:
      ID: ${id}\n
  
      Check the website: http://localhost:5173/admin`
    };
    await transporter.sendMail(mailOptions);
    console.log("Violation report emailed successfully.");

    // 📌 Cleanup: Delete original and compressed video
    fs.unlinkSync(filePath);
    fs.unlinkSync(compressedFilePath);

    // 📌 Final Response
    res.json({
      status: "processed",
      message: "Thank you for reporting the violation. An email has been sent successfully.",
      ipfsLink
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



app.post("/upload/video/webcam", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No video uploaded" });
    }
    console.log('Received webcam video request');

    const filePath = req.file.path;
    const compressedFilePath = path.join(__dirname, "uploads", `compressed_${req.file.filename}.mp4`);
    const { violationDescription, lat, lon } = req.body;
    description = violationDescription;

    let resolvedLocation2 = `https://www.google.com/maps?q=${lat},${lon}`;

    // 📌 Object detection using Roboflow API
    try {
      await compressVideo(filePath, compressedFilePath);
    } catch (error) {
      console.error("Video compression failed:", error);
      return res.status(500).json({ error: "Video compression failed" });
    }

    if (!fs.existsSync(compressedFilePath)) {
      console.error("Compressed video not found");
      return res.status(500).json({ error: "Compressed video not found" });
    }

    // 📌 Send compressed video to FastAPI for object detection
    const formData = new FormData();
    formData.append("file", fs.createReadStream(compressedFilePath));
    const detectionResponse = await axios.post(
      "http://127.0.0.1:8000/process-video/",
      formData,
      { headers: formData.getHeaders() }
    );
    
    if (detectionResponse.data.relevant === "NO") {
        return res.status(200).json({ message: "Irrelevant image",status: "irrelevant", }); 
    }
    else
    {
    

    // 📌 Upload original video to Pinata (IPFS)
    const ipfsHash = await uploadToPinata(filePath);
    const ipfsLink = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

    // 📌 Send email report
    let id;
    id=generateUniqueID();
    const blockResponse = await axios.post(
      "http://localhost:3002/upload-violation",
      {
        id,
        location: resolvedLocation2,
        reporter: description,
        report: "No information available",
        pinataLink: ipfsLink
      },
      { headers: { "Content-Type": "application/json" } }
    );
    
    if (blockResponse?.data?.error) {
      console.error("Upload failed:", blockResponse.data.error);
    }
    

    // **Send email with report**
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: process.env.RECIPIENT_EMAIL,
      subject: "Traffic Violation Detected",
      text: `Traffic Violation Reported:
      ID: ${id}\n
  
      Check the website: http://localhost:5173/admin`
    };
    await transporter.sendMail(mailOptions);
    console.log("Violation report emailed successfully.");

    // 📌 Cleanup: Delete original and compressed video
    fs.unlinkSync(filePath);
    fs.unlinkSync(compressedFilePath);

    // 📌 Final Response
    res.json({
      status: "processed",
      message: "Thank you for reporting the violation. An email has been sent successfully.",
      ipfsHash,
      ipfsLink
    });
  }

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



app.listen(5001, () => console.log("Server running on port 5001"));
