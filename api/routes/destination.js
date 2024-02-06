const express = require("express");
const router = express.Router();
const pool = require("../db");

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

router.get("/:id", async (req, res) => {
  const destinationId = req.params.id;

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
