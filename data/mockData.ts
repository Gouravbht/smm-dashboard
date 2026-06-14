import type { DashboardData, GrowthDataPoint, KPI } from "@/types";

// Apr 2024 – Mar 2025 (previous year) for MoM chart overlay
export const PREV_YEAR_GROWTH: GrowthDataPoint[] = [
  { month: "Apr", instagram: 10200, youtube: 7800, facebook: 4000 },
  { month: "May", instagram: 10600, youtube: 8000, facebook: 4200 },
  { month: "Jun", instagram: 11000, youtube: 8200, facebook: 4400 },
  { month: "Jul", instagram: 11400, youtube: 8400, facebook: 4600 },
  { month: "Aug", instagram: 11800, youtube: 8600, facebook: 4850 },
  { month: "Sep", instagram: 12200, youtube: 8800, facebook: 5100 },
  { month: "Oct", instagram: 12500, youtube: 9000, facebook: 5300 },
  { month: "Nov", instagram: 12800, youtube: 9200, facebook: 5500 },
  { month: "Dec", instagram: 13100, youtube: 9500, facebook: 5700 },
  { month: "Jan", instagram: 13300, youtube: 9700, facebook: 5900 },
  { month: "Feb", instagram: 13550, youtube: 9850, facebook: 6100 },
  { month: "Mar", instagram: 13800, youtube: 10000, facebook: 5400 },
];

// Scale factor per date range label (multiplies reach / content published / followerGrowth)
const DATE_SCALE: Record<string, number> = {
  "Mar 1 – Mar 31": 1.0,
  "Last 7 days":    0.25,
  "Last 90 days":   3.1,
  "Last 6 months":  6.2,
  "Last 12 months": 12.4,
};

export function scaledKPI(base: KPI, rangeLabel: string): KPI {
  const m = DATE_SCALE[rangeLabel] ?? 1.0;
  if (m === 1.0) return base;
  return {
    ...base,
    totalReach: Math.round(base.totalReach * m),
    followerGrowth: Math.round(base.followerGrowth * m),
    contentPublished: Math.round(base.contentPublished * m),
    contentByPlatform: {
      instagram: Math.round(base.contentByPlatform.instagram * m),
      youtube:   Math.round(base.contentByPlatform.youtube   * m),
      facebook:  Math.round(base.contentByPlatform.facebook  * m),
    },
  };
}

