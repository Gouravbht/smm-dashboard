import { z } from "zod";

// ─── Enums ────────────────────────────────────────────────────────────────────
export const PlatformSchema = z.enum(["instagram", "youtube", "facebook"]);
export type Platform = z.infer<typeof PlatformSchema>;

export const ContentTypeSchema = z.enum(["Reel", "Static", "Video", "Carousel"]);
export type ContentType = z.infer<typeof ContentTypeSchema>;

// ─── KPI Overview ─────────────────────────────────────────────────────────────
export const KPISchema = z.object({
  totalFollowers: z.number(),
  followerGrowth: z.number(),
  totalReach: z.number(),
  avgEngagementRate: z.number(),
  contentPublished: z.number(),
  contentByPlatform: z.object({
    instagram: z.number(),
    youtube: z.number(),
    facebook: z.number(),
  }),
  mom: z.object({
    totalFollowers: z.number(),
    followerGrowth: z.number(),
    totalReach: z.number(),
    avgEngagementRate: z.number(),
  }),
});
export type KPI = z.infer<typeof KPISchema>;

// ─── Platform Breakdown ───────────────────────────────────────────────────────
export const MetricCellSchema = z.object({
  label: z.string(),
  value: z.string(),
  delta: z.string().optional(),       // e.g. "+340 MTM", "+21%"
  sub: z.string().optional(),         // e.g. "of 5:00 avg"
  check: z.boolean().optional(),      // shows ✓ next to label
});
export type MetricCell = z.infer<typeof MetricCellSchema>;

export const PlatformMetricsSchema = z.object({
  platform: PlatformSchema,
  name: z.string(),
  handle: z.string(),
  postsLabel: z.string(),             // e.g. "22 posts", "14 videos"
  metrics: z.array(MetricCellSchema), // 6 cells: 2 rows × 3
});
export type PlatformMetrics = z.infer<typeof PlatformMetricsSchema>;

// ─── Audience Growth ─────────────────────────────────────────────────────────
export const GrowthDataPointSchema = z.object({
  month: z.string(),
  instagram: z.number(),
  youtube: z.number(),
  facebook: z.number(),
});
export type GrowthDataPoint = z.infer<typeof GrowthDataPointSchema>;

// ─── Weekly Reach ─────────────────────────────────────────────────────────────
export const WeeklyReachSchema = z.object({
  week: z.string(),
  instagram: z.number(),
  youtube: z.number(),
  facebook: z.number(),
  total: z.number(),
});
export type WeeklyReach = z.infer<typeof WeeklyReachSchema>;

// ─── Content Performance ─────────────────────────────────────────────────────
export const ContentPostSchema = z.object({
  id: z.string(),
  title: z.string(),
  platform: PlatformSchema,
  type: ContentTypeSchema,
  date: z.string(),
  likes: z.number(),
  comments: z.number(),
  shares: z.number(),
  saves: z.number(),
  reach: z.number(),
  engagementRate: z.number(),
});
export type ContentPost = z.infer<typeof ContentPostSchema>;

// ─── Video Completion ─────────────────────────────────────────────────────────
export const VideoCompletionSchema = z.object({
  platform: PlatformSchema,
  completionRate: z.number(),
  avgViews: z.number(),
  label: z.string(),
});
export type VideoCompletion = z.infer<typeof VideoCompletionSchema>;

export const DropOffPointSchema = z.object({
  time: z.string(),
  retention: z.number(),
});
export type DropOffPoint = z.infer<typeof DropOffPointSchema>;

// ─── Audience by Location ─────────────────────────────────────────────────────
export const LocationDataSchema = z.object({
  city: z.string(),
  region: z.string(),
  count: z.number(),
  percentage: z.number(),
});
export type LocationData = z.infer<typeof LocationDataSchema>;

export const ConcentrationSchema = z.object({
  region: z.string(),
  percentage: z.number(),
  description: z.string(),
});
export type Concentration = z.infer<typeof ConcentrationSchema>;

// ─── Attribution Funnel ───────────────────────────────────────────────────────
export const AttributionStageSchema = z.object({
  stage: z.string(),
  count: z.number(),
  rate: z.string().optional(),
  conversionFromPrev: z.number().optional(),
});
export type AttributionStage = z.infer<typeof AttributionStageSchema>;

// ─── AI Anomaly ───────────────────────────────────────────────────────────────
export const AnomalySchema = z.object({
  id: z.string(),
  metric: z.string(),
  value: z.string(),
  expected: z.string(),
  reason: z.string(),
  severity: z.enum(["high", "medium", "low"]),
  section: z.string(),
});
export type Anomaly = z.infer<typeof AnomalySchema>;

// ─── Full Dashboard State ─────────────────────────────────────────────────────
export const DashboardDataSchema = z.object({
  kpi: KPISchema,
  platforms: z.array(PlatformMetricsSchema),
  audienceGrowth: z.array(GrowthDataPointSchema),
  weeklyReach: z.array(WeeklyReachSchema),
  contentPosts: z.array(ContentPostSchema),
  videoCompletion: z.array(VideoCompletionSchema),
  dropOffCurve: z.array(DropOffPointSchema),
  locations: z.array(LocationDataSchema),
  punjabConcentration: ConcentrationSchema,
  attributionFunnel: z.array(AttributionStageSchema),
});
export type DashboardData = z.infer<typeof DashboardDataSchema>;

// ─── Filter State ─────────────────────────────────────────────────────────────
export interface DateRange {
  start: string;
  end: string;
  label: string;
}

export interface FilterState {
  dateRange: DateRange;
  activePlatforms: Platform[];
}
