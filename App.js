import './App.css';
import Grid from './Grid.js';

// Usage example
const App = () => {
  const savedComponents = [
    {
      component_id: "550e8400-e29b-41d4-a716-446655440000",
      component_name: "WWW Endpoint",
      row: 13,
      column: 8,
      points:0,
      connected_to: ["550e8400-e29b-41d4-a716-446655440001"],
      src: "./node.png"
    },
    {
      component_id: "550e8400-e29b-41d4-a716-446655440001",
      component_name: "Firewall",
      row: 14,
      column: 10,
      points:10,
      connected_to: ["550e8400-e29b-41d4-a716-446655440000"],
      src: "./firewall.png"
    }
  ];

  return <Grid initialSavedComponents={savedComponents} />;
};

export default App;
