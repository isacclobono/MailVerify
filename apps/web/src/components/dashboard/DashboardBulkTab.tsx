import { useState, useRef, FormEvent, ChangeEvent, DragEvent } from "react";
import { Upload, Sparkles, FileSpreadsheet, Download, Loader2, CheckCircle2, RotateCcw } from "lucide-react";
import { BulkJobSummary } from "../../types";
import { VerdictBadge } from "../VerdictBadge";
import { Pagination } from "../Pagination";
import { toast } from "sonner";

interface DashboardBulkTabProps {
  bulkInput: string;
  setBulkInput: (val: string) => void;
  bulkLoading: boolean;
  bulkError: string | null;
  bulkSummary: BulkJobSummary | null;
  onBulkSubmit: (e: FormEvent) => void;
  onLoadSamples: () => void;
  onFileUpload: (e: ChangeEvent<HTMLInputElement>) => void;
}

const BULK_PAGE_SIZE = 10;

export const DashboardBulkTab = ({
  bulkInput,
  setBulkInput,
  bulkLoading,
  bulkError,
  bulkSummary,
  onBulkSubmit,
  onLoadSamples,
  onFileUpload,
}: DashboardBulkTabProps) => {
  const [bulkPage, setBulkPage] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseEmailsFromText = (text: string): string[] => {
    const emailRegex = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = text.match(emailRegex) || [];
    return Array.from(new Set(matches.map((e) => e.trim().toLowerCase())));
  };

  const detectedEmails = parseEmailsFromText(bulkInput);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          const extracted = parseEmailsFromText(content);
          if (extracted.length > 0) {
            setBulkInput(extracted.join("\n"));
            toast.info("File Uploaded", {
              description: `Extracted ${extracted.length} valid email addresses from ${file.name}.`,
            });
          } else {
            toast.warning("No Emails Found", {
              description: "Could not parse any valid email formats in the dropped file.",
            });
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const downloadResultsCSV = () => {
    if (!bulkSummary || !bulkSummary.results) return;
    const headers = ["Email", "Verdict", "Score", "MX", "SPF", "DMARC", "Disposable", "Role", "Timestamp"];
    const rows = bulkSummary.results.map((r) => [
      r.email,
      r.verdict,
      r.score,
      r.checks.mx,
      r.checks.spf,
      r.checks.dmarc,
      r.checks.disposable,
      r.checks.role,
      r.created_at,
    ]);
    const csvContent = [headers.join(","), ...rows.map((row) => row.map((val) => `"${val}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mailverify_batch_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    toast.info("CSV Export Ready", {
      description: `Downloaded verification report containing ${bulkSummary.results.length} rows.`,
    });
  };

  const downloadResultsTXT = () => {
    if (!bulkSummary || !bulkSummary.results) return;
    const lines = bulkSummary.results.map((r) => `${r.email} [${r.verdict} - Score: ${r.score}]`);
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mailverify_batch_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    toast.info("TXT Export Ready", {
      description: `Downloaded summary text file with ${bulkSummary.results.length} entries.`,
    });
  };

  const downloadDeliverableOnlyTXT = () => {
    if (!bulkSummary || !bulkSummary.results) return;
    const deliverableOnly = bulkSummary.results
      .filter((r) => r.verdict === "LIKELY_DELIVERABLE")
      .map((r) => r.email);
    if (deliverableOnly.length === 0) {
      toast.warning("No Deliverable Emails", {
        description: "No clean deliverable email addresses found in this batch to export.",
      });
      return;
    }
    const blob = new Blob([deliverableOnly.join("\n")], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mailverify_clean_deliverable_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    toast.success("Clean List Exported", {
      description: `Saved ${deliverableOnly.length} deliverable email addresses as clean text list.`,
    });
  };

  const downloadResultsJSON = () => {
    if (!bulkSummary || !bulkSummary.results) return;
    const jsonStr = JSON.stringify(bulkSummary.results, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mailverify_batch_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    toast.info("JSON Export Ready", {
      description: `Structured JSON export created with full DNS and MX audit checks.`,
    });
  };

  return (
    <div className="card" style={{ padding: "1.75rem" }}>
      {/* Step Header Indicator */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <span className="section-eyebrow">4-STEP BATCH PIPELINE</span>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
            Bulk Email Verification Engine
          </h2>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onLoadSamples}
            style={{ fontSize: "0.76rem", padding: "0.35rem 0.7rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
          >
            <Sparkles size={13} color="var(--accent-blue)" />
            <span>Load 10 Samples</span>
          </button>
        </div>
      </div>

      {/* STEP 1: Upload & Input Area */}
      {!bulkSummary && !bulkLoading && (
        <div>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              border: isDragging ? "2px dashed var(--accent-blue)" : "2px dashed var(--border-subtle)",
              background: isDragging ? "rgba(37, 99, 235, 0.05)" : "var(--bg-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "2rem 1.5rem",
              textAlign: "center",
              marginBottom: "1.25rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={onFileUpload}
              accept=".csv,.txt,.json,.tsv"
              style={{ display: "none" }}
            />
            <div style={{ display: "inline-flex", padding: "0.75rem", background: "#ffffff", borderRadius: "50%", color: "var(--accent-blue)", marginBottom: "0.75rem", boxShadow: "var(--shadow-sm)" }}>
              <FileSpreadsheet size={24} />
            </div>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.25rem" }}>
              Drop your email list here or browse
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", margin: 0 }}>
              Supports CSV, TXT, TSV, and JSON formats up to 200 addresses per batch.
            </p>
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.4rem" }}>
              OR PASTE EMAILS MANUALLY:
            </label>
            <textarea
              className="clean-input"
              style={{ width: "100%", height: "120px", fontFamily: "var(--font-mono)", fontSize: "0.82rem", lineHeight: 1.5 }}
              placeholder={`alex@gmail.com\ncontact@stripe.com\nsales@company.org`}
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
            />
          </div>

          {bulkError && (
            <div style={{ color: "#dc2626", background: "#fef2f2", padding: "0.65rem 0.85rem", borderRadius: "var(--radius-md)", marginBottom: "1rem", fontSize: "0.82rem" }}>
              {bulkError}
            </div>
          )}

          {/* STEP 2: Detection Summary & Launch Button */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-subtle)", padding: "0.85rem 1.15rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", flexWrap: "wrap", gap: "0.75rem" }}>
            <div>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Parsed valid addresses: </span>
              <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>{detectedEmails.length}</strong>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}> / 200 limit</span>
            </div>

            <button
              type="button"
              className="btn btn-black"
              disabled={detectedEmails.length === 0}
              onClick={onBulkSubmit}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.55rem 1.15rem" }}
            >
              <Upload size={14} />
              <span>Verify {detectedEmails.length} Emails →</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Live Verification Progress Gauge */}
      {bulkLoading && (
        <div style={{ padding: "3rem 1.5rem", textAlign: "center" }}>
          <Loader2 size={36} className="animate-spin" color="var(--accent-blue)" style={{ margin: "0 auto 1.25rem" }} />
          <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.35rem" }}>
            Verifying your email batch...
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "420px", margin: "0 auto 1.5rem" }}>
            Querying Cloudflare DNS-over-HTTPS, validating MX exchangers, and cross-referencing burner lists in parallel.
          </p>

          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem 0.85rem", background: "var(--bg-subtle)", borderRadius: "var(--radius-pill)", fontSize: "0.8rem", color: "var(--text-muted)" }}>
            <span>Validating {detectedEmails.length} addresses</span>
          </div>
        </div>
      )}

      {/* STEP 4: Completion Matrix & Outcome Actions */}
      {bulkSummary && !bulkLoading && (
        <div>
          {/* Outcome Takeaway Banner */}
          <div
            style={{
              padding: "1.25rem 1.5rem",
              background: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              borderRadius: "var(--radius-md)",
              marginBottom: "1.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", marginBottom: "0.2rem" }}>
                <CheckCircle2 size={18} color="#059669" />
                <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#047857" }}>
                  Verification Complete
                </span>
              </div>
              <p style={{ color: "#334155", fontSize: "0.85rem", margin: 0 }}>
                Processed <strong>{bulkSummary.processed}</strong> addresses: <strong>{bulkSummary.successful}</strong> deliverable, <strong>{bulkSummary.failed}</strong> risky/undeliverable.
              </p>
            </div>

            {/* Primary Action Button */}
            <button
              type="button"
              className="btn btn-black"
              onClick={downloadDeliverableOnlyTXT}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.6rem 1.2rem",
                background: "#059669",
                borderColor: "#059669",
              }}
            >
              <Download size={15} />
              <span>Download Clean List (.txt)</span>
            </button>
          </div>

          {/* 3 Metric Breakdown Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.85rem", marginBottom: "1.5rem" }}>
            <div className="card" style={{ padding: "1rem", textAlign: "center" }}>
              <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 700 }}>PROCESSED</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a" }}>{bulkSummary.total}</div>
            </div>
            <div className="card" style={{ padding: "1rem", textAlign: "center" }}>
              <div style={{ fontSize: "0.68rem", color: "var(--success)", fontWeight: 700 }}>DELIVERABLE</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--success)" }}>{bulkSummary.successful}</div>
            </div>
            <div className="card" style={{ padding: "1rem", textAlign: "center" }}>
              <div style={{ fontSize: "0.68rem", color: "var(--danger)", fontWeight: 700 }}>RISKY / BOUNCED</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--danger)" }}>{bulkSummary.failed}</div>
            </div>
          </div>

          {/* Secondary Export Options Toolbar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>
              Detailed Verification Log
            </div>

            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              <button className="btn btn-outline" onClick={downloadResultsCSV} style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", padding: "0.35rem 0.65rem" }}>
                <Download size={12} /> Export CSV
              </button>
              <button className="btn btn-outline" onClick={downloadResultsTXT} style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", padding: "0.35rem 0.65rem" }}>
                <Download size={12} /> Export TXT
              </button>
              <button className="btn btn-outline" onClick={downloadResultsJSON} style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", padding: "0.35rem 0.65rem" }}>
                <Download size={12} /> Export JSON
              </button>
            </div>
          </div>

          {/* Paginated Results Table */}
          {bulkSummary.results && bulkSummary.results.length > 0 && (
            <div className="data-table-wrapper">
              <div className="data-table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Email Address</th>
                      <th>Verdict</th>
                      <th>Score</th>
                      <th>MX Status</th>
                      <th>SPF / DMARC</th>
                      <th>Mailbox</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkSummary.results
                      .slice((bulkPage - 1) * BULK_PAGE_SIZE, bulkPage * BULK_PAGE_SIZE)
                      .map((r, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 600, fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>{r.email}</td>
                          <td>
                            <VerdictBadge verdict={r.verdict} score={r.score} size="sm" />
                          </td>
                          <td style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>{r.score}/100</td>
                          <td>
                            <span style={{ fontSize: "0.75rem", color: r.checks.mx === "MX_FOUND" ? "#047857" : "#b91c1c", fontWeight: 600 }}>
                              {r.checks.mx === "MX_FOUND" ? "✓ Found" : "✗ Missing"}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: "0.75rem", color: r.checks.spf.includes("PRESENT") ? "#047857" : "#b45309", fontWeight: 600 }}>
                              {r.checks.spf.includes("PRESENT") ? "✓ Enforced" : "⚠ Missing"}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: "0.75rem", color: r.checks.disposable === "NOT_DISPOSABLE" ? "var(--text-muted)" : "#b91c1c", fontWeight: 600 }}>
                              {r.checks.disposable === "NOT_DISPOSABLE" ? "Clean" : "Burner"}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={bulkPage}
                totalPages={Math.ceil(bulkSummary.results.length / BULK_PAGE_SIZE)}
                totalItems={bulkSummary.results.length}
                pageSize={BULK_PAGE_SIZE}
                onPageChange={setBulkPage}
              />
            </div>
          )}

          {/* Reset Action */}
          <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setBulkInput("");
                window.location.reload();
              }}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem", padding: "0.45rem 0.95rem" }}
            >
              <RotateCcw size={13} />
              <span>Verify Another Batch</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
