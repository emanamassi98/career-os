import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Circle, Clock, FlaskConical, GraduationCap } from 'lucide-react';
import { getRoadmapByPhase, roadmapItems } from '@/data/roadmap';
import { getCurriculum } from '@/data/curriculum';
import { getVideosForSlug } from '@/data/topicVideos';
import { computeTopicProgress } from '@/lib/progress';
import { useAllTopicProgress } from '@/hooks/useTopicProgress';
import { defaultTopicProgress } from '@/types';
import { VideoCard } from '@/components/VideoCard';
import { cn } from '@/lib/utils';

export default function PhasePage() {
  const { phase: phaseParam } = useParams();
  const phase = Number(phaseParam);
  const { map } = useAllTopicProgress();

  if (!Number.isInteger(phase)) {
    return <p className="text-sm text-muted-foreground">Unknown phase.</p>;
  }

  const items = getRoadmapByPhase(phase);
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No topics found for phase {phase}.</p>;
  }

  const phaseName = items[0].phaseName;
  const videos = items.flatMap((item) => getVideosForSlug(item.slug));

  return (
    <div className="space-y-8">
      <div>
        <Link to="/roadmap" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-3.5 w-3.5" /> Roadmap
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary">Phase {phase}</span>
          <h1 className="text-2xl font-bold">{phaseName}</h1>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {items.length} topic{items.length === 1 ? '' : 's'} in this phase, each a working module with objectives, labs, a mini-project, and assessment.
        </p>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const curriculum = getCurriculum(item.id);
          const progress = map[item.id] ?? defaultTopicProgress(item.id);
          const summary = curriculum ? computeTopicProgress(curriculum, progress) : null;
          const overall = summary?.overall ?? 0;
          const statusTone = overall >= 100 ? 'text-green-600' : overall > 0 ? 'text-blue-500' : 'text-muted-foreground';
          return (
            <Link
              key={item.id}
              to={`/roadmap/${item.slug}`}
              className="group block rounded-lg border border-border p-4 transition-colors hover:border-primary/50 hover:bg-accent/40"
            >
              <div className="flex flex-wrap items-start gap-3">
                <Circle className={cn('mt-1 h-4 w-4 shrink-0', statusTone)} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium group-hover:text-primary">{item.title}</span>
                    {curriculum && (
                      <span className="rounded bg-secondary px-1.5 py-0.5 text-xs text-muted-foreground">{curriculum.difficulty}</span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                    {curriculum && (
                      <>
                        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {curriculum.estimatedHours}h</span>
                        <span className="inline-flex items-center gap-1"><GraduationCap className="h-3 w-3" /> {curriculum.objectives.length} objectives</span>
                        <span className="inline-flex items-center gap-1"><FlaskConical className="h-3 w-3" /> {curriculum.labs.length} labs</span>
                        <span className="inline-flex items-center gap-1"><ArrowUpRight className="h-3 w-3" /> {curriculum.interviewQuestions.length} interview Qs</span>
                      </>
                    )}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{curriculum?.introduction ?? item.description}</p>
                </div>
                <div className="shrink-0 font-mono text-xs text-muted-foreground">{overall}%</div>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary" style={{ width: `${overall}%` }} />
              </div>
            </Link>
          );
        })}
      </div>

      {videos.length > 0 && (
        <div>
          <h2 className="text-lg font-bold">Watch &amp; Learn</h2>
          <p className="mt-1 text-sm text-muted-foreground">Curated videos for this phase.</p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map((v, i) => <VideoCard key={`${v.youtubeId}-${i}`} {...v} />)}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
        {phase < 10 ? (
          <>Next: <Link to={`/roadmap/phase/${phase + 1}`} className="text-primary hover:underline">Phase {phase + 1}</Link></>
        ) : (
          <>This is the final phase. Stretch goals included.</>
        )}
      </div>
    </div>
  );
}

export { roadmapItems };