import * as XLSX from "xlsx";
import { MOCK_DATA, POSTING_HEATMAP } from "@/data/mockData";

export function exportExcel() {
  const wb = XLSX.utils.book_new();

  // ── Sheet 1: KPI Overview ──────────────────────────────────────────────────
  const kpiData = [
    ["Metric", "Value", "MoM Change", "Notes"],
    ["Total Followers",     "264,000",   "+1.7%",  "Instagram 185K · YouTube 8.2K · Facebook 70.8K"],
    ["Follower Growth",     "+3,200",    "+22%",   "Net new followers in March 2026"],
    ["Total Reach",         "2,64,000",  "+18%",   "Combined across all platforms"],
    ["Avg Engagement Rate", "4.2%",      "+0.4%",  "Industry avg for fitness: ~2.8%"],
    ["Content Published",   "47 posts",  "",       "22 Instagram · 14 YouTube · 11 Facebook"],
    [],
    ["Platform Breakdown"],
    ["Platform", "Followers", "MoM Growth", "Reach (Mar)", "Engagement Rate", "Key Metric", "Key Value"],
    ["Instagram", 185000, "+340 (+0.2%)", 142000, "4.8%", "Reels Completion", "68%"],
    ["YouTube",   8200,   "+180 (+2.2%)", "68,000 views", "2.8%", "Avg Watch Time", "2h 50m"],
    ["Facebook",  70800,  "+120 (+0.2%)", 54000,  "1.6%", "Reactions",         9420],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(kpiData);
  ws1["!cols"] = [{ wch: 22 }, { wch: 14 }, { wch: 14 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, ws1, "KPI Overview");

  // ── Sheet 2: Content Posts ─────────────────────────────────────────────────
  const postRows = MOCK_DATA.contentPosts.map((p, i) => ({
    "#":            i + 1,
    Title:          p.title,
    Platform:       p.platform.charAt(0).toUpperCase() + p.platform.slice(1),
    Type:           p.type,
    Date:           p.date,
    Reach:          p.reach,
    Likes:          p.likes,
    Comments:       p.comments,
    Shares:         p.shares === -1 ? "N/A" : p.shares,
    Saves:          p.saves  === -1 ? "N/A" : p.saves,
    "Eng. Rate %":  p.engagementRate,
  }));
  const ws2 = XLSX.utils.json_to_sheet(postRows);
  ws2["!cols"] = [
    { wch: 4 }, { wch: 36 }, { wch: 12 }, { wch: 10 }, { wch: 16 },
    { wch: 10 }, { wch: 8 }, { wch: 10 }, { wch: 8 }, { wch: 8 }, { wch: 12 },
  ];
  XLSX.utils.book_append_sheet(wb, ws2, "Content Posts");

  // ── Sheet 3: Audience by Location ──────────────────────────────────────────
  const locRows = MOCK_DATA.locations.map((l, i) => ({
    "#":          i + 1,
    "City":       l.city,
    "Region":     l.region,
    "Audience":   l.count,
    "Share %":    `${l.percentage}%`,
  }));
  const ws3 = XLSX.utils.json_to_sheet(locRows);
  ws3["!cols"] = [{ wch: 4 }, { wch: 30 }, { wch: 16 }, { wch: 12 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, ws3, "Audience by Location");

  // ── Sheet 4: Attribution Funnel ────────────────────────────────────────────
  const funnelRows = MOCK_DATA.attributionFunnel.map((s) => ({
    "Stage":                  s.stage,
    "Count":                  s.count,
    "Rate / Detail":          s.rate,
    "Conversion from Prev %": s.conversionFromPrev ?? "—",
  }));
  const ws4 = XLSX.utils.json_to_sheet(funnelRows);
  ws4["!cols"] = [{ wch: 20 }, { wch: 12 }, { wch: 36 }, { wch: 24 }];
  XLSX.utils.book_append_sheet(wb, ws4, "Attribution Funnel");

  // ── Sheet 5: Posting Heatmap ───────────────────────────────────────────────
  const { days, hours, scores } = POSTING_HEATMAP;
  const heatRows = [
    ["Day / Hour", ...hours],
    ...days.map((d, di) => [d, ...scores[di]]),
    [],
    ["Best Posting Windows"],
    ["Rank", "Day", "Hour", "Score"],
    ...POSTING_HEATMAP.bestSlots.map((s, i) => [i + 1, s.day, s.hour, s.score]),
    [],
    ["Insight"],
    [POSTING_HEATMAP.insight],
  ];
  const ws5 = XLSX.utils.aoa_to_sheet(heatRows);
  ws5["!cols"] = [{ wch: 10 }, ...hours.map(() => ({ wch: 8 }))];
  XLSX.utils.book_append_sheet(wb, ws5, "Posting Heatmap");

  // ── Sheet 6: Video Completion ──────────────────────────────────────────────
  const videoRows = MOCK_DATA.videoCompletion.map((v) => ({
    Platform:          v.label,
    "Completion Rate": `${v.completionRate}%`,
    "Avg Views":       v.avgViews,
  }));
  const ws6 = XLSX.utils.json_to_sheet(videoRows);
  ws6["!cols"] = [{ wch: 20 }, { wch: 18 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws6, "Video Completion");

  XLSX.writeFile(wb, "rarefitness-smm-march2026.xlsx");
}
