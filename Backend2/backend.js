import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import violationReportJson from './ViolationReport.json' assert { type: "json" };

// Load environment variables
dotenv.config();

const CONTRACT_ABI = violationReportJson.abi; 

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const HOLESKY_RPC = process.env.HOLESKY_RPC;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// 🔹 Set up Ethereum provider & wallet
const provider = new ethers.JsonRpcProvider(HOLESKY_RPC);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// 🔹 Initialize Contract
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

const app = express();
app.use(express.json());
app.use(cors());


///////////////////////////
// ✅ Upload Violation API
///////////////////////////
app.post('/upload-violation', async (req, res) => {
    try {
        const { id, location, reporter, report, pinataLink } = req.body;

        if (!id || !location || !reporter || !report || !pinataLink) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // 🔹 Call the smart contract function (Backend Pays Gas)
        const tx = await contract.uploadViolation(id, location, reporter, report, pinataLink);
        console.log(`Transaction Sent: ${tx.hash}`);

        // 🔹 Wait for confirmation
        const receipt = await tx.wait();
        console.log(`Transaction Confirmed in Block: ${receipt.blockNumber}`);

        res.status(200).json({ success: true, txHash: tx.hash });
    } catch (error) {
        console.error("Transaction Failed:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

///////////////////////////
// ✅ Get Violation API (Admin Only)
///////////////////////////
app.get('/get-violation/:id', async (req, res) => {
    try {
        const id = req.params.id;
        console.log("request came");
        // 🔹 Fetch violation details
        const violation = await contract.getViolation(id);
        const violationData = {
            id: violation[0].toString(),
            location: violation[1],
            reporter: violation[2],
            report: violation[3],
            pinataLink: violation[4],
            exists: violation[5]
        };

        res.status(200).json({ success: true, data: violationData });
    } catch (error) {
        console.error("Error Fetching Violation:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

///////////////////////////
// ✅ Start Backend Server
///////////////////////////
app.listen(3002, () => {
    console.log("🚀 Backend running at http://localhost:3002");
});
