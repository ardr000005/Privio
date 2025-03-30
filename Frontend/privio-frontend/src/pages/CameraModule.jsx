import { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw } from 'lucide-react';

export default function CameraModule() {
  const [capturedImage, setCapturedImage] = useState(null);
  const webcamRef = useRef(null);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
  };

  const retake = () => {
    setCapturedImage(null);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="w-full max-w-md overflow-hidden rounded-lg border-2 border-gray-700">
        {!capturedImage ? (
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="w-full"
            videoConstraints={{
              width: 720,
              height: 480,
              facingMode: "environment"
            }}
          />
        ) : (
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full"
          />
        )}
      </div>

      {!capturedImage ? (
        <button
          onClick={capture}
          className="flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg transition-all"
        >
          <Camera className="h-5 w-5" />
          <span>Capture Evidence</span>
        </button>
      ) : (
        <button
          onClick={retake}
          className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg transition-all"
        >
          <RefreshCw className="h-5 w-5" />
          <span>Retake</span>
        </button>
      )}
    </div>
  );
}