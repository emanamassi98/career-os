import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  FlaskConical,
  GraduationCap,
  RefreshCw,
  Target,
  Trophy,
} from 'lucide-react';
import { getRoadmapDashboard, type RoadmapDashboard, getOverallReadiness } from '@/lib/readiness';
import { ProgressBar } from '@/components/lab-ui';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const [dash, setDash] = useState<RoadmapDashboard | null>(null);
  const [reloading, setReloading] = useState(false);
  const readiness = getOverallReadiness();

  const load = useCallback(async () => {
    setReloading(true);
    const d = await getRoadmapDashboard();
    setDash(d);
    setReloading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const insight = useMemo(() => {
    if (!dash) return null;
    const s = dash.stats;
    if (s.overall >= 100) return { tone: 'green', text: 'Roadmap complete. Time to interview.' };
    if (s.overall >= 60) return { tone: 'green', text: 'Solid pace. Keep shipping evidence.' };
    if (s.overall >= 30) return { tone: 'blue', text: 'Good momentum. Your next mission is waiting.' };
    if (s.labsCompleted > 0 || s.resourcesRead > 0) return { tone: 'amber', text: 'Started strong — the labs are the highest-weighted lever.' };
    return { tone: 'muted', text: 'Start with the first objective in Phase 0.' };
  }, [dash]);

  if (!dash) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Loading your career snapshot…</p>
        </div>
      </div>
    );
  }

  const stats = [
    { icon: <BarChart3 className="h-4 w-4" />, label: 'Overall completion', value: `${dash.stats.overall}%`, sub: `${getOverallReadiness()}% readiness score` },
    { icon: <Trophy className="h-4 w-4" />, label: 'Topics completed', value: String(dash.stats.demonstrated), sub: `${dash.stats.mastered} mastered` },
    { icon: <FlaskConical className="h-4 w-4" />, label: 'Labs completed', value: String(dash.stats.labsCompleted), sub: 'hands-on builds' },
    { icon: <BookOpen className="h-4 w-4" />, label: 'Resources read', value: String(dash.stats.resourcesRead), sub: 'curated links' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your learning operating system — next action, current focus, and evidence progress.
          </p>
        </div>
        <button
          onClick={load}
          disabled={reloading}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent disabled:opacity-50"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', reloading && 'animate-spin')} /> Refresh
        </button>
      </div>

      {insight && (
        <div className={cn(
          'rounded-lg border p-4 text-sm',
          insight.tone === 'green' && 'border-green-500/30 bg-green-500/10 text-green-600',
          insight.tone === 'blue' && 'border-blue-500/30 bg-blue-500/10 text-blue-500',
          insight.tone === 'amber' && 'border-amber-500/30 bg-amber-500/10 text-amber-600',
          insight.tone === 'muted' && 'border-border bg-card text-muted-foreground',
        )}>
          {insight.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ icon, label, value, sub }) => (
          <div key={label} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {icon} {label}
            </div>
            <div className="mt-1.5 font-mono text-2xl font-bold">{value}</div>
            {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
          </div>
        ))}
      </div>

      {/* Overall bar */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Career readiness</h2>
          <span className="font-mono text-sm text-muted-foreground">{readiness}%</span>
        </div>
        <ProgressBar value={readiness} className="mt-3" />
        <p className="mt-2 text-xs text-muted-foreground">
          Derived from skill levels and evidence depth across {10} focus areas.
        </p>
      </div>

      {/* Mission */}
      {dash.mission && (
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Target className="h-3.5 w-3.5" /> Today&apos;s mission
          </div>
          <h2 className="mt-1 text-lg font-bold">{dash.mission.title}</h2>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" /> {dash.mission.skill}</span>
            <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {dash.mission.estimatedTime}</span>
          </div>
          <Link
            to={`/roadmap/${dash.mission.topicSlug}`}
            className="mt-3 inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            {dash.mission.actionLabel} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Continue learning */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-medium">Continue learning</h2>
          {dash.continueLearning ? (
            <div className="mt-3 space-y-3">
              <div>
                <div className="font-mono text-xs text-muted-foreground">{dash.continueLearning.item.phaseName}</div>
                <div className="font-medium">{dash.continueLearning.item.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {dash.continueLearning.summary.overall}% · {dash.continueLearning.nextAction?.label ?? 'wrap it up'}
                </div>
                <ProgressBar value={dash.continueLearning.summary.overall} className="mt-2" />
              </div>
              <Link
                to={`/roadmap/${dash.continueLearning.item.slug}`}
                className="inline-flex items-center gap-0.5 text-sm text-primary hover:underline"
              >
                Open topic <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Nothing started yet — pick a topic from the roadmap.</p>
          )}
        </div>

        {/* Recommended next */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-medium">Recommended next</h2>
          {dash.recommendedNext ? (
            <div className="mt-3 space-y-3">
              <div className="font-medium">{dash.recommendedNext.item.title}</div>
              <p className="text-sm text-muted-foreground">{dash.recommendedNext.reason}</p>
              <Link
                to={`/roadmap/${dash.recommendedNext.item.slug}`}
                className="inline-flex items-center gap-0.5 text-sm text-primary hover:underline"
              >
                Open <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              No recommendation yet. {dash.continueLearning ? 'Finish your current topic first.' : 'Start with Phase 0.'}
            </p>
          )}
        </div>
      </div>

      {/* Recent actions hint */}
      <div className="rounded-lg border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
        <CheckCircle2 className="mx-auto mb-2 h-5 w-5 text-muted-foreground/50" />
        Progress is stored locally in your browser (IndexedDB). Complete objectives, labs, and evidence on any topic page to move the numbers above.
      </div>
    </div>
  );
}