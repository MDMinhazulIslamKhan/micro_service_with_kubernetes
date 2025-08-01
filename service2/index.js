require("dotenv").config();
const express = require("express");
const fs = require("fs");
const app = express();
const port = process.env.PORT || 3002;

app.use(express.json());

const data = [];

app.get("/", (req, res) => {
  res.send("Hello from Service 2!");
});

app.get("/data", (req, res) => {
  res.json(data);
});

app.post("/data", (req, res) => {
  const newData = req.body;
  data.push(newData);
  fs.appendFile("post.log", JSON.stringify(newData) + "\n", (err) => {
    if (err) {
      console.error("Failed to write to log file");
    }
  });
  res.status(201).json(newData);
});

app.post("/send-to-1", async (req, res) => {
  try {
    const response = await fetch("http://localhost:3001/data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });
    const responseData = await response.json();
    res.json(responseData);
  } catch (error) {
    res.status(500).json({ error: "Failed to send data to Service 1" });
  }
});

app.post("/send-to-3", async (req, res) => {
  try {
    const response = await fetch("http://localhost:3003/data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });
    const responseData = await response.json();
    res.json(responseData);
  } catch (error) {
    res.status(500).json({ error: "Failed to send data to Service 3" });
  }
});

app.get("/stop", (req, res) => {
  res.send("Stopping server");
  process.exit();
});

app.listen(port, () => {
  console.log(`Service 2 listening at http://localhost:${port}`);
});
