const crypto = require("crypto");
const functions = require("firebase-functions");

// Function to generate a challenge
exports.generateChallenge = functions.https.onRequest((req, res) => {
  const challenge = crypto.randomBytes(32).toString("base64");
  res.json({challenge});
});