export const MOCK_DATA: DashboardData = {
  kpi: {
    totalFollowers: 39200,
    followerGrowth: 640,
    totalReach: 264000,
    avgEngagementRate: 3.2,
    contentPublished: 48,
    contentByPlatform: { instagram: 22, youtube: 14, facebook: 12 },
    mom: {
      totalFollowers: 1.7,
      followerGrowth: 22,
      totalReach: 18,
      avgEngagementRate: 0.4,
    },
  },

  platforms: [
    {
      platform: "instagram",
      name: "Instagram",
      handle: "@officialrarefitness",
      postsLabel: "22 posts",
      metrics: [
        { label: "Followers", value: "18,400", delta: "+340 MTM" },
        { label: "Reach", value: "1,42,000", delta: "+21%" },
        { label: "Eng. Rate", value: "4.2%", delta: "+0.6%" },
        { label: "Likes", value: "24,680", delta: "+14%", check: true },
        { label: "Comments", value: "3,840", delta: "+9%", check: true },
        { label: "Saves", value: "5,210", delta: "+18%", check: true },
      ],
    },
    {
      platform: "youtube",
      name: "YouTube",
      handle: "@officialrarefitness",
      postsLabel: "14 videos",
      metrics: [
        { label: "Subscribers", value: "8,200", delta: "+180 MTM" },
        { label: "Views (Mar)", value: "68,000", delta: "+14%" },
        { label: "Eng. Rate", value: "2.8%", delta: "+0.3%" },
        { label: "Watch Time", value: "2,840h", delta: "+11%", check: true },
        { label: "Avg Duration", value: "2:10", sub: "of 5:00 avg" },
        { label: "Comments", value: "1,620", delta: "+7%", check: true },
      ],
    },
    {
      platform: "facebook",
      name: "Facebook",
      handle: "@officialrarefitness",
      postsLabel: "12 posts",
      metrics: [
        { label: "Followers", value: "12,600", delta: "+120 MTM" },
        { label: "Reach (Mar)", value: "54,000", delta: "+8%" },
        { label: "Eng. Rate", value: "1.6%", delta: "+0.2%" },
        { label: "Reactions", value: "9,420", delta: "+6%", check: true },
        { label: "Comments", value: "1,284", delta: "+4%", check: true },
        { label: "Shares", value: "2,108", delta: "+11%", check: true },
      ],
    },
  ],

  // End values match reference chart labels: IG 18,400 · YT 12,600 · FB 8,200
  audienceGrowth: [
    { month: "Apr", instagram: 13800, youtube: 10000, facebook: 5400 },
    { month: "May", instagram: 14300, youtube: 10250, facebook: 5650 },
    { month: "Jun", instagram: 14800, youtube: 10500, facebook: 5900 },
    { month: "Jul", instagram: 15300, youtube: 10750, facebook: 6150 },
    { month: "Aug", instagram: 15700, youtube: 11000, facebook: 6450 },
    { month: "Sep", instagram: 16100, youtube: 11250, facebook: 6750 },
    { month: "Oct", instagram: 16500, youtube: 11500, facebook: 7050 },
    { month: "Nov", instagram: 16900, youtube: 11750, facebook: 7350 },
    { month: "Dec", instagram: 17300, youtube: 12000, facebook: 7600 },
    { month: "Jan", instagram: 17700, youtube: 12200, facebook: 7850 },
    { month: "Feb", instagram: 18050, youtube: 12400, facebook: 8050 },
    { month: "Mar", instagram: 18400, youtube: 12600, facebook: 8200 },
  ],

  // Stacked totals match reference: 66.6k · 74.6k · 63.6k · 59.2k
  weeklyReach: [
    { week: "Mar 1–7",  instagram: 16000, youtube: 34000, facebook: 16600, total: 66600 },
    { week: "Mar 8–14", instagram: 22000, youtube: 38000, facebook: 14600, total: 74600 },
    { week: "Mar 15–21",instagram: 18000, youtube: 32000, facebook: 13600, total: 63600 },
    { week: "Mar 22–28",instagram: 16000, youtube: 30000, facebook: 13200, total: 59200 },
  ],

  contentPosts: [
    { id: "p1", title: "Transformation Tuesday",      platform: "instagram", type: "Reel",   date: "12 March 2026", likes: 1240, comments: 148, shares: 312, saves: 620, reach: 18400, engagementRate: 6.8 },
    { id: "p2", title: "90-Day Results — Before/After",platform: "instagram", type: "Static", date: "11 March 2026", likes: 986,  comments: 204, shares: 186, saves: 488, reach: 14200, engagementRate: 5.9 },
    { id: "p3", title: "Special Population Fitness",   platform: "instagram", type: "Reel",   date: "10 March 2026", likes: 680,  comments: 126, shares: 98,  saves: 312, reach: 9800,  engagementRate: 4.2 },
    { id: "p4", title: "Home Workout — No Equipment",  platform: "facebook",  type: "Video",  date: "10 March 2026", likes: 724,  comments: 82,  shares: 148, saves: -1,  reach: 12600, engagementRate: 3.8 },
    { id: "p5", title: "What Happens in Week 1",       platform: "youtube",   type: "Video",  date: "10 March 2026", likes: 842,  comments: 96,  shares: 74,  saves: -1,  reach: 28400, engagementRate: 3.2 },
    { id: "p6", title: "Morning Routine — 5 Mins",     platform: "instagram", type: "Static", date: "10 March 2026", likes: 512,  comments: 68,  shares: -1,  saves: 228, reach: 7400,  engagementRate: 3.1 },
    { id: "p7", title: "Diet Myths Debunked",          platform: "youtube",   type: "Video",  date: "9 March 2026",  likes: 628,  comments: 114, shares: 52,  saves: -1,  reach: 18200, engagementRate: 2.8 },
    { id: "p8", title: "Young Warrior Program",        platform: "facebook",  type: "Static", date: "9 March 2026",  likes: 388,  comments: 48,  shares: 62,  saves: -1,  reach: 8400,  engagementRate: 2.4 },
    { id: "p9", title: "Seated Exercise — Elderly",    platform: "youtube",   type: "Video",  date: "9 March 2026",  likes: 414,  comments: 88,  shares: 36,  saves: -1,  reach: 12400, engagementRate: 2.4 },
  ],

  videoCompletion: [
    { platform: "instagram", completionRate: 68, avgViews: 320, label: "Instagram Reels" },
    { platform: "youtube",   completionRate: 44, avgViews: 210, label: "YouTube Videos" },
    { platform: "facebook",  completionRate: 38, avgViews: 110, label: "Facebook Videos" },
  ],

  dropOffCurve: [
    { time: "0:00", retention: 100 },
    { time: "0:30", retention: 96 },
    { time: "1:00", retention: 90 },
    { time: "1:15", retention: 84 },
    { time: "1:45", retention: 70 },
    { time: "2:15", retention: 54 },
    { time: "2:30", retention: 44 },
    { time: "3:00", retention: 38 },
    { time: "3:45", retention: 32 },
    { time: "4:30", retention: 28 },
    { time: "5:00", retention: 25 },
  ],

  locations: [
    { city: "Amritsar, Punjab",                 region: "Punjab",        count: 9200, percentage: 23 },
    { city: "Ludhiana, Punjab",                 region: "Punjab",        count: 6640, percentage: 17 },
    { city: "Delhi NCR",                        region: "Delhi",         count: 5360, percentage: 14 },
    { city: "Chandigarh",                       region: "Punjab",        count: 3680, percentage: 9  },
    { city: "Jalandhar, Punjab",                region: "Punjab",        count: 2940, percentage: 7  },
    { city: "Patiala, Punjab",                  region: "Punjab",        count: 2200, percentage: 6  },
    { city: "UAE (Diaspora)",                   region: "International",  count: 1640, percentage: 4  },
    { city: "UK (Diaspora)",                    region: "International",  count: 1100, percentage: 3  },
    { city: "Other Punjab Cities",              region: "Punjab",        count: 1840, percentage: 5  },
    { city: "Rest of India & International",     region: "Other",         count: 4600, percentage: 12 },
  ],

  punjabConcentration: {
    region: "Punjab",
    percentage: 62,
    description:
      "Strong local concentration. Diaspora (UAE + UK) is 7% and growing — consider targeted diaspora content in English/Punjabi.",
  },

  attributionFunnel: [
    { stage: "Post Published",   count: 48,     rate: "pieces this month",          conversionFromPrev: undefined },
    { stage: "Total Impressions",count: 412000, rate: "across all platforms",       conversionFromPrev: undefined },
    { stage: "Link Clicks (UTM)",count: 3840,   rate: "0.93% CTR · GA4 source/medium", conversionFromPrev: 0.93 },
    { stage: "Page Sessions",    count: 2380,   rate: "38% bounce · 62% stay",      conversionFromPrev: 62 },
    { stage: "Form Started",     count: 572,    rate: "24% of sessions",            conversionFromPrev: 24 },
    { stage: "Lead Captured",    count: 349,    rate: "61% form completion",        conversionFromPrev: 61 },
  ],
};

