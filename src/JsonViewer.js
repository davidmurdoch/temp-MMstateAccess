import React, { useState } from 'react';
import { JSONTree } from 'react-json-tree';

function JsonViewer({ obj, accessLog }) {
  const [filter, setFilter] = useState('all');
  const [selectedStackTraces, setSelectedStackTraces] = useState(null);

  const transformObject = (obj, accessLog, path = '') => {
    if (typeof obj !== 'object' || obj === null) {
      const fullPath = path;
      const accessCount = accessLog[fullPath] ? accessLog[fullPath] : 0;
      return { value: obj, accessed: accessCount };
    }

    const transformed = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
      const newPath = path ? `${path}.${key}` : key;
      transformed[key] = transformObject(obj[key], accessLog, newPath);
    }
    const accessCount = accessLog[path] ? accessLog[path] : 0;
    return { value: transformed, accessed: accessCount };
  };

  const filterObject = (obj, accessLog, path = '') => {
    if (!obj || typeof obj !== 'object' || !('value' in obj)) {
      return obj;
    }

    const { value } = obj;
    if (typeof value !== 'object' || value === null) {
      return obj;
    }

    const filteredValue = Array.isArray(value) ? [] : {};
    for (const key in value) {
      const newPath = path ? `${path}.${key}` : key;
      const isAccessedOrHasAccessedDescendant = Object.keys(accessLog).some(
        p => ((p === newPath || p.startsWith(newPath + '.')) && accessLog[p] > 1)
      );
      if (filter === 'all' || (filter === 'accessed' && isAccessedOrHasAccessedDescendant)) {
        filteredValue[key] = filterObject(value[key], accessLog, newPath);
      }
    }
    return { ...obj, value: filteredValue };
  };

  const valueRenderer = (rawValue, node, keyPath) => {
    if (keyPath[keyPath.length - 1] === 'accessed' && typeof rawValue === 'number' && rawValue > 0) {
      const fullPath = keyPath.slice(1, -1).reverse().join('.');
      const stackTraces = accessLog[fullPath] || [];
      return (
        <span
          style={{ color: 'green', cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedStackTraces(stackTraces);
          }}
        >
          {rawValue}
        </span>
      );
    }
    return rawValue;
  };

  const transformedObj = transformObject(obj, accessLog);
  const displayedObj = filterObject(transformedObj, accessLog);

  return (
    <div style={{ padding: '20px' }}>
      <h2>JSON Trace Explorer</h2>
      <div>
        <label>Filter: </label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Show All</option>
          <option value="accessed">Show Only Accessed</option>
        </select>
      </div>
      <div style={{ marginTop: '20px' }}>
        <JSONTree
          data={displayedObj}
          valueRenderer={valueRenderer}
          theme={{
            scheme: 'monokai',
            base00: '#272822',
            base0B: '#a6e22e'
          }}
          invertTheme={false}
        />
      </div>
      {selectedStackTraces && (
        <div
          style={{
            position: 'fixed',
            right: '20px',
            top: '20px',
            width: '50%',
            maxHeight: '80vh',
            background: '#fff',
            border: '1px solid #ccc',
            padding: '10px',
            overflow: 'auto',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)'
          }}
        >
          <h3>Stack Traces</h3>
          {selectedStackTraces.map((stack, index) => (
            <pre key={index} style={{ margin: '10px 0', whiteSpace: 'pre-wrap' }}>
              {stack}
            </pre>
          ))}
          <button onClick={() => setSelectedStackTraces(null)}>Close</button>
        </div>
      )}
    </div>
  );
}

export default JsonViewer;