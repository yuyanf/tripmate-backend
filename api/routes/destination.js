const express = require("express");
const router = express.Router();
const pool = require("../db");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

router.post("/", async (req, res) => {
  const { startDate, endDate, cityId, tripId } = req.body;
  if (!startDate || !endDate || !cityId || !tripId) {
    // If any required field is missing, return a 400 Bad Request response
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const destination = await prisma.destination.create({
      data: {
        startDate,
        endDate,
        cityId,
        tripId,
      },
    });

    res.status(201).json(destination);
  } catch (error) {
    console.error("Error creating destination:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/bulk_destinations", async (req, res) => {
  const destinations = req.body; // Assuming the request body is an array of destinations

  try {
    if (!Array.isArray(destinations)) {
      return res
        .status(400)
        .json({ error: "Request body must be an array of destinations" });
    }
    for (const destination of destinations) {
      if (!destination.startDate) {
        return res.status(400).json({ error: "Missing startDate" });
      } else if (!destination.endDate) {
        return res.status(400).json({ error: "Missing endDate" });
      } else if (!destination.cityId) {
        return res.status(400).json({ error: "Missing city id" });
      } else if (!destination.tripId) {
        return res.status(400).json({ error: "Missing trip id" });
      }
    }
    // Using Prisma transaction to ensure all or none destinations are created
    const createdDestinations = await prisma.$transaction(
      destinations.map((destination) => {
        return prisma.destination.create({
          data: {
            startDate: destination.startDate,
            endDate: destination.endDate,
            cityId: destination.cityId,
            tripId: destination.tripId,
          },
        });
      })
    );

    res.status(201).json({
      message: "Destinations created successfully",
      destinations: createdDestinations,
    });
  } catch (error) {
    console.error("Error creating destinations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:destinationId", async (req, res) => {
  const destinationId = req.params.destinationId;

  try {
    const query = {
      text: `
          SELECT * FROM "Destination" WHERE id = $1;
        `,
      values: [destinationId],
    };
    const result = await pool.query(query);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Destination not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching destination:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
