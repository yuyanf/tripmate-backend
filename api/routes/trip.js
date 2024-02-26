const express = require("express");
const router = express.Router();
const pool = require("../db");

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

router.post("/", async (req, res) => {
  const {
    title,
    startDate,
    endDate,
    userId,
    items,
    numberOfPeople,
    relationship,
    totalBudget,
    editors,
    status,
  } = req.body;

  try {
    const query = {
      text: `
          INSERT INTO "Trip" (title, startDate, endDate, userId, items, numberOfPeople, relationship, totalBudget, editors, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,$10)
          RETURNING *;
        `,
      values: [
        title,
        startDate,
        endDate,
        userId,
        items,
        numberOfPeople,
        relationship,
        totalBudget,
        editors,
        status,
      ],
    };
    const result = await pool.query(query);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating itinerary:", error);
    res.status(500).json({ error: "can't create trip" });
  }
});

// PUT endpoint to update a Trip
router.put("/:tripId", async (req, res) => {
  const tripId = parseInt(req.params.tripId);
  const updatedTripData = req.body;

  try {
    // Check if the Trip exists
    const existingTrip = await prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (!existingTrip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    // Update the Trip record
    const updatedTrip = await prisma.trip.update({
      where: { id: tripId },
      data: updatedTripData,
    });

    res.status(200).json(updatedTrip);
  } catch (error) {
    console.error("Error updating trip:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:tripId", async (req, res) => {
  const tripId = req.params.tripId;

  try {
    const query = {
      text: `
          SELECT * FROM "Trip" WHERE id = $1;
        `,
      values: [tripId],
    };
    const result = await pool.query(query);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Trip not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching trip:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
