from fastapi import FastAPI, File, UploadFile
import shutil
import os
import time
from roboflow import Roboflow

app = FastAPI()

# Initialize Roboflow
rf = Roboflow(api_key="<use api key here>")
project = rf.workspace().project("vehicles-openimages-2epp8")
model = project.version("1").model

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Define relevant object classes
RELEVANT_CLASSES = {"Bus", "Ambulance", "Car", "Motorcycle", "Truck"}

def check_relevance(results):
    """Check if any detected objects are relevant."""
    data=dict(results)
    vehicles = data.get("vehicles-openimages-2epp8", [])

    classes = [
    pred["class"]
    for vehicle in vehicles if "predictions" in vehicle
    for pred in vehicle["predictions"]
    ]

    # Check if any relevant class is detected
    return any(cls in RELEVANT_CLASSES for cls in classes)

@app.post("/process-video/")
async def process_video(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, f"video_{int(time.time())}.mp4")

    # Save the uploaded video file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Upload and process video with Roboflow
    job_id, signed_url, expire_time = model.predict_video(
        file_path, fps=5, prediction_type="batch-video"
    )

    # Get results
    results = model.poll_until_video_results(job_id)
    # Check if the video contains relevant objects
    relevance_status = check_relevance(results)
    if relevance_status:
        relevance_status = "YES"
    else:
        relevance_status = "NO"

    print(relevance_status)  # Debugging
    response = {"relevant": relevance_status, "status": "processed"}
    print("Backend Response:", response)  # Debugging
    return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
