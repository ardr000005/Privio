import cv2
import numpy as np
import requests
import time
import asyncio
import threading
from queue import Queue
from fastapi import FastAPI, WebSocket
from fastapi.responses import StreamingResponse
from ultralytics import YOLO
from sort.Sort import Sort

app = FastAPI()

# Load YOLO model
model = YOLO("yolo11n.pt")  # Ensure the correct model file is present

# Open webcam for real-time processing
cap = cv2.VideoCapture(0)  # Set to 0 for webcam
cap.set(cv2.CAP_PROP_FPS, 30)

# Initialize SORT tracker
tracker = Sort()

# Store previous positions of tracked vehicles
vehicle_speeds = {}

# Conversion factor: Pixels to real-world meters
PIXEL_TO_METER = 0.05  

# Backend URL for sending captured images
BACKEND_URL = "http://your-backend-url.com/upload"  # Replace with actual backend endpoint

# Frame queue for async processing
frame_queue = Queue(maxsize=10)

# WebSocket connection storage
active_websockets = []

async def estimate_speed(prev_position, curr_position, fps):
    """Estimate speed based on position change and FPS"""
    if prev_position is None or curr_position is None:
        return 0  

    pixel_distance = np.sqrt((curr_position[0] - prev_position[0]) ** 2 +
                             (curr_position[1] - prev_position[1]) ** 2)
    real_distance = pixel_distance * PIXEL_TO_METER  
    speed_mps = real_distance * fps  
    speed_kmph = speed_mps * 3.6  
    return round(speed_kmph, 2)

async def process_frame():
    """Process frames from the queue and perform speed detection"""
    prev_time = time.time()

    while True:
        if not frame_queue.empty():
            frame = frame_queue.get()

            # Calculate dynamic FPS
            curr_time = time.time()
            fps = 1 / (curr_time - prev_time)
            prev_time = curr_time

            results = model(frame)
            detections = []
            
            for det in results[0].boxes.data:
                x1, y1, x2, y2, conf, cls = map(int, det.tolist())
                detections.append([x1, y1, x2, y2, conf])

            detections = np.array(detections) if len(detections) > 0 else np.empty((0, 5))
            tracked_objects = tracker.update(detections)

            detected_speeds = []

            for track in tracked_objects:
                x1, y1, x2, y2, track_id = map(int, track[:5])  
                vehicle_center = ((x1 + x2) // 2, (y1 + y2) // 2)
                prev_position = vehicle_speeds.get(track_id, None)
                vehicle_speed = await estimate_speed(prev_position, vehicle_center, fps)
                vehicle_speeds[track_id] = vehicle_center

                color = (0, 255, 0) if vehicle_speed < 80 else (0, 0, 255)  
                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                cv2.putText(frame, f"{vehicle_speed} km/h", (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

                detected_speeds.append({"track_id": track_id, "speed": vehicle_speed})

                if vehicle_speed > 80:
                    vehicle_img = frame[y1:y2, x1:x2]  
                    threading.Thread(target=send_image_to_backend, args=(vehicle_img, track_id, vehicle_speed)).start()

            await send_speed_updates(detected_speeds)

        await asyncio.sleep(0.01)

async def send_speed_updates(speed_data):
    """Send speed data to all connected WebSocket clients"""
    for ws in active_websockets:
        try:
            await ws.send_json(speed_data)
        except:
            active_websockets.remove(ws)

def send_image_to_backend(image, track_id, speed):
    """Send an image of speeding vehicle to backend"""
    filename = f"speed_{int(time.time())}_id_{track_id}.jpg"
    cv2.imwrite(filename, image)

    with open(filename, "rb") as f:
        files = {"file": (filename, f, "image/jpeg")}
        data = {"track_id": track_id, "speed": speed}

        try:
            response = requests.post(BACKEND_URL, files=files, data=data)
            print("✅ Image sent successfully!" if response.status_code == 200 else "❌ Failed to send image")
        except Exception as e:
            print("❌ Error sending image:", e)

async def video_streamer():
    """Stream processed frames over HTTP"""
    while True:
        if not frame_queue.empty():
            frame = frame_queue.queue[-1]  # Get the latest frame
            _, encoded_frame = cv2.imencode('.jpg', frame)
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + encoded_frame.tobytes() + b'\r\n')
        await asyncio.sleep(0.01)

@app.get("/video_feed")
async def video_feed():
    """Return real-time video feed"""
    return StreamingResponse(video_streamer(), media_type="multipart/x-mixed-replace; boundary=frame")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Handle WebSocket connections for real-time speed updates"""
    await websocket.accept()
    active_websockets.append(websocket)
    
    try:
        while True:
            await asyncio.sleep(1)  # Keep connection alive
    except:
        active_websockets.remove(websocket)

# Start background frame processing
def capture_frames():
    """Continuously capture frames and add them to the processing queue"""
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        if not frame_queue.full():
            frame_queue.put(frame)

if __name__ == "__main__":
    import uvicorn

    # Start the frame capture in a separate thread
    threading.Thread(target=capture_frames, daemon=True).start()

    # Start the async frame processor
    threading.Thread(target=lambda: asyncio.run(process_frame()), daemon=True).start()

    # Run FastAPI server
    uvicorn.run(app, host="0.0.0.0", port=8000)
