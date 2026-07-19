"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserCircle2, Settings2, LogOut, Download } from "lucide-react";
import { getAdminToken, clearAdminToken } from "@/lib/adminAuth";
import { fetchSummary, fetchApplications, exportCsvUrlWithToken } from "@/lib/adminApi";
import { useToast } from "@/components/Toast";
import BarChart from "@/components/admin/BarChart";
import ApplicantDetailModal from "@/components/admin/ApplicantDetailModal";

const FILTERS = [
  { label: "전체", track: "", group: "" },
  { label: "에디터 · ART", track: "editor", group: "art" },
  { label: "에디터 · PLACE", track: "editor", group: "place" },
  { label: "에디터 · PEOPLE", track: "editor", group: "people" },
  { label: "디자이너 · Designer", track: "designer", group: "design" },
  { label: "디자이너 · Content Designer", track: "designer", group: "content-design" },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [ready, setReady] = useState(false);
  const [summary, setSummary] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [filterIdx, setFilterIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailCache, setDetailCache] = useState<Record<string, any>>({});
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!getAdminToken()) {
      router.replace("/admin");
      return;
    }
    setReady(true);
  }, [router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryRes, listRes] = await Promise.all([
        fetchSummary(),
        fetchApplications({
          track: FILTERS[filterIdx].track || undefined,
          group: FILTERS[filterIdx].group || undefined,
        }),
      ]);
      setSummary(summaryRes.summary || []);
      setApplications(listRes.applications || []);
    } catch (e: any) {
      if (e.status === 401) {
        clearAdminToken();
        router.replace("/admin");
        return;
      }
      showToast(e.message || "데이터를 불러오지 못했습니다.", "error");
    } finally {
      setLoading(false);
    }
  }, [filterIdx, router, showToast]);

  useEffect(() => {
    if (ready) load();
  }, [ready, load]);

  const openDetail = async (id: string) => {
    setSelectedId(id);
    if (detailCache[id]) return;
    try {
      const { fetchApplicationDetail } = await import("@/lib/adminApi");
      const res = await fetchApplicationDetail(id);
      setDetailCache((prev) => ({ ...prev, [id]: res.application }));
    } catch (e: any) {
      showToast(e.message || "상세 정보를 불러오지 못했습니다.", "error");
      setSelectedId(null);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportCsvUrlWithToken()();
    } catch (e: any) {
      showToast(e.message || "CSV 내보내기에 실패했습니다.", "error");
    } finally {
      setExporting(false);
    }
  };

  const handleLogout = () => {
    clearAdminToken();
    router.replace("/admin");
  };

  if (!ready) return null;

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "20px 20px 60px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, margin: 0 }}>
          잔치 <span style={{ color: "var(--color-orange)" }}>관리자</span>
        </h1>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={handleExport} disabled={exporting} style={iconBtnStyle} title="엑셀(CSV) 다운로드">
            <Download size={20} />
          </button>
          <Link href="/admin/cms" style={iconBtnStyle} title="CMS 편집">
            <Settings2 size={20} />
          </Link>
          <Link href="/admin/mypage" style={iconBtnStyle} title="마이페이지">
            <UserCircle2 size={22} />
          </Link>
          <button onClick={handleLogout} style={iconBtnStyle} title="로그아웃">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <section style={cardStyle}>
        <h2 style={{ fontSize: 15, fontWeight: 800, marginTop: 0 }}>팀별 지원 현황</h2>
        <BarChart summary={summary} />
      </section>

      <section style={{ ...cardStyle, marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>지원자 목록 ({applications.length})</h2>
          <select
            value={filterIdx}
            onChange={(e) => setFilterIdx(Number(e.target.value))}
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1.5px solid var(--color-line)",
              fontSize: 13,
            }}
          >
            {FILTERS.map((f, i) => (
              <option key={f.label} value={i}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p style={{ color: "var(--color-sub)" }}>불러오는 중...</p>
        ) : applications.length === 0 ? (
          <p style={{ color: "var(--color-sub)" }}>해당 조건의 지원자가 없어요.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {applications.map((a) => (
              <button
                key={a._id}
                onClick={() => openDetail(a._id)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 4px",
                  borderBottom: "1px solid var(--color-line)",
                  background: "none",
                  border: "none",
                  borderBottomWidth: 1,
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{a.name}</div>
                  <div style={{ fontSize: 12, color: "var(--color-sub)" }}>
                    {a.groupLabel} · {new Date(a.createdAt).toLocaleDateString("ko-KR")}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: a.status === "합격" ? "#E9F9F1" : a.status === "불합격" ? "#FDEDEC" : "#F1F2F4",
                    color: a.status === "합격" ? "#1fa565" : a.status === "불합격" ? "var(--color-danger)" : "var(--color-sub)",
                  }}
                >
                  {a.status}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {selectedId && detailCache[selectedId] && (
        <ApplicantDetailModal
          application={detailCache[selectedId]}
          onClose={() => setSelectedId(null)}
          onStatusChanged={(id, status) => {
            setDetailCache((prev) => ({ ...prev, [id]: { ...prev[id], status } }));
            setApplications((prev) => prev.map((a) => (a._id === id ? { ...a, status } : a)));
          }}
onDeleted={(id) => {
            setApplications((prev) => prev.filter((a) => a._id !== id));
            setSelectedId(null);
          }}
        />
      )}
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid var(--color-line)",
  borderRadius: 16,
  padding: 18,
};

const iconBtnStyle: React.CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: "50%",
  border: "1px solid var(--color-line)",
  background: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--color-black)",
};
