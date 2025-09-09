import React from 'react';
import './App.css';
import MapSection from './components/MapSection';
import ChatbotSection from './components/ChatbotSection';
import { MapProvider } from './contexts/MapContext';

function App() {
  return (
    <MapProvider>
      <div className="App">
        <header className="app-header">
          <h1>The WildLIFE</h1>
          <p>Explore animals and plants in San Francisco's iconic park</p>
        </header>
        <div className="app-container">
          <MapSection />
          <ChatbotSection />
        </div>
      </div>
    </MapProvider>
  );
}

export default App;
