require("dotenv").config();
const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const port = process.env.PORT || 4000;

const events = [];

const services = [
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
];

app.post("/events", (req, res) => {
  const event = req.body;
  events.push(event);
  console.log("Event Received:", event);

  for (const service of services) {
    axios.post(`${service}/events`, event).catch((err) => {
      console.log(`Failed to send event to ${service}`);
    });
  }

  res.send({ status: "OK" });
});

app.get("/events", (req, res) => {
  res.send(events);
});

app.listen(port, () => {
  console.log(`Event Bus listening at http://localhost:${port}`);
});
