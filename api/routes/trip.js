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
    numberOfPeople,
    relationship,
    totalBudget,
    editors,
    status,
  } = req.body;

  try {
    if (
      !title ||
      !startDate ||
      !endDate ||
      !userId ||
      !numberOfPeople ||
      !editors ||
      !status
    ) {
      // If any required field is missing, return a 400 Bad Request response
      return res.status(400).json({ error: "Missing required fields" });
    }
    const trip = await prisma.trip.create({
      data: {
        title,
        startDate,
        endDate,
        userId,
        numberOfPeople,
        relationship,
        totalBudget,
        editors,
        status,
      },
    });

    res.status(201).json(trip);
  } catch (error) {
    console.error("Error creating trip:", error);
    res.status(500).json({ error: "can't create trip" });
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
