import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import './index.css'; // Ensure Tailwind is imported here

const App = () => {
  const [deployments, setDeployments] = useState([]);
  const [apiUrl, setApiUrl] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [appVersion, setAppVersion] = useState("dev")

  useEffect(() => {
    fetch('/config.json')
      .then(res => res.json())
      .then(cfg => {
        setApiUrl(cfg.API_URL);
        setAppVersion(cfg.VERSION || 'dev'); // fallback to 'dev'
      })
      .catch(err => {
        console.error('Failed to load config.json', err);
        setAppVersion('dev'); // fallback if file is missing or invalid
      });
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

  if (!apiUrl) return <p className="text-center mt-10">Loading config...</p>;

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
    <div className="p-6 font-sans max-w-screen-xl mx-auto">

      <h1 className="text-4xl font-bold text-center text-blue-600 mb-8">🚀 DeployTrail</h1>

      <h2 className="text-xl font-semibold mb-3">Latest Versions per App</h2>
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full text-sm border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">App</th>
              {allEnvironments.map(env => <th key={env} className="p-3 border">{env}</th>)}
              <th className="p-3 border">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(matrix).map(([app, envMap], i) => {
              const versions = Object.values(envMap).map(d => d.version);
              const allSame = versions.length > 0 && versions.every(v => v === versions[0]);
              const color = allSame ? 'text-green-600' : 'text-red-600';
              return (
                <tr key={i} className="hover:bg-gray-50 transition">
                  <td className="p-3 border font-medium">
                    <a
                      href="#"
                      className="text-blue-600 hover:underline"
                      onClick={() => handleAppClick(app)}
                    >
                      {app}
                    </a>
                  </td>
                  {allEnvironments.map(env => {
                    const version = envMap[env]?.version;
                    const allVersions = Object.values(envMap).map(d => d.version).filter(Boolean);

                    // Count most common version
                    const versionCounts = {};
                    allVersions.forEach(v => versionCounts[v] = (versionCounts[v] || 0) + 1);
                    const majorityVersion = Object.entries(versionCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

                    return (
                      <td key={env} className="p-3 border text-center">
                        {version ? (
                          <>
                            <span className="font-mono">{version}</span>{" "}
                            <span>{version === majorityVersion ? "👍" : "❌"}</span>
                          </>
                        ) : (
                          "-"
                        )}
                      </td>
                    );
                  })}

                  <td className="p-3 border text-gray-500">
                    {new Date(updatedMap[app]).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedApp && (
        <>
          <h2 className="text-xl font-semibold mb-3">
            Deployment History for <span className="text-blue-600">{selectedApp}</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 border">Environment</th>
                  <th className="p-3 border">Version</th>
                  <th className="p-3 border">Note</th>
                  <th className="p-3 border">Deployed At</th>
                  <th className="p-3 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deployments.filter(d => d.app === selectedApp).map((d, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="p-3 border">{d.environment}</td>
                    <td className="p-3 border">{d.version}</td>
                    <td className="p-3 border">{d.note || '-'}</td>
                    <td className="p-3 border">{new Date(d.deployed_at).toLocaleString()}</td>
                    <td className="p-3 border">
                      <button
                        onClick={() => handleDelete(d.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
        <footer className="mt-12 border-t pt-4 text-sm text-center text-gray-500">
        <p>
          Made with ❤️ by <a href="https://github.com/mosonyi/deploytrail" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">DeployTrail</a>
        </p>
        <p className="mt-1">
          Version <span className="font-mono bg-gray-100 px-2 py-1 rounded">{appVersion}</span>
        </p>
      </footer>
    </div>
    
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
