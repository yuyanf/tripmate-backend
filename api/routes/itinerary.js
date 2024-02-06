const express = require("express");
const router = express.Router();
const pool = require("../db");

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

router.get("/:id", async (req, res) => {
  const itineraryId = req.params.id;

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
