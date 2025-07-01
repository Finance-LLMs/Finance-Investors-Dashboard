const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/static", express.static(path.join(__dirname, "../dist")));

app.get("/api/signed-url", async (req, res) => {
  try {
    const { opponent, mode } = req.query;
    let agentId = process.env.AGENT_ID; // Default agent ID
      
    console.log(`Getting signed URL for opponent: ${opponent}, mode: ${mode}`);
    
    // Map opponent to specific agent ID
    if (opponent === 'michelle') {
      agentId = process.env.MICHELLE_AGENT_ID;
    } else if (opponent === 'nelson') {
      // Use different agent ID for Q&A mode vs debate mode
      if (mode === 'qna') {
        agentId = process.env.NELSON_QA_AGENT_ID;
      } else {
        agentId = process.env.NELSON_AGENT_ID;
      }
    } else if (opponent === 'taylor') {
      agentId = process.env.TAYLOR_AGENT_ID;
    } else if (opponent === 'singapore_uncle') {
      agentId = process.env.SINGAPORE_UNCLE_AGENT_ID;
    }
    
    console.log(`Using agent ID: ${agentId}`);
    
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
      {
        method: "GET",
        headers: {
          "xi-api-key": process.env.XI_API_KEY,
        },
      }
    );

    console.log(`ElevenLabs API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`ElevenLabs API error: ${errorText}`);
      throw new Error(`Failed to get signed URL: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log(`Signed URL generated successfully for agent ${agentId}`);
    res.json({ signedUrl: data.signed_url });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to get signed URL" });
  }
});

//API route for getting Agent ID, used for public agents
app.get("/api/getAgentId", (req, res) => {
  const agentId = process.env.AGENT_ID;
  res.json({
    agentId: `${agentId}`,
  });
});

// Serve index.html for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}: http://localhost:${PORT}`);
});
