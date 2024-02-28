const express = require("express");
const router = express.Router();
const pool = require("../db");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
router.post("/", async (req, res) => {
  const { date, items, checkList, destinationId } = req.body;

  try {
    const query = {
      text: `
          INSERT INTO "Itinerary" (date, items, checkList, destination_id)
          VALUES ($1, $2, $3, $4)
          RETURNING *;
        `,
      values: [date, items, checkList, destinationId],
    };
    const result = await pool.query(query);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating itinerary:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/bulk_itineraries", async (req, res) => {
  const itineraries = req.body; // Array of itinerary data objects
  const createdItineraries = [];

  try {
    if (!Array.isArray(itineraries)) {
      return res
        .status(400)
        .json({ error: "Request body must be an array of itineraries" });
    }

    for (const item of itineraries) {
      const { destinationId, dates } = item;
      if (!destinationId) {
        return res.status(400).json({ error: "Missing destination Id" });
      }

      // Iterate over dates array
      for (const date of dates) {
        if (!date) {
          return res.status(400).json({ error: "Missing date" });
        }
        // Create itinerary object for each date
        const createdItinerary = await prisma.itinerary.create({
          data: {
            destinationId: destinationId,
            date: date,
          },
        });
        createdItineraries.push(createdItinerary);
      }
    }
    res.status(201).json({
      message: "Itineraries created successfully",
      itineraries: createdItineraries,
    });
  } catch (error) {
    console.error("Error creating itineraries:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:itineraryId", async (req, res) => {
  const itineraryId = req.params.itineraryId;

  try {
    const query = {
      text: `
          SELECT * FROM "Itinerary" WHERE id = $1;
        `,
      values: [itineraryId],
    };
    const result = await pool.query(query);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Itinerary not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching itinerary:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
