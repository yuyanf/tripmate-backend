const express = require("express");
const pool = require("../db");

const router = express.Router();

// Route for fetching cities
router.get("/", async (req, res) => {
  try {
    console.log("get matched cities");
    const query = {
      text: `SELECT * FROM "City"`,
    };
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching cities:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
