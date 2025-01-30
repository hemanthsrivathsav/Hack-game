import './App.css';
import Grid from './Grid.js';

// Usage example
const App = () => {
  const savedComponents = [
    {
      component_id: 1,
      component_name: "WWW Endpoint",
      level: "1",
      row: 13,
      column: 8,
      connected_to: [2],
      src: "./node.png"
    },
    {
      component_id: 2,
      component_name: "Firewall",
      level: "1",
      row: 14,
      column: 10,
      connected_to: [1],
      src: "./firewall.png"
    }
  ];

  return <Grid initialSavedComponents={savedComponents} />;
};

export default App;
