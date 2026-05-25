import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import { Octokit } from "octokit";
import rateLimit from "express-rate-limit";
import { randomBytes } from "crypto";

async function startServer() {
  const app = express();
  const PORT = 3000;

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use(cors());
  app.use(express.json());
  app.use(limiter);

  const importLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 import requests per window
    standardHeaders: true,
    legacyHeaders: false,
  });

  // API Routes
  
  // GitHub Integration Routes
  const getOctokit = () => {
    const pat = process.env.GITHUB_PAT;
    return new Octokit({ auth: pat });
  };

  const REPO_OWNER = "Ze0ro99";
  const REPO_NAME = "PiRC";

  app.get("/api/github/branches", async (req, res) => {
    try {
      const octokit = getOctokit();
      const response = await octokit.rest.repos.listBranches({
        owner: REPO_OWNER,
        repo: REPO_NAME,
      });
      res.json({ status: "success", data: response.data.map((b: any) => b.name) });
    } catch (error: any) {
      console.error("GitHub API Error (branches):", error.message);
      res.status(500).json({ error: "Failed to fetch branches from GitHub" });
    }
  });

  app.get("/api/github/tree", async (req, res) => {
    try {
      const { branch = "main" } = req.query;
      const octokit = getOctokit();
      const branchInfo = await octokit.rest.repos.getBranch({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        branch: branch as string,
      });
      const sha = branchInfo.data.commit.sha;
      const treeResponse = await octokit.rest.git.getTree({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        tree_sha: sha,
        recursive: "1",
      });
      res.json({ status: "success", data: treeResponse.data.tree });
    } catch (error: any) {
      console.error("GitHub API Error (tree):", error.message);
      res.status(500).json({ error: "Failed to fetch repository tree" });
    }
  });

  app.get("/api/github/file", async (req, res) => {
    try {
      const { path, branch = "main" } = req.query;
      if (!path) return res.status(400).json({ error: "Path is required" });
      
      const octokit = getOctokit();
      const response = await octokit.rest.repos.getContent({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: path as string,
        ref: branch as string,
      });

      if (Array.isArray(response.data)) {
        res.status(400).json({ error: "Requested path is a directory" });
        return;
      }
      
      if (response.data.type === "file" && 'content' in response.data) {
         // Content is base64 encoded
         const content = Buffer.from(response.data.content, 'base64').toString('utf8');
         res.json({ status: "success", data: { content, name: response.data.name, path: response.data.path }});
      } else {
        res.status(404).json({ error: "File not found or not a valid file" });
      }
    } catch (error: any) {
      console.error("GitHub API Error (file):", error.message);
      res.status(500).json({ error: "Failed to fetch file content" });
    }
  });

  app.post("/api/github/import", importLimiter, async (req, res) => {
    try {
      const { path: filePath, content } = req.body;
      if (!filePath || !content) {
         return res.status(400).json({ error: "Path and content are required" });
      }
      
      const fs = require('fs');
      const p = require('path');
      
      // Resolve and constrain destination to the "imported" directory
      const importRoot = p.resolve(process.cwd(), 'imported');
      const localPath = p.resolve(importRoot, filePath);
      const relativePath = p.relative(importRoot, localPath);
      if (relativePath.startsWith('..') || p.isAbsolute(relativePath)) {
        return res.status(400).json({ error: "Invalid path" });
      }
      
      // Ensure directory exists
      fs.mkdirSync(p.dirname(localPath), { recursive: true });
      fs.writeFileSync(localPath, content, 'utf8');
      
      res.json({ status: "success", message: `File imported to imported/${relativePath}` });
    } catch (error: any) {
      console.error("Import Error:", error.message);
      res.status(500).json({ error: "Failed to import file" });
    }
  });

  // Pi Network Auth Validation
  app.post("/api/auth", async (req, res) => {
    try {
      const { accessToken } = req.body;
      if (!accessToken) {
        return res.status(400).json({ error: "Access token is required" });
      }

      // Validate access token against Pi Network API
      const piResponse = await fetch("https://rpc.testnet.minepi.com/v2/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!piResponse.ok) {
        throw new Error("Invalid access token");
      }

      const userData = await piResponse.json();
      
      // Here you would typically establish a session, save to DB, etc.
      // For now, we return the validated user data to the frontend
      res.json({ 
        authenticated: true, 
        user: userData,
        sessionId: randomBytes(16).toString("hex")
      });
    } catch (error: any) {
      console.error("Pi Auth Error:", error.message);
      res.status(401).json({ error: "Authentication failed" });
    }
  });

  // Mock PiRC Matrix API
  app.get("/api/pirc_matrix", (req, res) => {
    res.json({
      status: "success",
      data: [
        { id: "L1", layer: "Physical", nodeCount: 1560, health: "Optimal", volume: "1.2M", timestamp: Date.now() },
        { id: "L2", layer: "Data Link", nodeCount: 1300, health: "Good", volume: "800k", timestamp: Date.now() },
        { id: "L3", layer: "Network", nodeCount: 3000, health: "Optimal", volume: "3.5M", timestamp: Date.now() },
        { id: "L4", layer: "Transport", nodeCount: 2200, health: "Warning", volume: "4.1M", timestamp: Date.now() },
        { id: "L5", layer: "Session", nodeCount: 1000, health: "Optimal", volume: "1.5M", timestamp: Date.now() },
        { id: "L6", layer: "Presentation", nodeCount: 850, health: "Optimal", volume: "900k", timestamp: Date.now() },
        { id: "L7", layer: "Application", nodeCount: 4500, health: "Optimal", volume: "8.2M", timestamp: Date.now() },
      ]
    });
  });

  // Mock Contracts Registry
  app.get("/api/contracts", (req, res) => {
    res.json({
      status: "success",
      data: [
        { id: "C-001", name: "PiRC Vault Soroban", status: "Active", tvl: 4500000, audits: "Passed" },
        { id: "C-002", name: "Matrix Matrix Subscription", status: "Deploying", tvl: 0, audits: "Pending" },
        { id: "C-003", name: "RWA Real Estate Tokenizer", status: "Active", tvl: 12500000, audits: "Passed" },
      ]
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require("path");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
