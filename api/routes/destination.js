const express = require("express");
const router = express.Router();
const pool = require("../db");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

router.post("/", async (req, res) => {
  const { startDate, endDate, items, cityId, tripId } = req.body;

  try {
    const query = {
      text: `
          INSERT INTO "Destination" (startDate, endDate, items, checkList, city_id, trip_id)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *;
        `,
      values: [startDate, endDate, items, cityId, tripId],
    };
    const result = await pool.query(query);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating itinerary:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/bulk_destinations", async (req, res) => {
  const destinationDataArray = req.body; // Array of itinerary data objects

  try {
    const insertedDestinations = [];

    // Loop through the array of itinerary data objects
    for (const destinationData of destinationDataArray) {
      const { startDate, endDate, items, cityId, tripId } = destinationData;

      // Perform the database insertion for each itinerary
      const query = {
        text: `
        INSERT INTO "Destination" (startDate, endDate, items, checkList, city_id, trip_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
        `,
        values: [startDate, endDate, items, cityId, tripId],
      };

      const result = await pool.query(query);
      insertedDestinations.push(result.rows[0]); // Push the inserted itinerary to the array
    }

    res.status(201).json(insertedDestinations); // Return the array of inserted itineraries
  } catch (error) {
    console.error("Error creating itineraries:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/bulk_destinations", async (req, res) => {
  const updatedDestinationsData = req.body;

  try {
    // Update the Destinations in the database
    const updatedDestinations = await Promise.all(
      updatedDestinationsData.map(async (destinationData) => {
        const destinationId = destinationData.id; // Assuming each destinationData object has an 'id' field
        // Update the Destination record
        const updatedDestination = await prisma.destination.update({
          where: { id: destinationId },
          data: destinationData, // Assuming destinationData contains updated fields
          include: {
            items: true, // Include Itineraries associated with the Destination
          },
        });
        return updatedDestination;
      })
    );

    res.status(200).json(updatedDestinations);
  } catch (error) {
    console.error("Error updating destinations:", error);
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
