# Privio

Privio is an AI-powered traffic violation detection and reporting system that automates the process of identifying traffic violations, estimating vehicle speeds, and logging reports. It integrates real-time video processing, blockchain-based violation reporting, and machine learning for accurate detection.

---

## 🚀 Features

- **Real-Time Traffic Violation Detection** 🚦  
  Detects helmet violations, triple riding, lane violations, and no-parking violations using YOLOv8.
- **Speed Estimation** ⏩  
  Calculates vehicle speed in real time using object tracking and distance estimation.
- **Violation Reporting System** 📝  
  Captures evidence images and sends them to a backend system for processing.
- **Smart Contract Integration** ⛓️  
  Decentralized violation reporting via a Solidity smart contract.
- **Deepfake & AI-Generated Image Detection** 🔍  
  Uses EfficientNet to verify authenticity of violation images.
- **Web App for Public Access** 🌐  
  Built using React, allows users to report violations and check status.
- **Machine Learning Model Hosting** 🤖  
  Uses Roboflow for dataset management and Hugging Face Spaces for ML model hosting.

---

## 📂 Project Structure

```
PRIVIO/
│-- Backend/            # FastAPI-based backend for handling violations
│   ├── server.js       # Main backend API
│   ├── .gitignore      
│-- Backend2/           # Additional backend scripts
│   ├── backend.js      # WebSocket integration
│   ├── .gitignore      
│-- Frontend/privio-frontend/
│   ├── src/            # React frontend
│   ├── public/         
│   ├── App.jsx         # Main frontend application
│   ├── components/     
│-- ML/
│   ├── speed.py        # Speed detection module
│   ├── video.py        # Image processing module
│   ├── .gitignore      
│-- Smart Contract/
│   ├── contracts/Violation.sol  # Solidity smart contract for blockchain storage
│   ├── README.md       
│   ├── .gitignore      
└── README.md           # This file
```

---

## ⚡ Installation & Setup

### 1️⃣ Clone the Repository
```sh
git clone https://github.com/ardr000005/Privio.git
cd Privio
```

### 2️⃣ Backend Setup (FastAPI & Node.js)
#### Install Python Backend Dependencies
```sh
cd Backend
pip install -r requirements.txt
uvicorn main:app --reload
```

#### Install Node.js Backend Dependencies
```sh
cd ../Backend2
npm install
node backend.js
```

### 3️⃣ Frontend Setup (React + Vite)
```sh
cd ../Frontend/privio-frontend
npm install
npm run dev
```

### 4️⃣ Machine Learning Setup
#### Install Dependencies
```sh
cd ../../ML
pip install -r requirements.txt
```
#### Run Speed Detection
```sh
python speed.py
```

#### Run Video Processing
```sh
python video.py
```

### 5️⃣ Deploy Smart Contract
```sh
cd ../Smart Contract
npx hardhat compile
npx hardhat run scripts/deploy.js --network rinkeby
```

---

## 📡 APIs & Endpoints

### 🚦 Traffic Violation Detection API
| Method | Endpoint | Description |
|--------|---------|-------------|
| `GET` | `/video_feed` | Streams real-time traffic video |
| `POST` | `/upload` | Receives and stores images of violations |
| `POST` | `/detect` | Runs YOLOv8 model on an uploaded image |

### 🏎️ Speed Detection API
| Method | Endpoint | Description |
|--------|---------|-------------|
| `POST` | `/speed` | Estimates vehicle speed from image |

### 🧠 ML Model API (Hugging Face)
| Method | Endpoint | Description |
|--------|---------|-------------|
| `POST` | `/fake-detection` | Detects AI-generated/edited images |

### 🛑 Smart Contract API
| Method | Endpoint | Description |
|--------|---------|-------------|
| `POST` | `/report` | Stores violation on blockchain |
| `GET` | `/violations` | Fetches all reported violations |

---

## 🚀 Deployment Guide

### 🔹 Backend Deployment (FastAPI & Node.js)
- Deploy FastAPI on an **AWS EC2 / DigitalOcean droplet**
- Deploy Node.js backend on **Vercel / Render**

### 🔹 Frontend Deployment (React)
- Host on **Vercel / Netlify**
- Configure `.env` for API endpoints

### 🔹 ML Model Deployment (Hugging Face)
- Upload model weights to **Hugging Face Spaces**
- Create an API endpoint for model inference

### 🔹 Smart Contract Deployment
- Deploy on **Ethereum (Rinkeby / Polygon Testnet)**
- Use **Hardhat / Remix IDE** for contract management

---

## 🎯 Future Enhancements

- [ ] Implement license plate recognition
- [ ] Improve real-time speed estimation accuracy
- [ ] Integrate vehicle type classification
- [ ] Optimize blockchain transactions for efficiency

---

## 🛠️ Built With

- **FastAPI** - Backend API Framework
- **React + Vite** - Frontend UI
- **YOLOv8** - Object Detection Model
- **EfficientNet** - Fake Image Detection
- **Hardhat** - Smart Contract Development
- **Hugging Face** - ML Model Hosting

---

## 📸 UI Screenshots  

![WhatsApp Image 2025-03-30 at 12 41 09_6477f930](https://github.com/user-attachments/assets/dcff24ab-187f-419c-81ac-0b935444e249)

![WhatsApp Image 2025-03-30 at 12 41 34_cfc0f13e](https://github.com/user-attachments/assets/4dccddf8-404a-454c-8916-329e341224a8)

![WhatsApp Image 2025-03-30 at 12 42 00_fba0f2db](https://github.com/user-attachments/assets/90a34b41-44f9-47d3-86bf-f15f2ed645d6)

---

## 📜 License
This project is licensed under the **Apache 2.0 license**.

---

Feel free to contribute to the project! 🚀

---

_Star the repo ⭐ if you found this useful!_

