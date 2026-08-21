import { useState, useRef, FormEvent, ChangeEvent } from "react";
import { Upload, Sparkles, FileSpreadsheet, Download, Loader2 } from "lucide-react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseEmailsFromText = (text: string): string[] => {
    return text
      .split(/[\n,;]+/)
      .map((e) => e.trim())
      .filter((e) => e.length > 0);
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
    toast.info("Exported full batch report as CSV.");
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
    toast.info("Exported batch report as TXT.");
  };

  const downloadDeliverableOnlyTXT = () => {
    if (!bulkSummary || !bulkSummary.results) return;
    const deliverableOnly = bulkSummary.results
      .filter((r) => r.verdict === "LIKELY_DELIVERABLE")
      .map((r) => r.email);
    if (deliverableOnly.length === 0) {
      toast.warning("No deliverable emails found in this batch to export.");
      return;
    }
    const blob = new Blob([deliverableOnly.join("\n")], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mailverify_clean_deliverable_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    toast.success(`Exported ${deliverableOnly.length} clean deliverable emails.`);
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
    toast.info("Exported batch report as JSON.");
  };

  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.2rem" }}>Bulk Email Batch Engine</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
            Verify up to 200 emails per batch. Paste text, upload CSV/JSON, or load sample records.
          </p>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onLoadSamples}
            style={{ fontSize: "0.75rem", padding: "0.35rem 0.65rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
          >
            <Sparkles size={12} color="var(--accent-blue)" /> Load 10 Samples
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileUpload}
            accept=".csv,.txt,.json,.tsv"
            style={{ display: "none" }}
          />

          <button
            type="button"
            className="btn btn-outline"
            onClick={() => fileInputRef.current?.click()}
            style={{ fontSize: "0.75rem", padding: "0.35rem 0.65rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
          >
            <FileSpreadsheet size={12} /> Upload CSV / TXT
          </button>
        </div>
      </div>

      <form onSubmit={onBulkSubmit}>
        <textarea
          className="clean-input"
          style={{ width: "100%", height: "130px", fontFamily: "var(--font-mono)", fontSize: "0.8rem", marginBottom: "0.75rem", lineHeight: 1.5 }}
          placeholder={`Paste emails separated by newlines or commas:\nalex@gmail.com\ncontact@stripe.com\nsupport@company.org`}
          value={bulkInput}
          onChange={(e) => setBulkInput(e.target.value)}
        />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
          <button
            type="submit"
            className="btn btn-black"
            disabled={bulkLoading || !bulkInput.trim()}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.55rem 1rem" }}
          >
            {bulkLoading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            <span>{bulkLoading ? "Processing Batch..." : "Run Batch Verification"}</span>
          </button>

          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Detected emails: <strong style={{ color: "var(--text-main)" }}>{parseEmailsFromText(bulkInput).length}</strong>
          </div>
        </div>
      </form>

      {bulkError && (
        <div style={{ color: "#dc2626", background: "#fef2f2", padding: "0.65rem 0.85rem", borderRadius: "var(--radius-md)", marginTop: "0.75rem", fontSize: "0.82rem" }}>
          {bulkError}
        </div>
      )}

      {/* Bulk Summary & Full Results Table */}
      {bulkSummary && (
        <div style={{ marginTop: "2rem", borderTop: "1px solid var(--border-subtle)", paddingTop: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>Batch Verification Results</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                Completed {bulkSummary.processed} verifications ({bulkSummary.successful} deliverable, {bulkSummary.failed} risky/undeliverable).
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
              <button className="btn btn-outline" onClick={downloadResultsCSV} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", padding: "0.35rem 0.65rem" }}>
                <Download size={13} /> Export CSV
              </button>
              <button className="btn btn-outline" onClick={downloadResultsTXT} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", padding: "0.35rem 0.65rem" }}>
                <Download size={13} /> Export TXT
              </button>
              <button className="btn btn-outline" onClick={downloadDeliverableOnlyTXT} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", padding: "0.35rem 0.65rem", borderColor: "var(--success)", color: "var(--success)" }}>
                <Download size={13} /> Clean Only (.txt)
              </button>
              <button className="btn btn-outline" onClick={downloadResultsJSON} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", padding: "0.35rem 0.65rem" }}>
                <Download size={13} /> Export JSON
              </button>
            </div>
          </div>

          {/* Metric Breakdown Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <div className="card" style={{ padding: "0.85rem", textAlign: "center" }}>
              <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 700 }}>PROCESSED</div>
              <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0f172a" }}>{bulkSummary.total}</div>
            </div>
            <div className="card" style={{ padding: "0.85rem", textAlign: "center" }}>
              <div style={{ fontSize: "0.68rem", color: "var(--success)", fontWeight: 700 }}>DELIVERABLE</div>
              <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--success)" }}>{bulkSummary.successful}</div>
            </div>
            <div className="card" style={{ padding: "0.85rem", textAlign: "center" }}>
              <div style={{ fontSize: "0.68rem", color: "var(--danger)", fontWeight: 700 }}>UNDELIVERABLE / RISKY</div>
              <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--danger)" }}>{bulkSummary.failed}</div>
            </div>
          </div>

          {/* Detailed Results Table */}
          {bulkSummary.results && bulkSummary.results.length > 0 && (
            <div className="data-table-wrapper">
              <div className="data-table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Email Address</th>
                      <th>Verdict</th>
                      <th>Score</th>
                      <th>MX Record</th>
                      <th>SPF / DMARC</th>
                      <th>Disposable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkSummary.results
                      .slice((bulkPage - 1) * BULK_PAGE_SIZE, bulkPage * BULK_PAGE_SIZE)
                      .map((r, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 600, fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>{r.email}</td>
                          <td>
                            <VerdictBadge verdict={r.verdict} score={r.score} />
                          </td>
                          <td style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>{r.score}/100</td>
                          <td>
                            <span className={`table-pill ${r.checks.mx === "MX_FOUND" ? "table-pill-success" : "table-pill-danger"}`}>
                              {r.checks.mx === "MX_FOUND" ? "✓ Found" : "✗ Missing"}
                            </span>
                          </td>
                          <td>
                            <span className={`table-pill ${r.checks.spf.includes("PRESENT") ? "table-pill-success" : "table-pill-warning"}`}>
                              {r.checks.spf.includes("PRESENT") ? "✓ Valid" : "⚠ Missing"}
                            </span>
                          </td>
                          <td>
                            <span className={`table-pill ${r.checks.disposable === "NOT_DISPOSABLE" ? "table-pill-muted" : "table-pill-danger"}`}>
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
        </div>
      )}
    </div>
  );
};
