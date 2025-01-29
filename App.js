import './App.css';
import Grid from './Grid.js';

// Usage example
const App = () => {
  const savedConnections = [
    {
      "from": "WWW Endpoint",
      "to": "Firewall",
      "path": "13,8 → 14,10"
    },
    {
      "from": "Firewall",
      "to": "Server",
      "path": "14,10 → 17,10"
    },
    {
      "from": "Server",
      "to": "Database",
      "path": "17,10 → 19,11"
    }
  ];

  return <Grid initialSavedConnections={savedConnections} />;
};

export default App;