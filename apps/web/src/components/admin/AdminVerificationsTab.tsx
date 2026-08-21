import { Pagination } from "../Pagination";

interface VerificationRecord {
  id: string;
  user_id: string | null;
  email: string;
  normalized_email: string;
  verdict: string;
  score: number;
  created_at: string;
}

interface AdminVerificationsTabProps {
  verifications: VerificationRecord[];
  verifsPage: number;
  onPageChange: (page: number) => void;
  pageSize: number;
}

export const AdminVerificationsTab = ({
  verifications,
  verifsPage,
  onPageChange,
  pageSize,
}: AdminVerificationsTabProps) => {
  const totalPages = Math.ceil(verifications.length / pageSize);

  return (
    <div className="card" style={{ padding: "1.25rem" }}>
      <div style={{ marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Global Live Verification Stream</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", margin: 0 }}>
          Real-time stream of all email validations executed across API keys, batch CSV uploads, and web sessions.
        </p>
      </div>

      <div className="data-table-wrapper">
        <div className="data-table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>EMAIL</th>
                <th>VERDICT</th>
                <th>RISK SCORE</th>
                <th>TIMESTAMP</th>
              </tr>
            </thead>
            <tbody>
              {verifications.length > 0 ? (
                verifications
                  .slice((verifsPage - 1) * pageSize, verifsPage * pageSize)
                  .map((v) => (
                    <tr key={v.id}>
                      <td style={{ fontWeight: 600, fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>
                        {v.email}
                      </td>
                      <td>
                        <span
                          className={`table-pill ${
                            v.verdict.includes("DELIVERABLE")
                              ? "table-pill-success"
                              : v.verdict.includes("RISKY") || v.verdict.includes("ROLE")
                              ? "table-pill-warning"
                              : "table-pill-danger"
                          }`}
                        >
                          {v.verdict}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                        {v.score}/100
                      </td>
                      <td style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                        {new Date(v.created_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                    No global verification records found in database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={verifsPage}
          totalPages={totalPages}
          totalItems={verifications.length}
          pageSize={pageSize}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
};
