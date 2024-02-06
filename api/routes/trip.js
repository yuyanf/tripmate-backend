const express = require("express");
const router = express.Router();
const pool = require("../db");

router.post("/", async (req, res) => {
  const {
    title,
    startDate,
    endDate,
    items,
    image,
    numberOfPeople,
    relationship,
    totalBudget,
    editors,
  } = req.body;

  try {
    const query = {
      text: `
          INSERT INTO "Trip" (title, startDate, endDate, items, image, numberOfPeople, relationship, totalBudget, editors)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *;
        `,
      values: [
        title,
        startDate,
        endDate,
        items,
        image,
        numberOfPeople,
        relationship,
        totalBudget,
        editors,
      ],
    };
    const result = await pool.query(query);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating itinerary:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  const tripId = req.params.id;

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
