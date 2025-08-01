require("dotenv").config();
const express = require("express");
const fs = require("fs");
const app = express();
const port = process.env.PORT || 3003;

app.use(express.json());

const data = [];
const service1Data = [];
const service2Data = [];

app.get("/", (req, res) => {
  res.send("Hello from Service 3!");
});

app.get("/data", (req, res) => {
  res.json(data);
});

app.post("/data", async (req, res) => {
  const newData = req.body;
  data.push(newData);

  await fetch("http://localhost:4000/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "DataCreated",
      origin: "service3",
      data: newData,
    }),
  });

  fs.appendFile("post.log", JSON.stringify(newData) + "\n", (err) => {
    if (err) {
      console.error("Failed to write to log file");
    }
  });
  res.status(201).json(newData);
});

app.post("/events", (req, res) => {
  const { type, origin, data: eventData } = req.body;
  console.log("Received Event", type);

  if (origin === "service1") {
    service1Data.push(eventData);
  } else if (origin === "service2") {
    service2Data.push(eventData);
  }

  res.send({});
});

app.get("/other-service", (req, res) => {
  res.json([{ service1: service1Data }, { service2: service2Data }]);
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

app.listen(port, async () => {
  console.log(`Service 3 listening at http://localhost:${port}`);
  try {
    const res = await fetch("http://localhost:4000/events");
    const events = await res.json();
    for (let event of events) {
      const { origin, data: eventData } = event;
      if (origin === "service3") {
        data.push(eventData);
      } else if (origin === "service1") {
        service1Data.push(eventData);
      } else if (origin === "service2") {
        service2Data.push(eventData);
      }
    }
  } catch (error) {
    console.log("Failed to fetch events");
  }
});
