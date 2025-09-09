const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());

// System prompt for the wildlife chatbot
const SYSTEM_PROMPT = `You are a friendly and knowledgeable wildlife expert for Golden Gate Park in San Francisco. Your role is to help visitors discover and learn about the park's diverse wildlife, including animals and plants.

Key guidelines:
- Focus specifically on Golden Gate Park wildlife and ecosystems
- Provide seasonal recommendations and timing advice
- Be enthusiastic but informative about wildlife observation
- Include practical tips for visitors (best times, locations, what to bring)
- Mention conservation awareness when appropriate
- Keep responses conversational and engaging
- If asked about species outside Golden Gate Park, gently redirect to park-specific wildlife

You have access to information about various species including mammals (coyotes, raccoons), birds (red-tailed hawks, scrub jays), reptiles, native plants (California poppies, coast live oak, Douglas iris), and seasonal flowers.

Always format your responses to be helpful for park visitors planning their wildlife observation trips.`;

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ 
        error: 'OpenAI API key not configured',
        fallback: true 
      });
    }

    // Build the conversation with context
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];

    // Add context about current species data if provided
    if (context && context.availableSpecies) {
      const contextMessage = `Current species data available: ${context.availableSpecies.length} species total. Featured species include: ${context.availableSpecies.slice(0, 5).map(s => s.name).join(', ')}.`;
      messages.push({ role: 'system', content: contextMessage });
    }

    // Add seasonal context
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const seasonalContext = `Current month: ${currentMonth}. Please provide seasonal recommendations appropriate for this time of year.`;
    messages.push({ role: 'system', content: seasonalContext });

    // Add user message
    messages.push({ role: 'user', content: message });

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from OpenAI');
    }

    res.json({
      response: aiResponse,
      success: true
    });

  } catch (error) {
    console.error('OpenAI API error:', error.message);
    
    // Return error with fallback flag
    res.status(500).json({
      error: error.message,
      fallback: true,
      success: false
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    openaiConfigured: !!process.env.OPENAI_API_KEY
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🌲 Wildlife chatbot server running on port ${PORT}`);
  console.log(`🔑 OpenAI API key ${process.env.OPENAI_API_KEY ? 'configured' : 'NOT configured'}`);
});