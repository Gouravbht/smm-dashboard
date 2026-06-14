import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { PageTitle } from "@/components/layout/PageTitle";
import { DashboardSummary } from "@/components/ai/DashboardSummary";
import { AnomalyAlerts } from "@/components/ai/AnomalyAlerts";
import { AudienceOverview } from "@/components/sections/AudienceOverview";
import { PlatformBreakdown } from "@/components/sections/PlatformBreakdown";
import { AudienceGrowth } from "@/components/sections/AudienceGrowth";
import { WeeklyReach } from "@/components/sections/WeeklyReach";
import { ContentPerformance } from "@/components/sections/ContentPerformance";
import { VideoCompletion } from "@/components/sections/VideoCompletion";
import { AudienceByLocation } from "@/components/sections/AudienceByLocation";
import { PostAttributionFunnel } from "@/components/sections/PostAttributionFunnel";

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto">
          <PageTitle />

          {/* AI Summary + Anomalies */}
          <DashboardSummary />
          <AnomalyAlerts />

          {/* Dashboard sections */}
          <AudienceOverview />
          <PlatformBreakdown />
          <AudienceGrowth />
          <WeeklyReach />
          <ContentPerformance />
          <VideoCompletion />
          <AudienceByLocation />
          <PostAttributionFunnel />

          {/* Bottom spacing */}
          <div className="h-8" />
        </main>
      </div>
    </div>
  );
}
