import React, { useState, useEffect } from 'react';
import { WildlifeSpecies } from '../types/Wildlife';
import { wildlifeDataService } from '../services/wildlifeDataService';
import { openaiService } from '../services/openaiService';
import { useMap } from '../contexts/MapContext';
import './ChatbotSection.css';

interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  detectedSpecies?: WildlifeSpecies[];
  showMoreInfoButton?: boolean;
}

const ChatbotSection: React.FC = () => {
  const { addSpeciesToMap, showSpeciesModal } = useMap();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Welcome to Golden Gate Park! 🌲 I'm your AI-powered wildlife guide. I can help you discover animals and plants, provide seasonal recommendations, and give you tips for the best wildlife observation experiences. Ask me anything!",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [availableSpecies, setAvailableSpecies] = useState<WildlifeSpecies[]>([]);
  const [isLoadingSpecies, setIsLoadingSpecies] = useState(true);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [useOpenAI, setUseOpenAI] = useState(true);

  useEffect(() => {
    loadAvailableSpecies();
  }, []);

  const loadAvailableSpecies = async () => {
    try {
      setIsLoadingSpecies(true);
      const species = await wildlifeDataService.getAllSpecies();
      setAvailableSpecies(species);
    } catch (error) {
      console.error('Failed to load species for chatbot:', error);
    } finally {
      setIsLoadingSpecies(false);
    }
  };

  // Get current month for seasonal recommendations
  const getCurrentMonth = () => new Date().getMonth() + 1;

  // Detect species mentioned in text
  const detectSpeciesInText = (text: string): WildlifeSpecies[] => {
    const detectedSpecies: WildlifeSpecies[] = [];
    const lowerText = text.toLowerCase();
    
    availableSpecies.forEach(species => {
      const speciesName = species.name.toLowerCase();
      const scientificName = species.scientificName.toLowerCase();
      
      // Check if species name or scientific name is mentioned
      if (lowerText.includes(speciesName) || lowerText.includes(scientificName)) {
        detectedSpecies.push(species);
      }
    });
    
    return detectedSpecies;
  };

  // Handle "More Info" button click
  const handleMoreInfoClick = (species: WildlifeSpecies[]) => {
    // Add all species to map
    species.forEach(s => addSpeciesToMap(s));
    
    // Show modal with all species for navigation
    setTimeout(() => {
      showSpeciesModal(species);
    }, 100);
  };

  // Find species based on user query using the data service
  const findSpecies = async (query: string): Promise<WildlifeSpecies[]> => {
    try {
      return await wildlifeDataService.searchSpecies({ query });
    } catch (error) {
      console.error('Species search failed:', error);
      // Fallback to local search if service fails
      const searchTerm = query.toLowerCase();
      return availableSpecies.filter(species =>
        species.name.toLowerCase().includes(searchTerm) ||
        species.scientificName.toLowerCase().includes(searchTerm) ||
        species.category.toLowerCase().includes(searchTerm) ||
        species.description.toLowerCase().includes(searchTerm)
      );
    }
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

  // Generate AI-powered response using OpenAI
  const generateAIResponse = async (userMessage: string): Promise<{ response: string; detectedSpecies: WildlifeSpecies[] }> => {
    try {
      const context = {
        availableSpecies,
        currentMonth: getCurrentMonth(),
      };

      const result = await openaiService.sendChatMessage(userMessage, context);
      
      if (result.success && result.response) {
        const detectedSpecies = detectSpeciesInText(result.response);
        return { response: result.response, detectedSpecies };
      } else if (result.fallback) {
        // Fall back to local responses if OpenAI fails
        console.warn('Falling back to local responses:', result.error);
        const localResponse = await generateLocalResponse(userMessage);
        return { response: localResponse, detectedSpecies: [] };
      } else {
        throw new Error(result.error || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('AI response error:', error);
      const localResponse = await generateLocalResponse(userMessage);
      return { response: localResponse, detectedSpecies: [] };
    }
  };

  // Original local response generation (now as fallback)
  const generateLocalResponse = async (userMessage: string): Promise<string> => {
    const message = userMessage.toLowerCase();

    // Handle greetings
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      const dataStats = wildlifeDataService.getDataStats();
      return `Hello! I'm your Golden Gate Park wildlife guide powered by ${dataStats.isUsingAPI ? 'live iNaturalist community observations' : 'our local species database'}. I have access to ${dataStats.total} species. Ask me about specific animals or plants, seasonal timing, or recent observations!`;
    }

    // Handle data status questions
    if (message.includes('data') || (message.includes('how many') && message.includes('species'))) {
      const stats = wildlifeDataService.getDataStats();
      return `I currently have access to ${stats.total} species in Golden Gate Park! ${stats.isUsingAPI ? 
        `This includes ${stats.apiSpecies} species from recent iNaturalist community observations` : 
        'Using our curated local database'
      }${stats.apiSpecies > 0 && stats.localSpecies > 0 ? ` plus ${stats.localSpecies} additional species from our local collection` : ''}. ${
        stats.isUsingFallback ? 'Currently offline - showing cached and local data.' : 'Data is live and up to date!'
      }`;
    }

    // Handle general park questions
    if (message.includes('park') && (message.includes('what') || message.includes('tell'))) {
      const seasonalSpecies = await wildlifeDataService.getSeasonalSpecies();
      const stats = wildlifeDataService.getDataStats();
      return `Golden Gate Park hosts an incredible diversity of wildlife! ${stats.isUsingAPI ? 
        'Based on recent community observations, ' : ''
      }you can find everything from birds and mammals to native plants and seasonal flowers. This month, ${seasonalSpecies.length} species are in their peak season. What specific wildlife are you looking for?`;
    }

    // Handle seasonal questions
    if (message.includes('season') || message.includes('time') || message.includes('when')) {
      const seasonalSpecies = await wildlifeDataService.getSeasonalSpecies();
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const currentMonth = monthNames[getCurrentMonth() - 1];
      const stats = wildlifeDataService.getDataStats();

      if (seasonalSpecies.length > 0) {
        const featuredSpecies = seasonalSpecies.slice(0, 3);
        const speciesNames = featuredSpecies.map(s => s.name).join(', ');
        return `Great question! This ${currentMonth}, ${seasonalSpecies.length} species are in their peak season, including: ${speciesNames}${seasonalSpecies.length > 3 ? ', and more!' : '!'} ${stats.isUsingAPI ? 'Based on recent community observations, these are the most active species right now.' : ''} Ask me about any specific species for detailed timing and location tips.`;
      } else {
        return `This ${currentMonth}, wildlife activity varies by species. ${stats.isUsingAPI ? 'Based on community observations, ' : ''}ask me about a specific animal or plant and I'll tell you the best times to see them!`;
      }
    }

    // Handle popular/trending questions
    if (message.includes('popular') || message.includes('trending') || message.includes('recent') || message.includes('spotted')) {
      try {
        const popularSpecies = await wildlifeDataService.getPopularSpecies(5);
        if (popularSpecies.length > 0) {
          const speciesNames = popularSpecies.slice(0, 3).map(s => s.name).join(', ');
          const stats = wildlifeDataService.getDataStats();
          return `${stats.isUsingAPI ? 'Recently popular species based on community observations' : 'Featured species'} include: ${speciesNames}${popularSpecies.length > 3 ? ', and more!' : '!'} These have been frequently spotted by park visitors. Ask me about any specific species for more details!`;
        }
      } catch (error) {
        console.warn('Failed to get popular species:', error);
      }
      return "I can help you discover what wildlife is currently active in the park. Ask me about specific animals or plants, or try asking about seasonal species!";
    }

    // Search for specific species
    if (isLoadingSpecies) {
      return "I'm still loading species data. Please wait a moment and try again!";
    }

    const foundSpecies = await findSpecies(message);

    if (foundSpecies.length === 0) {
      const randomSpecies = await wildlifeDataService.getFeaturedSpecies(3);
      const suggestions = randomSpecies.map(s => s.name).join(', ');
      return `I couldn't find any wildlife matching your search. Try asking about: ${suggestions}, or describe what type of animal or plant you're looking for!`;
    }

    if (foundSpecies.length === 1) {
      const species = foundSpecies[0];
      const recommendation = getSeasonalRecommendation(species);
      const isFromAPI = species.id.startsWith('inat-');
      
      // Add species to map and show modal
      addSpeciesToMap(species);
      setTimeout(() => {
        showSpeciesModal(species);
      }, 100);
      
      return `🌟 **${species.name}** (*${species.scientificName}*)

${recommendation}

**Location**: ${species.location.area}
**Habitat**: ${species.habitat}
**Type**: ${species.category} ${species.type}
**Conservation**: ${species.conservationStatus}

${species.description}${isFromAPI ? '\n\n📱 *Data from iNaturalist community observations*' : ''}

📍 *I've added this species to the map and opened its details!*`;
    }

    // Multiple species found - add them all to the map
    foundSpecies.forEach(species => {
      addSpeciesToMap(species);
    });
    
    const speciesNames = foundSpecies.map(s => s.name).slice(0, 3).join(', ');
    const inSeasonCount = foundSpecies.filter(isInSeason).length;

    return `I found ${foundSpecies.length} species matching your search: ${speciesNames}${foundSpecies.length > 3 ? ', and more' : ''}. ${inSeasonCount} of them are currently in season! Ask me about a specific one for detailed seasonal information.

📍 *I've added all ${foundSpecies.length} matching species to the map - click any pin to learn more!*`;
  };

  // Main response generation function - chooses between AI and local
  const generateResponse = async (userMessage: string): Promise<{ response: string; detectedSpecies: WildlifeSpecies[] }> => {
    if (useOpenAI) {
      return await generateAIResponse(userMessage);
    } else {
      const localResponse = await generateLocalResponse(userMessage);
      return { response: localResponse, detectedSpecies: [] };
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isGeneratingResponse) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsGeneratingResponse(true);

    try {
      // Generate bot response
      const result = await generateResponse(currentInput);
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: result.response,
        isBot: true,
        timestamp: new Date(),
        detectedSpecies: result.detectedSpecies,
        showMoreInfoButton: result.detectedSpecies.length > 0 && useOpenAI
      };

      setTimeout(() => {
        setMessages(prev => [...prev, botMessage]);
        setIsGeneratingResponse(false);
      }, 500);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble processing your request right now. Please try again later.",
        isBot: true,
        timestamp: new Date()
      };
      
      setTimeout(() => {
        setMessages(prev => [...prev, errorMessage]);
        setIsGeneratingResponse(false);
      }, 500);
    }
  };


  return (
    <div className="chatbot-section">
      <div className="chatbot-header">
        <div className="header-content">
          <h3>Ask the Wildlife Expert</h3>
          <p>Get seasonal recommendations and location tips</p>
        </div>
        <div className="ai-toggle">
          <label>
            <input
              type="checkbox"
              checked={useOpenAI}
              onChange={(e) => setUseOpenAI(e.target.checked)}
            />
            AI-powered responses
          </label>
        </div>
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
              {message.showMoreInfoButton && message.detectedSpecies && message.detectedSpecies.length > 0 && (
                <div className="more-info-container">
                  <button
                    className="more-info-button"
                    onClick={() => handleMoreInfoClick(message.detectedSpecies!)}
                  >
                    🔍 Learn more about {
                      message.detectedSpecies.length === 1 
                        ? message.detectedSpecies[0].name
                        : `${message.detectedSpecies.length} species`
                    }
                  </button>
                </div>
              )}
              <div className="message-time">
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          ))}
          {isGeneratingResponse && (
            <div className="message bot-message">
              <div className="message-content typing-indicator">
                <span>AI is thinking...</span>
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="chat-input-container">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask about wildlife in Golden Gate Park..."
            className="chat-input"
          />
          <button
            onClick={handleSendMessage}
            className="send-button"
            disabled={!inputValue.trim() || isGeneratingResponse}
          >
            {isGeneratingResponse ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>

      <div className="quick-suggestions">
        <h4>Try asking about:</h4>
        <div className="suggestion-chips">
          {availableSpecies.length > 0 ? (
            availableSpecies.slice(0, 4).map(species => (
              <span
                key={species.id}
                className="suggestion-chip"
                onClick={async () => {
                  if (isGeneratingResponse) return;
                  
                  const userMessage: ChatMessage = {
                    id: Date.now().toString(),
                    text: species.name,
                    isBot: false,
                    timestamp: new Date()
                  };
                  setMessages(prev => [...prev, userMessage]);
                  setIsGeneratingResponse(true);
                  
                  try {
                    const result = await generateResponse(species.name);
                    const botMessage: ChatMessage = {
                      id: (Date.now() + 1).toString(),
                      text: result.response,
                      isBot: true,
                      timestamp: new Date(),
                      detectedSpecies: result.detectedSpecies,
                      showMoreInfoButton: result.detectedSpecies.length > 0 && useOpenAI
                    };
                    
                    setTimeout(() => {
                      setMessages(prev => [...prev, botMessage]);
                      setIsGeneratingResponse(false);
                    }, 500);
                  } catch (error) {
                    console.error('Error generating response:', error);
                    setTimeout(() => {
                      setIsGeneratingResponse(false);
                    }, 500);
                  }
                }}
              >
                {species.name}
              </span>
            ))
          ) : (
            <>
              <span className="suggestion-chip">Loading species...</span>
            </>
          )}
        </div>
        {!isLoadingSpecies && availableSpecies.length > 0 && (
          <div className="data-info">
            <small>
              {wildlifeDataService.getDataStats().total} species available
              {wildlifeDataService.getDataStats().isUsingFallback ? ' (offline mode)' : ''}
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatbotSection;
