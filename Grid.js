import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';

const predefinedComponents = [
  { id: 1, name: 'Database', src: './databasee.png' },
  { id: 2, name: 'Firewall', src: './firewall.png' },
  { id: 3, name: 'WWW Endpoint', src: './node.png' },
  { id: 4, name: 'Server', src: './server.png' }
];

const Grid = ({ initialSavedComponents = [] }) => {
  const containerRef = useRef(null);
  const [components, setComponents] = useState([]);
  const [startNode, setStartNode] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [draggedComponent, setDraggedComponent] = useState(null);
  const [savedComponents, setSavedComponents] = useState([]);
  const [componentIdCounter, setComponentIdCounter] = useState(1);

  // Generate 51x51 grid of nodes (50x50 squares)
  const nodes = useMemo(() => 
    Array.from({ length: 51 }, (_, x) =>
      Array.from({ length: 51 }, (_, y) => ({ x, y }))
    ).flat(),
  []);

  // Load initial configuration
  useEffect(() => {
    if (initialSavedComponents.length > 0) {
      const maxId = Math.max(...initialSavedComponents.map(c => c.component_id));
      setComponents(initialSavedComponents);
      setComponentIdCounter(maxId + 1);
    }
  }, [initialSavedComponents]);

  // Component placement handlers
  const handleComponentDragStart = (e, component) => {
    setDraggedComponent(component);
    e.dataTransfer.setData('text/plain', '');
  };

  const handleComponentDrop = (e, x, y) => {
    e.preventDefault();
    if (draggedComponent) {
      const newComponent = {
        component_id: componentIdCounter,
        component_name: draggedComponent.name,
        level: "1",
        row: x,
        column: y,
        connected_to: [],
        src: draggedComponent.src
      };

      setComponents(prev => [...prev, newComponent]);
      setComponentIdCounter(prev => prev + 1);
    }
  };

  // Connection handling
  const handleMouseMove = useCallback((event) => {
    if (!startNode || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setCurrentPosition({ x, y });
  }, [startNode]);

  const handleMouseUp = useCallback((event) => {
    if (!startNode || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find end node
    let endNode = null;
    for (const node of nodes) {
      const nodeX = node.x * 50;
      const nodeY = node.y * 50;
      const distance = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2);
      if (distance < 10) endNode = node;
    }

    if (endNode) {
      const startComponent = components.find(c => 
        c.row === startNode.x && c.column === startNode.y
      );
      const endComponent = components.find(c => 
        c.row === endNode.x && c.column === endNode.y
      );

      if (startComponent && endComponent) {
        setComponents(prev => prev.map(comp => {
          if (comp.component_id === startComponent.component_id) {
            return {
              ...comp,
              connected_to: [...new Set([...comp.connected_to, endComponent.component_id])]
            };
          }
          if (comp.component_id === endComponent.component_id) {
            return {
              ...comp,
              connected_to: [...new Set([...comp.connected_to, startComponent.component_id])]
            };
          }
          return comp;
        }));
      }
    }

    // Cleanup
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    setStartNode(null);
    setCurrentPosition(null);
  }, [startNode, nodes, handleMouseMove, components]);

  const handleNodeMouseDown = useCallback((node) => {
    setStartNode(node);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove, handleMouseUp]);

  // Component removal
  const handleNodeDoubleClick = useCallback((node) => {
    setComponents(prev => {
      const targetComponent = prev.find(c => 
        c.row === node.x && c.column === node.y
      );
      
      if (!targetComponent) return prev;
      
      return prev
        .filter(c => c.component_id !== targetComponent.component_id)
        .map(c => ({
          ...c,
          connected_to: c.connected_to.filter(id => id !== targetComponent.component_id)
        }));
    });
  }, []);

  // Save handler
  const handleSaveComponents = () => {
    setSavedComponents(components);
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div style={{ padding: '100px' }}>
      <svg
        ref={containerRef}
        width="1500"
        height="900"
        style={{ border: '1px solid #ccc' }}
      >
        {/* Connections */}
        {components.flatMap(component =>
          component.connected_to.map(connectedId => {
            const targetComponent = components.find(c => c.component_id === connectedId);
            if (!targetComponent) return null;
            
            return (
              <line
                key={`${component.component_id}-${connectedId}`}
                x1={component.row * 50}
                y1={component.column * 50}
                x2={targetComponent.row * 50}
                y2={targetComponent.column * 50}
                stroke="red"
                strokeWidth="2"
              />
            );
          })
        )}

        {/* Components */}
        {components.map((component) => (
          <foreignObject
            key={component.component_id}
            x={component.row * 50 - 20}
            y={component.column * 50 - 20}
            width="40"
            height="40"
          >
            <img
              src={component.src}
              alt={component.component_name}
              draggable
              style={{ 
                width: '40px', 
                height: '40px', 
                cursor: 'grab',
                pointerEvents: 'auto'
              }}
            />
          </foreignObject>
        ))}

        {/* Grid nodes */}
        {nodes.map((node) => (
          <g key={`${node.x}-${node.y}`}>
            <rect
              x={node.x * 50 - 25}
              y={node.y * 50 - 25}
              width="50"
              height="50"
              fill="transparent"
              onDrop={(e) => handleComponentDrop(e, node.x, node.y)}
              onDragOver={(e) => e.preventDefault()}
            />
            <circle
              cx={node.x * 50}
              cy={node.y * 50}
              r="5"
              fill="black"
              onMouseDown={() => handleNodeMouseDown(node)}
              onDoubleClick={() => handleNodeDoubleClick(node)}
              style={{ cursor: 'pointer' }}
            />
          </g>
        ))}

        {/* Temporary connection line */}
        {startNode && currentPosition && (
          <line
            x1={startNode.x * 50}
            y1={startNode.y * 50}
            x2={currentPosition.x}
            y2={currentPosition.y}
            stroke="red"
            strokeWidth="2"
          />
        )}
      </svg>

      {/* Component Palette */}
      <div style={{
        position: 'fixed',
        bottom: '0',
        left: '0',
        right: '0',
        backgroundColor: '#f0f0f0',
        padding: '10px',
        display: 'flex',
        justifyContent: 'center',
        borderTop: '2px solid #ccc',
        zIndex: 1000
      }}>
        {predefinedComponents.map((component) => (
          <img
            key={component.id}
            src={component.src}
            alt={component.name}
            draggable
            onDragStart={(e) => handleComponentDragStart(e, component)}
            onDragEnd={() => setDraggedComponent(null)}
            style={{ 
              width: '40px', 
              height: '40px', 
              cursor: 'grab', 
              margin: '0 10px' 
            }}
          />
        ))}
      </div>

      {/* Network State Display */}
      <div style={{ marginTop: '20px', top: '500px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <h3>Network State:</h3>
          <button 
            onClick={handleSaveComponents}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Save Components
          </button>
        </div>
        
        <pre>
          {JSON.stringify({
            currentComponents: components.map(comp => ({
              component_id: comp.component_id,
              component_name: comp.component_name,
              level: comp.level,
              row: comp.row,
              column: comp.column,
              connected_to: comp.connected_to
            })),
            savedComponents: savedComponents
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default Grid;
