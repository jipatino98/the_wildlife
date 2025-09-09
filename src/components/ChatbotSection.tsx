import React, { useState } from 'react';
import { wildlifeSpecies } from '../data/wildlifeData';
import { WildlifeSpecies } from '../types/Wildlife';
import './ChatbotSection.css';

interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const ChatbotSection: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Welcome to Golden Gate Park! 🌲 I can help you discover wildlife and tell you the best times to visit. What animals or plants are you looking for?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');

  // Get current month for seasonal recommendations
  const getCurrentMonth = () => new Date().getMonth() + 1;
  
  // Find species based on user query
  const findSpecies = (query: string): WildlifeSpecies[] => {
    const searchTerm = query.toLowerCase();
    return wildlifeSpecies.filter(species => 
      species.name.toLowerCase().includes(searchTerm) ||
      species.scientificName.toLowerCase().includes(searchTerm) ||
      species.category.toLowerCase().includes(searchTerm) ||
      species.description.toLowerCase().includes(searchTerm)
    );
  };

  // Check if species is in season
  const isInSeason = (species: WildlifeSpecies): boolean => {
    const currentMonth = getCurrentMonth();
    return species.seasonality.bestMonths.includes(currentMonth);
  };

  // Get seasonal recommendation
  const getSeasonalRecommendation = (species: WildlifeSpecies): string => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    if (isInSeason(species)) {
      return `Great news! ${species.name} is currently in season. ${species.seasonality.peakTime} is the best time to visit. ${species.seasonality.behavior}`;
    } else {
      const bestMonthsNames = species.seasonality.bestMonths
        .map(m => monthNames[m - 1])
        .join(', ');
      return `${species.name} is not currently in peak season. The best months to see them are: ${bestMonthsNames}. ${species.seasonality.behavior}`;
    }
  };

  // Generate response for user queries
  const generateResponse = async (userMessage: string): Promise<string> => {
    const message = userMessage.toLowerCase();
    
    // Handle greetings
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return "Hello! I'm your Golden Gate Park wildlife guide. Ask me about any animals or plants you'd like to find, and I'll tell you if they're in season and the best time to visit!";
    }

    // Handle general park questions
    if (message.includes('park') && (message.includes('what') || message.includes('tell'))) {
      return "Golden Gate Park hosts nearly 53 mammal species, 250 bird species, 20 reptile species, and over 750 plant species! You can find everything from coyotes and red-tailed hawks to California poppies and coast live oaks. What specific wildlife are you looking for?";
    }

    // Search for specific species
    const foundSpecies = findSpecies(message);
    
    if (foundSpecies.length === 0) {
      return "I couldn't find any wildlife matching your search. Try asking about animals like coyotes, red-tailed hawks, or California scrub jays, or plants like California poppies, coast live oak, or Douglas iris.";
    }

    if (foundSpecies.length === 1) {
      const species = foundSpecies[0];
      const recommendation = getSeasonalRecommendation(species);
      return `🌟 **${species.name}** (*${species.scientificName}*)

${recommendation}

**Location**: ${species.location.area}
**Habitat**: ${species.habitat}
**Type**: ${species.category} ${species.type}

${species.description}`;
    }

    // Multiple species found
    const speciesNames = foundSpecies.map(s => s.name).slice(0, 3).join(', ');
    const inSeasonCount = foundSpecies.filter(isInSeason).length;
    
    return `I found ${foundSpecies.length} species matching your search: ${speciesNames}${foundSpecies.length > 3 ? ', and more' : ''}. ${inSeasonCount} of them are currently in season! Ask me about a specific one for detailed seasonal information.`;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Generate bot response
    const botResponse = await generateResponse(inputValue);
    const botMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: botResponse,
      isBot: true,
      timestamp: new Date()
    };

    setTimeout(() => {
      setMessages(prev => [...prev, botMessage]);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="chatbot-section">
      <div className="chatbot-header">
        <h3>Ask the Wildlife Expert</h3>
        <p>Get seasonal recommendations and location tips</p>
      </div>
      
      <div className="chatbot-container">
        <div className="chat-messages">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`message ${message.isBot ? 'bot-message' : 'user-message'}`}
            >
              <div className="message-content">
                {message.text}
              </div>
              <div className="message-time">
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          ))}
        </div>
        
        <div className="chat-input-container">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about wildlife in Golden Gate Park..."
            className="chat-input"
          />
          <button 
            onClick={handleSendMessage}
            className="send-button"
            disabled={!inputValue.trim()}
          >
            Send
          </button>
        </div>
      </div>
      
      <div className="quick-suggestions">
        <h4>Try asking about:</h4>
        <div className="suggestion-chips">
          <span className="suggestion-chip">Coyotes</span>
          <span className="suggestion-chip">California Poppies</span>
          <span className="suggestion-chip">Red-tailed Hawks</span>
          <span className="suggestion-chip">Coast Live Oak</span>
        </div>
      </div>
    </div>
  );
};

export default ChatbotSection;