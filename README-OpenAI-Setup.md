# OpenAI Integration Setup

This guide explains how to set up the OpenAI integration for the Wildlife Chatbot.

## Prerequisites

1. **OpenAI API Account**: Sign up at [OpenAI](https://platform.openai.com/)
2. **API Key**: Generate an API key from your OpenAI dashboard

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env and add your OpenAI API key
   OPENAI_API_KEY=your_actual_openai_api_key_here
   PORT=3001
   ```

## Running the Application

### Development Mode (Both Frontend and Backend)
```bash
npm run dev
```
This starts:
- Express server on port 3001
- React frontend on port 3000

### Individual Components
```bash
# Backend only
npm run start:server

# Frontend only  
npm start
```

## Features

### AI-Powered Responses
- Toggle between AI and local responses using the checkbox in the chatbot header
- AI responses are contextually aware of Golden Gate Park wildlife
- Includes seasonal recommendations and location-specific advice

### Fallback System
- If OpenAI API is unavailable, automatically falls back to local responses
- No loss of functionality when offline or if API key is missing

### Enhanced User Experience
- Loading indicators during AI response generation
- Typing animation while AI is processing
- Error handling with user-friendly messages

## API Endpoints

### Health Check
```
GET /api/health
```
Returns server status and OpenAI configuration status.

### Chat Completion
```
POST /api/chat
```
**Request Body:**
```json
{
  "message": "Tell me about coyotes in Golden Gate Park",
  "context": {
    "availableSpecies": [...],
    "currentMonth": 9
  }
}
```

**Response:**
```json
{
  "response": "AI-generated response about coyotes...",
  "success": true
}
```

## Configuration

### OpenAI Settings
The server uses GPT-3.5-turbo with the following configuration:
- **Max tokens**: 500
- **Temperature**: 0.7 (balanced creativity/accuracy)
- **System prompt**: Specialized for Golden Gate Park wildlife

### Environment Variables
- `OPENAI_API_KEY`: Your OpenAI API key (required)
- `PORT`: Server port (default: 3001)

## Troubleshooting

### "OpenAI API key not configured" Error
1. Check that `.env` file exists in the root directory
2. Verify `OPENAI_API_KEY` is set correctly
3. Restart the server after making changes

### Server Connection Issues
1. Ensure server is running on port 3001
2. Check for port conflicts
3. Verify CORS is properly configured

### API Rate Limits
OpenAI has rate limits based on your plan. If you hit limits:
1. The system will automatically fall back to local responses
2. Consider upgrading your OpenAI plan for higher limits
3. Monitor usage in your OpenAI dashboard

## File Structure
```
├── server.js                          # Express server with OpenAI integration
├── src/services/openaiService.ts      # Frontend API service
├── src/components/ChatbotSection.tsx  # Updated chatbot with AI integration
├── .env.example                       # Environment template
└── README-OpenAI-Setup.md            # This file
```