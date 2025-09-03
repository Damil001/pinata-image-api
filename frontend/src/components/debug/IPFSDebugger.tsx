"use client";
import React, { useState } from "react";

const IPFSDebugger: React.FC = () => {
  const [testHash, setTestHash] = useState(
    "bafybeibabd6nrub25blghj32etakcjnjkqevk5dvlpldcpo4wn3noyvrni"
  );
  const [results, setResults] = useState<
    Array<{ gateway: string; status: string; time: number }>
  >([]);
  const [testing, setTesting] = useState(false);

  const gateways = [
    "https://copper-delicate-louse-351.mypinata.cloud/ipfs",
    "https://cloudflare-ipfs.com/ipfs",
    "https://gateway.pinata.cloud/ipfs",
    "https://ipfs.io/ipfs",
    "https://dweb.link/ipfs",
    "https://cf-ipfs.com/ipfs",
    "https://ipfs.fleek.co/ipfs",
    "https://nftstorage.link/ipfs",
  ];

  const testGateways = async () => {
    setTesting(true);
    setResults([]);

    for (const gateway of gateways) {
      const startTime = Date.now();
      const url = `${gateway}/${testHash}`;

      try {
        const response = await fetch(url, {
          method: "HEAD",
          signal: AbortSignal.timeout(10000),
        });
        const endTime = Date.now();

        setResults((prev) => [
          ...prev,
          {
            gateway: gateway.replace("https://", "").replace("/ipfs", ""),
            status: response.ok ? "✅ OK" : `❌ ${response.status}`,
            time: endTime - startTime,
          },
        ]);
      } catch (error) {
        const endTime = Date.now();
        setResults((prev) => [
          ...prev,
          {
            gateway: gateway.replace("https://", "").replace("/ipfs", ""),
            status: "❌ Failed",
            time: endTime - startTime,
          },
        ]);
      }
    }

    setTesting(false);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        background: "white",
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "16px",
        maxWidth: "400px",
        zIndex: 9999,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      }}
    >
      <h3 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>
        IPFS Gateway Tester
      </h3>

      <div style={{ marginBottom: "12px" }}>
        <input
          type="text"
          value={testHash}
          onChange={(e) => setTestHash(e.target.value)}
          placeholder="Enter IPFS hash"
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            fontSize: "12px",
          }}
        />
      </div>

      <button
        onClick={testGateways}
        disabled={testing}
        style={{
          width: "100%",
          padding: "8px",
          background: testing ? "#ccc" : "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: testing ? "not-allowed" : "pointer",
          fontSize: "12px",
        }}
      >
        {testing ? "Testing..." : "Test All Gateways"}
      </button>

      {results.length > 0 && (
        <div
          style={{ marginTop: "12px", maxHeight: "200px", overflowY: "auto" }}
        >
          <h4 style={{ margin: "0 0 8px 0", fontSize: "14px" }}>Results:</h4>
          {results.map((result, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "11px",
                padding: "2px 0",
                borderBottom: "1px solid #eee",
              }}
            >
              <span>{result.gateway}</span>
              <span>{result.status}</span>
              <span>{result.time}ms</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IPFSDebugger;
