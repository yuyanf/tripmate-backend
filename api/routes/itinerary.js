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
  const itineraryDataArray = req.body; // Array of itinerary data objects

  try {
    const insertedItineraries = [];

    // Loop through the array of itinerary data objects
    for (const itineraryData of itineraryDataArray) {
      const { date, items, checkList, destinationId } = itineraryData;

      // Perform the database insertion for each itinerary
      const query = {
        text: `
          INSERT INTO "Itinerary" (date, items, checkList, destination_id)
          VALUES ($1, $2, $3, $4)
          RETURNING *;
        `,
        values: [date, items, checkList, destinationId],
      };

      const result = await pool.query(query);
      insertedItineraries.push(result.rows[0]); // Push the inserted itinerary to the array
    }

    res.status(201).json(insertedItineraries); // Return the array of inserted itineraries
  } catch (error) {
    console.error("Error creating itineraries:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/bulk_itineraries", async (req, res) => {
  const updatedItinerariesData = req.body;

  try {
    const updatedItineraries = await Promise.all(
      updatedItinerariesData.map(async (ItineraryData) => {
        const itineraryId = ItineraryData.id;
        // Update the Destination record
        const updatedItinerary = await prisma.itinerary.update({
          where: { id: itineraryId },
          data: ItineraryData,
          include: {
            items: true,
          },
        });
        return updatedItinerary;
      })
    );

    res.status(200).json(updatedItineraries);
  } catch (error) {
    console.error("Error updating itineraries:", error);
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
