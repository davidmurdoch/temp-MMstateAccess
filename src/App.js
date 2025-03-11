import React from 'react';
import JsonViewer from './JsonViewer';
import './App.css';
import data from './data.json';

function App() {
  const originalObj = data.value;
  const accessLog = data.log;

  return (
    <div className="App">
      <JsonViewer obj={originalObj} accessLog={accessLog} />
    </div>
  );
}

export default App;