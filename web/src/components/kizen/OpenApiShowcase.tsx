import React, { useState } from "react";
import { FileCode2, Container, Terminal, Copy, Check } from "lucide-react";

export function OpenApiShowcase() {
  const [activeTab, setActiveTab] = useState<"openapi" | "docker" | "cli">("openapi");
  const [copied, setCopied] = useState(false);

  const snippets = {
    openapi: `# api/openapi.yaml
openapi: 3.1.0
info:
  title: Kizen API
  version: 1.0.0
  description: Single-tenant freelance project manager and time-tracker.
paths:
  /workspaces:
    post:
      summary: Create a new workspace
      operationId: createWorkspace
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateWorkspaceRequest'
      responses:
        '201':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Workspace'
        '400':
          $ref: '#/components/responses/BadRequest'`,
    docker: `# docker-compose.yaml
version: "3.9"
services:
  kizen-server:
    image: ghcr.io/samraina/kizen:v1.0.0
    container_name: kizen-app
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      - KIZEN_DB_DRIVER=sqlite
      - KIZEN_DB_PATH=/data/kizen.db
      - KIZEN_PORT=8080
    volumes:
      - kizen_data:/data

volumes:
  kizen_data:
    driver: local`,
    cli: `# 1. Create a workspace with a custom hourly rate
curl -X POST http://localhost:8080/api/v1/workspaces \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Stripe Infrastructure Consulting",
    "default_hourly_rate": 175,
    "description": "Payment intent migration & webhook resilience"
  }'

# 2. Response adheres to RFC 9457 / OpenAPI 3.1 schema
# HTTP/1.1 201 Created`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto rounded-xl border border-white/10 bg-[#0c0f16] shadow-2xl overflow-hidden text-left">
      <div className="flex items-center justify-between px-4 py-3 bg-[#11151f] border-b border-white/10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("openapi")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
              activeTab === "openapi"
                ? "bg-[var(--brand-accent)] text-black font-semibold"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <FileCode2 size={13} />
            <span>OpenAPI 3.1 Spec</span>
          </button>
          <button
            onClick={() => setActiveTab("docker")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
              activeTab === "docker"
                ? "bg-[var(--brand-accent)] text-black font-semibold"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Container size={13} />
            <span>Docker Compose</span>
          </button>
          <button
            onClick={() => setActiveTab("cli")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
              activeTab === "cli"
                ? "bg-[var(--brand-accent)] text-black font-semibold"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Terminal size={13} />
            <span>cURL & Automation</span>
          </button>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-mono border border-white/10 cursor-pointer"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>

      <div className="p-4 sm:p-5 bg-[#080a0f] overflow-x-auto">
        <pre className="font-mono text-xs text-gray-300 leading-relaxed tabular-nums">
          <code>{snippets[activeTab]}</code>
        </pre>
      </div>
    </div>
  );
}
