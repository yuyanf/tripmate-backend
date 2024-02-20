const { gql } = require("apollo-server-express");
const pool = require("./db");

const typeDefs = gql`
  type User {
    id: Int
    firstName: String
    lastName: String
    email: String
    items: [Trip]
    createdAt: String
    updatedAt: String
  }

  type Trip {
    id: Int
  }

  type Query {
    getUserById(id: Int!): User
  }
`;

const resolvers = {
  Query: {
    getUserById: async (_, { id }) => {
      try {
        // Query the database to fetch user by ID
        const client = await pool.connect();
        const queryText = `SELECT * FROM "User" WHERE id = $1`;
        const result = await client.query(queryText, [id]);
        client.release();

        // Check if user with the provided ID exists
        if (result.rows.length === 0) {
          throw new Error("User not found");
        }

        // Return the user information
        return result.rows[0];
      } catch (error) {
        console.error("Error fetching user by ID:", error);
        throw error;
      }
    },
  },
};

module.exports = {
  typeDefs,
  resolvers,
};
