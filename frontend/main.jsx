import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';

const App = () => {
  const [deployments, setDeployments] = useState([]);
  const [apiUrl, setApiUrl] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    fetch('/config.json')
      .then(res => res.json())
      .then(cfg => setApiUrl(cfg.API_URL))
      .catch(err => console.error('Failed to load config.json', err));
  }, []);

  useEffect(() => {
    if (!apiUrl) return;
    const fetchData = () => {
      axios.get(`${apiUrl}/deployments`)
        .then(res => setDeployments(res.data))
        .catch(err => console.error(err));
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [apiUrl]);

  if (!apiUrl) return <p>Loading config...</p>;

  const matrix = {};
  const updatedMap = {};

  deployments.forEach(d => {
    if (!matrix[d.app]) matrix[d.app] = {};
    if (!updatedMap[d.app] || new Date(updatedMap[d.app]) < new Date(d.deployed_at)) {
      updatedMap[d.app] = d.deployed_at;
    }
    if (!matrix[d.app][d.environment] || new Date(matrix[d.app][d.environment].deployed_at) < new Date(d.deployed_at)) {
      matrix[d.app][d.environment] = d;
    }
  });

  const allEnvironments = [...new Set(deployments.map(d => d.environment))].sort();

  const handleAppClick = (app) => {
    setSelectedApp(prev => (prev === app ? null : app));
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${apiUrl}/deployments/${id}`);
      setDeployments(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>DeployTrail</h1>

      <h2>Latest Versions per App</h2>
      <table border="1" cellPadding="6" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>App</th>
            {allEnvironments.map(env => <th key={env}>{env}</th>)}
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(matrix).map(([app, envMap], i) => {
            const versions = Object.values(envMap).map(d => d.version);
            const allSame = versions.length > 0 && versions.every(v => v === versions[0]);
            return (
              <tr key={i}>
                <td><a href="#" onClick={() => handleAppClick(app)}>{app}</a></td>
                {allEnvironments.map(env => (
                  <td key={env} style={{ color: allSame ? 'green' : 'red' }}>
                    {envMap[env]?.version || '-'}
                  </td>
                ))}
                <td>{new Date(updatedMap[app]).toLocaleString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {selectedApp && (
        <>
          <h2>Deployment History for {selectedApp}</h2>
          <table border="1" cellPadding="6" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Environment</th>
                <th>Version</th>
                <th>Note</th>
                <th>Deployed At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deployments.filter(d => d.app === selectedApp).map((d, i) => (
                <tr key={i}>
                  <td>{d.environment}</td>
                  <td>{d.version}</td>
                  <td>{d.note || '-'}</td>
                  <td>{new Date(d.deployed_at).toLocaleString()}</td>
                  <td>
                    <button onClick={() => handleDelete(d.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);