const express = require("express");
const cors = require("cors");
const citiesRoutes = require("./routes/cities");
const itineraryRoutes = require("./routes/itinerary");
const destinationRoutes = require("./routes/destination");
const tripRoutes = require("./routes/trip");
const { ApolloServer } = require("apollo-server-express");
const { typeDefs, resolvers } = require("./schema");
const app = express();

// Middleware to parse JSON request body
app.use(express.json());
app.use(cors());

app.use("/api/cities", citiesRoutes);

app.use("/api/itinerary", itineraryRoutes);
app.use("/api/itineraries", itineraryRoutes);
app.use("/api/bulk_itineraries", itineraryRoutes);

app.use("/api/destination", destinationRoutes);
app.use("/api/destinations", destinationRoutes);
app.use("/api/bulk_destinations", destinationRoutes);

app.use("/api/trip", tripRoutes);

app.listen(5000);

async function startApolloServer() {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start(); // <-- Start the Apollo Server instance

  const app = express();
  server.applyMiddleware({ app });

  app.listen(4000);
}

startApolloServer().catch((err) => {
  console.error("Error starting Apollo Server:", err);
});
