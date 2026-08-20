import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

interface CodeSnippetProps {
  emailSample?: string;
}

export const CodeSnippet: React.FC<CodeSnippetProps> = ({ emailSample = "alex@example.com" }) => {
  const [activeLang, setActiveLang] = useState<"curl" | "javascript" | "python" | "node">("curl");
  const [copied, setCopied] = useState(false);

  const getSnippet = () => {
    switch (activeLang) {
      case "curl":
        return `curl -X POST "https://mailverify.workers.dev/api/verify" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "${emailSample}"}'`;
      case "javascript":
        return `const response = await fetch('https://mailverify.workers.dev/api/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: '${emailSample}' })
});
const result = await response.json();
console.log(result.data.verdict, result.data.score);`;
      case "python":
        return `import requests

res = requests.post(
    "https://mailverify.workers.dev/api/verify",
    json={"email": "${emailSample}"}
)
data = res.json()
print("Verdict:", data["data"]["verdict"], "Score:", data["data"]["score"])`;
      case "node":
        return `import { request } from 'undici';

const { body } = await request('https://mailverify.workers.dev/api/verify', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: '${emailSample}' })
});
const data = await body.json();
console.log(data);`;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-container">
      <div className="code-header">
        <div className="code-tabs">
          {(["curl", "javascript", "python", "node"] as const).map((lang) => (
            <button
              key={lang}
              className={`code-tab ${activeLang === lang ? "active" : ""}`}
              onClick={() => setActiveLang(lang)}
            >
              {lang}
            </button>
          ))}
        </div>
        <button className="btn-copy" onClick={handleCopy} title="Copy code">
          {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre className="code-block">
        <code>{getSnippet()}</code>
      </pre>
    </div>
  );
};
