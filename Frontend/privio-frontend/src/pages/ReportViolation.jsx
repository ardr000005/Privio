import { useState, useEffect, useRef } from "react";
import { motion } from 'framer-motion';
import { Camera, Video, FileImage, FileVideo } from 'lucide-react';
import Webcam from "react-webcam";

export default function ReportViolation() {
  const [step, setStep] = useState(0);
  const [file, setFile] = useState(null);
  const [manualLocation, setManualLocation] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [violationDescription, setViolationDescription] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [cameraMode, setCameraMode] = useState('image');
  const [selectedOption, setSelectedOption] = useState('');
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const webcamRef = useRef(null);

  //new change
  const mediaRecorderRef = useRef(null);
   const [capturing, setCapturing] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [videoPreview, setVideoPreview] = useState(null);
  // new end change

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude}, ${longitude}`);
        },
        (error) => console.error("Error getting location:", error)
      );
    }
  }, []);

  // Capture image from webcam
  const captureImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setImagePreview(imageSrc); // Show preview before saving

        fetch(imageSrc)
          .then((res) => res.blob())
          .then((blob) => {
            const capturedFile = new File([blob], "captured-image.jpg", {
              type: "image/jpeg",
              lastModified: new Date().getTime(),
            });
            setFile(capturedFile);
          })
          .catch((err) => console.error("Error processing image:", err));
      }
    }
  };

  // new 2 change

  const startRecording = () => {
    setCapturing(true);
    setRecordedChunks([]); // Reset recorded chunks properly
    const stream = webcamRef.current?.stream;
    if (!stream) {
      console.error("No webcam stream available.");
      return;
    }
    const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
  
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setRecordedChunks((prev) => [...prev, event.data]);
      }
    };
  };
  

  // Stop recording video
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setCapturing(false);
    }
  };
  

  // Save recorded video
  const saveVideo = () => {
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      const videoFile = new File([blob], "recorded-video.webm", {
        type: "video/webm",
        lastModified: new Date().getTime(),
      });
      setFile(videoFile);
      setVideoPreview(URL.createObjectURL(blob));
    }
  };

  const resetRecording = () => {
    setRecordedChunks([]);
    setVideoPreview(null);
  };

  //new 2 end change

  // Handle file upload
  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
    setImagePreview(URL.createObjectURL(uploadedFile));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please upload or capture an image");
      return;
    }
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append(selectedOption.includes("video") ? "video" : "image", file);
      if (violationDescription) {
        formData.append("violationDescription", violationDescription);
      }
  
      if (selectedOption === "upload-video" || selectedOption === "upload-image") {
        formData.append("location", manualLocation || location || "Unknown");
      } else {
        let lat = null, lon = null;
        if (location && typeof location === "string" && location.includes(",")) {
          const coords = location.split(",").map(Number);
          if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
            [lat, lon] = coords;
          }
        }
        formData.append("lat", lat || "N/A");
        formData.append("lon", lon || "N/A");
      }
      
      let body;

      let apiEndpoint = "http://localhost:5001";

      switch (selectedOption) {
        case "capture-image":
          apiEndpoint = `${apiEndpoint}/upload/webcam`;
          body = formData;
          break;
        case "capture-video":
          apiEndpoint = `${apiEndpoint}/upload/video/webcam`;
          body = formData;
          break;
        case "upload-image":
          apiEndpoint = `${apiEndpoint}/upload/image`;
          body = formData;

          break;
        case "upload-video":
          apiEndpoint = `${apiEndpoint}/upload/video`;
          body = formData;
          break;
        default:
          return;
      }

      const response = await fetch(apiEndpoint, {
        method: "POST",
        body: body,
      });

      const data = await response.json();
      console.log("Server Response:", data);
  
      if (data.status === "irrelevant") {
        alert("The uploaded image does not contain a relevant violation.");
        return;
      }
  
      if (data.status === "processing") {
        alert("Image uploaded successfully! Processing violation detection...");
      }
  
      if (data.status === "processed") {
        alert(`Violation detected. Report sent successfully.`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    {loading && (
      <div className="flex justify-center items-center my-4">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )}
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Report a Violation</h1>
          <p className="text-gray-400">Help us maintain road safety by reporting violations</p>
        </motion.div>

        {step === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid sm:grid-cols-2 gap-4"
          >
            <button
              onClick={() => {
                setStep(1);
                setShowCamera(true);
                setCameraMode('image');
                setSelectedOption('capture-image');
              }}
              className="flex flex-col items-center justify-center p-8 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-cyan-500/50 transition-all"
            >
              <Camera className="h-12 w-12 text-cyan-500 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Capture Image (Webcam)</h3>
              <p className="text-sm text-gray-400 text-center">Capture real-time image with location</p>
            </button>

            <button
              onClick={() => {
                setStep(4);
                setShowCamera(true);
                setCameraMode('video');
                setSelectedOption('capture-video');
              }}
              className="flex flex-col items-center justify-center p-8 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-cyan-500/50 transition-all"
            >
              <Video className="h-12 w-12 text-cyan-500 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Capture Video (Webcam)</h3>
              <p className="text-sm text-gray-400 text-center">Capture real-time video with location</p>
            </button>

            <button
              onClick={() => {
                setStep(2);
                setSelectedOption('upload-image');
              }}
              className="flex flex-col items-center justify-center p-8 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-cyan-500/50 transition-all"
            >
              <FileImage className="h-12 w-12 text-cyan-500 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Upload Image</h3>
              <p className="text-sm text-gray-400 text-center">Upload image, enter location & violation</p>
            </button>

            <button
              onClick={() => {
                setStep(3);
                setSelectedOption('upload-video');
              }}
              className="flex flex-col items-center justify-center p-8 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-cyan-500/50 transition-all"
            >
              <FileVideo className="h-12 w-12 text-cyan-500 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Upload Video</h3>
              <p className="text-sm text-gray-400 text-center">Upload video, enter location & violation</p>
            </button>
          </motion.div>
        )}

{step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
            <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="w-full rounded-lg" />
            <button onClick={captureImage} className="mt-4 w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-4 py-2 rounded-lg transition-all">
              Capture Image
            </button>

            {imagePreview && (
              <div className="mt-4">
                <h3 className="text-white mb-2">Captured Image Preview:</h3>
                <img src={imagePreview} alt="Captured" className="w-full rounded-lg" />
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-white mb-1">Enter Violation Description</label>
                <textarea
                  value={violationDescription}
                  onChange={(e) => setViolationDescription(e.target.value)}
                  className="w-full bg-gray-700 p-2 rounded-lg text-white focus:ring-2 focus:ring-cyan-500"
                  placeholder="Describe the violation..."
                ></textarea>
              </div>

              <p className="text-gray-400">{location ? `Location: ${location}` : "Fetching location..."}</p>

              <div className="flex gap-4">
                <button type="button" onClick={() => setStep(0)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-all">
                  Back
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-lg text-white ${loading ? "bg-gray-600" : "bg-cyan-600 hover:bg-cyan-500"}`}
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </form>
          </motion.div>
        )}



        {step === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Upload Evidence</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,video/*"
                  className="w-full bg-gray-700 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Enter Location</label>
                <input
                  type="text"
                  value={manualLocation} // Allow manual input but default to auto location
                  onChange={(e) => setManualLocation(e.target.value)}
                  placeholder="Enter location manually"
                  className="w-full bg-gray-700 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Describe the Violation</label>
                <textarea
                  value={violationDescription}
                  onChange={(e) => setViolationDescription(e.target.value)}
                  placeholder="Enter violation details"
                  className="w-full bg-gray-700 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button type="button" onClick={() => setStep(0)} className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-all">Back</button>
                <button type="submit" className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-all">Submit Report</button>
              </div>
            </form>
          </motion.div>
        )}

{step === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <form onSubmit={handleSubmit} className="space-y-6">
              <input 
                type="file" 
                onChange={handleFileChange} 
                accept="video/*" 
                className="w-full bg-gray-700 rounded-lg p-2 text-white" 
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Enter Location</label>
                <input
                  type="text"
                  value={manualLocation} // Allow manual input but default to auto location
                  onChange={(e) => setManualLocation(e.target.value)}
                  placeholder="Enter location manually"
                  className="w-full bg-gray-700 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Describe the Violation</label>
                <textarea
                  value={violationDescription}
                  onChange={(e) => setViolationDescription(e.target.value)}
                  placeholder="Enter violation details"
                  className="w-full bg-gray-700 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                ></textarea>
              </div>
              
              <div className="flex gap-4">
                <button type="button" onClick={() => setStep(0)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">Back</button>
                <button type="submit" className={`px-4 py-2 rounded-lg text-white ${loading ? "bg-gray-600" : "bg-cyan-600 hover:bg-cyan-500"}`} disabled={loading}>{loading ? "Submitting..." : "Submit Report"}</button>
              </div>


            </form>
          </motion.div>
        )}

{step === 4 && (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    className="bg-gray-800 p-6 rounded-xl border border-gray-700"
  >
    {!videoPreview ? (
      <Webcam ref={webcamRef} className="w-full rounded-lg" />
    ) : (
      <video controls className="w-full rounded-lg">
        <source src={videoPreview} type="video/webm" />
      </video>
    )}

    {/* Buttons for Recording */}
    <div className="mt-4 flex gap-4">
      {capturing ? (
        <button 
          onClick={stopRecording} 
          className="w-full bg-red-600 hover:bg-red-500 text-white font-medium px-4 py-2 rounded-lg transition-all"
        >
          Stop Recording
        </button>
      ) : (
        <button 
          onClick={startRecording} 
          className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-4 py-2 rounded-lg transition-all"
        >
          Start Recording
        </button>
      )}
    </div>

    {/* Save & Re-record Buttons */}
    {recordedChunks.length > 0 && (
      <div className="mt-4 flex gap-4">
        <button 
          onClick={saveVideo} 
          className="w-full bg-green-600 hover:bg-green-500 text-white font-medium px-4 py-2 rounded-lg transition-all"
        >
          Save Video
        </button>
        <button 
          onClick={resetRecording} 
          className="w-full bg-gray-600 hover:bg-gray-500 text-white font-medium px-4 py-2 rounded-lg transition-all"
        >
          Re-record
        </button>
      </div>
    )}

    {/* Submission Form */}
    {videoPreview && (
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label className="block text-white mb-1">Enter Violation Description</label>
          <textarea
            value={violationDescription}
            onChange={(e) => setViolationDescription(e.target.value)}
            className="w-full bg-gray-700 p-2 rounded-lg text-white focus:ring-2 focus:ring-cyan-500"
            placeholder="Describe the violation..."
          ></textarea>
        </div>

        <p className="text-gray-400">{location ? `Location: ${location}` : "Fetching location..."}</p>

        <div className="flex gap-4">
          <button 
            type="button" 
            onClick={() => setStep(3)} 
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-all"
          >
            Back
          </button>
          <button 
            type="submit"
            className={`px-4 py-2 rounded-lg text-white ${loading ? "bg-gray-600" : "bg-cyan-600 hover:bg-cyan-500"}`}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </form>
    )}
  </motion.div>
)}

      </div>
    </div>
  );
}
