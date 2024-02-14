const express = require("express");
const app = express();
const cors = require("cors");
const citiesRoutes = require("./routes/cities");
const itineraryRoutes = require("./routes/itinerary");
const destinationRoutes = require("./routes/destination");
const tripRoutes = require("./routes/trip");

// Middleware to parse JSON request body
app.use(express.json());
app.use(cors());

app.use("/api/cities", citiesRoutes);

app.use("/api/itinerary", itineraryRoutes);
app.use("/api/itineraries", itineraryRoutes);
app.use("/api/bulk_itineraries", itineraryRoutes);

app.use("/api/destination", destinationRoutes);
app.use("/api/destinations", destinationRoutes);
app.use("/api/bulk_destinations", destinationRoutes);

app.use("/api/trip", tripRoutes);

app.listen(5000);
