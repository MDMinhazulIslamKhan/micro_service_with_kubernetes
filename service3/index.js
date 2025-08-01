const express = require("express");
const app = express();
const port = 3003;

app.use(express.json());

const data = [];

app.get("/", (req, res) => {
  res.send("Hello from Service 3!");
});

app.get("/data", (req, res) => {
  res.json(data);
});

app.post("/data", (req, res) => {
  const newData = req.body;
  data.push(newData);
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

app.post("/send-to-2", async (req, res) => {
  try {
    const response = await fetch("http://localhost:3002/data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });
    const responseData = await response.json();
    res.json(responseData);
  } catch (error) {
    res.status(500).json({ error: "Failed to send data to Service 2" });
  }
});

app.get("/stop", (req, res) => {
  res.send("Stopping server");
  process.exit();
});

app.listen(port, () => {
  console.log(`Service 3 listening at http://localhost:${port}`);
});