// Best time to post heatmap — engagement index 0-100 across 7 days × 8 hour buckets
export const POSTING_HEATMAP = {
  days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  hours: ["12am", "3am", "6am", "9am", "12pm", "3pm", "6pm", "9pm"],
  // scores[dayIndex][hourIndex]
  scores: [
    [12,  8,  62, 76, 55, 48, 78, 65],  // Mon
    [15, 10,  40, 72, 62, 55, 88, 70],  // Tue
    [10,  8,  45, 68, 65, 60, 75, 58],  // Wed
    [14,  9,  52, 80, 58, 52, 91, 74],  // Thu
    [18, 12,  42, 70, 60, 58, 65, 50],  // Fri
    [ 8,  6,  88, 90, 72, 68, 58, 42],  // Sat
    [10,  8,  82, 85, 68, 62, 70, 55],  // Sun
  ],
  bestSlots: [
    { day: "Thursday", hour: "6–9pm",  score: 91 },
    { day: "Saturday", hour: "9am–12pm", score: 90 },
    { day: "Saturday", hour: "6–9am",  score: 88 },
  ],
  insight: "Thursday evening posts see 2.3× more engagement than the weekly average — followers are most active after weekday workouts. Weekend mornings (Sat 6–9am) are the second-best window, driven by outdoor workout content.",
};
