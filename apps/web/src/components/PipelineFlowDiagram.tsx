import { 
  ArrowRight, 
  FileText, 
  Search, 
  Globe, 
  Mail, 
  ShieldCheck, 
  Trash2, 
  Cpu, 
  Sparkles 
} from "lucide-react";

interface PipelineFlowDiagramProps {
  onSelectPipelineStage?: (stageKey: string) => void;
}

export const PipelineFlowDiagram = ({ onSelectPipelineStage }: PipelineFlowDiagramProps) => {
  const stages = [
    {
      id: "normalize",
      number: "01",
      icon: <FileText size={16} />,
      title: "Normalization",
      endpoint: "/api/check/syntax",
      desc: "Lowercase, IDN punycode parsing & whitespace trim",
      color: "#2563eb",
      bgColor: "rgba(37, 99, 235, 0.08)",
    },
    {
      id: "syntax",
      number: "02",
      icon: <Cpu size={16} />,
      title: "RFC Syntax",
      endpoint: "/api/check/syntax",
      desc: "RFC 5322 regex conformance, lengths & domain labels",
      color: "#7c3aed",
      bgColor: "rgba(124, 58, 237, 0.08)",
    },
    {
      id: "typo",
      number: "03",
      icon: <Sparkles size={16} />,
      title: "Typo Intelligence",
      endpoint: "/api/check/typo",
      desc: "Levenshtein distance & common mailbox domain suggestions",
      color: "#d97706",
      bgColor: "rgba(217, 119, 6, 0.08)",
    },
    {
      id: "dns",
      number: "04",
      icon: <Globe size={16} />,
      title: "DoH Resolution",
      endpoint: "/api/check/dns",
      desc: "Direct Cloudflare DNS-over-HTTPS A & AAAA queries",
      color: "#059669",
      bgColor: "rgba(5, 150, 105, 0.08)",
    },
    {
      id: "mx",
      number: "05",
      icon: <Mail size={16} />,
      title: "MX Priority Routing",
      endpoint: "/api/check/mx",
      desc: "Discovery and priority sorting of mail exchangers",
      color: "#0284c7",
      bgColor: "rgba(2, 132, 199, 0.08)",
    },
    {
      id: "security",
      number: "06",
      icon: <ShieldCheck size={16} />,
      title: "SPF & DMARC",
      endpoint: "/api/check/security",
      desc: "TXT anti-spoofing policy inspection & alignment",
      color: "#16a34a",
      bgColor: "rgba(22, 163, 74, 0.08)",
    },
    {
      id: "disposable",
      number: "07",
      icon: <Trash2 size={16} />,
      title: "Burner & Provider",
      endpoint: "/api/check/disposable",
      desc: "Disposable domain blocklist & consumer mailbox classification",
      color: "#e11d48",
      bgColor: "rgba(225, 29, 72, 0.08)",
    },
    {
      id: "verdict",
      number: "08",
      icon: <Search size={16} />,
      title: "Confidence Scoring",
      endpoint: "/api/verify",
      desc: "Composite risk assessment, verdict & diagnostic reasons",
      color: "#0f172a",
      bgColor: "rgba(15, 23, 42, 0.08)",
    },
  ];

  return (
    <section className="feature-section" style={{ margin: "3.5rem 0" }}>
      <div className="section-header" style={{ textAlign: "center", marginBottom: "2rem" }}>
        <span className="section-eyebrow">VERIFICATION PIPELINE ARCHITECTURE</span>
        <h2 className="section-title" style={{ fontSize: "1.55rem" }}>
          How MailVerify Protects Your Deliverability
        </h2>
        <p className="section-subtitle" style={{ maxWidth: "600px", margin: "0.25rem auto 0" }}>
          Each address flows through our multi-stage inspection engine to guarantee sender reputation and eliminate bounce risk.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1rem",
        }}
      >
        {stages.map((stage) => (
          <div
            key={stage.id}
            className="card"
            style={{
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
              cursor: onSelectPipelineStage ? "pointer" : "default",
            }}
            onClick={() => onSelectPipelineStage && onSelectPipelineStage(stage.id)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "var(--shadow-md)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "var(--shadow-sm)";
            }}
          >
            <div>
              {/* Header row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "32px",
                    height: "32px",
                    borderRadius: "var(--radius-sm)",
                    background: stage.bgColor,
                    color: stage.color,
                  }}
                >
                  {stage.icon}
                </div>
                <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                  STAGE {stage.number}
                </span>
              </div>

              {/* Title & Desc */}
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.3rem" }}>
                {stage.title}
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.45, marginBottom: "0.85rem" }}>
                {stage.desc}
              </p>
            </div>

            {/* Bottom Sub-Pipeline Endpoint Tag */}
            <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "0.65rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <code style={{ fontSize: "0.68rem", color: "var(--accent-blue)", fontFamily: "var(--font-mono)" }}>
                {stage.endpoint}
              </code>
              <ArrowRight size={12} color="var(--text-muted)" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
