import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Circle,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCode2,
  FlaskConical,
  GraduationCap,
  Lightbulb,
  ListChecks,
  Play,
  Plus,
  Save,
  Target,
  Trash2,
  Trophy,
} from 'lucide-react';
import { getRoadmapItem } from '@/lib/progress';
import { getCurriculum } from '@/data/curriculum';
import { getVideosForSlug } from '@/data/topicVideos';
import { getSkillById } from '@/data/skills';
import {
  AssessmentRepository,
  EvidenceRepository,
  InterviewRepository,
  LabRepository,
  MiniProjectRepository,
  NotesRepository,
  ProgressRepository,
  ResourceRepository,
} from '@/lib/storage/repositories';
import { computeTopicProgress, getDemonstratedRequirements, getMasteredRequirements } from '@/lib/progress';
import { useTopicProgress } from '@/hooks/useTopicProgress';
import { VideoCard } from '@/components/VideoCard';
import { Badge, ProgressBar } from '@/components/lab-ui';
import { cn } from '@/lib/utils';
import type { AssessmentAnswer, InterviewStatus, LabState, MiniProjectState } from '@/types';

export default function TopicPage() {
  const { slug } = useParams();
  const item = slug ? getRoadmapItem(slug) : undefined;
  const curriculum = item ? getCurriculum(item.id) : undefined;
  const { progress, refresh, loaded } = useTopicProgress(item?.id ?? '');

  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['objectives', 'resources', 'labs']));
  const [notes, setNotes] = useState<string>('');
  const [notesLoaded, setNotesLoaded] = useState(false);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    if (!item) return;
    NotesRepository.get(item.id).then((n) => {
      setNotes(n);
      setNotesLoaded(true);
    });
  }, [item]);

  const summary = useMemo(() => {
    if (!curriculum) return null;
    return computeTopicProgress(curriculum, progress);
  }, [curriculum, progress]);

  if (!item || !curriculum) {
    return (
      <div className="space-y-4">
        <Link to="/roadmap" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-3.5 w-3.5" /> Roadmap
        </Link>
        <p className="text-sm text-muted-foreground">Topic not found.</p>
      </div>
    );
  }

  const demonstrated = getDemonstratedRequirements(summary!);
  const mastered = getMasteredRequirements(summary!, demonstrated.met);
  const videos = getVideosForSlug(item.slug);

  async function markStudied() {
    await ProgressRepository.markStudied(item!.id);
    await refresh();
  }

  async function toggleObjective(objectiveId: string, done: boolean) {
    await ProgressRepository.markObjective(item!.id, objectiveId, done);
    await refresh();
  }

  return (
    <div className="space-y-8">
      <div>
        <Link to={`/roadmap/phase/${item.phase}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-3.5 w-3.5" /> Phase {item.phase}: {item.phaseName}
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary">Phase {item.phase}</span>
          <h1 className="text-2xl font-bold">{item.title}</h1>
          {curriculum && <Badge tone="purple">{curriculum.difficulty}</Badge>}
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">{curriculum.introduction}</p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> ~{curriculum.estimatedHours} hours</span>
          <span className="inline-flex items-center gap-1"><GraduationCap className="h-3 w-3" /> {curriculum.objectives.length} objectives</span>
          <span className="inline-flex items-center gap-1"><FlaskConical className="h-3 w-3" /> {curriculum.labs.length} labs</span>
          <span className="inline-flex items-center gap-1"><ListChecks className="h-3 w-3" /> {curriculum.assessment.length} assessments</span>
          <span className="inline-flex items-center gap-1"><Trophy className="h-3 w-3" /> {curriculum.interviewQuestions.length} interview Qs</span>
        </div>
      </div>

      {/* Skill chips */}
      {(item.skillIds && item.skillIds.length > 0) && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Skills:</span>
          {item.skillIds.map((id) => {
            const skill = getSkillById(id);
            return (
              <Link key={id} to="/skills" className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary hover:underline">
                {skill?.name ?? id}
              </Link>
            );
          })}
        </div>
      )}

      {/* Progress card */}
      {summary && (
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-medium">Module progress</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => ProgressRepository.setStatus(item.id, 'learning').then(refresh)}
                className={cn('rounded-md border px-2.5 py-1 text-xs font-medium transition-colors', progress.status === 'learning' ? 'border-primary/60 bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-accent')}
              >
                In progress
              </button>
              <button
                onClick={() => ProgressRepository.setStatus(item.id, 'demonstrated').then(refresh)}
                className={cn('rounded-md border px-2.5 py-1 text-xs font-medium transition-colors', progress.status === 'demonstrated' ? 'border-green-500/60 bg-green-500/10 text-green-600' : 'border-border text-muted-foreground hover:bg-accent')}
              >
                Demonstrated
              </button>
              <button
                onClick={() => ProgressRepository.setStatus(item.id, 'mastered').then(refresh)}
                className={cn('rounded-md border px-2.5 py-1 text-xs font-medium transition-colors', progress.status === 'mastered' ? 'border-green-500/60 bg-green-500/10 text-green-600' : 'border-border text-muted-foreground hover:bg-accent')}
              >
                Mastered
              </button>
            </div>
          </div>
          <ProgressBar value={summary.overall} className="mt-3" />
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
            <span>Resources {summary.resources}%</span>
            <span>Objectives {summary.objectives}%</span>
            <span>Labs {summary.labs}%</span>
            <span>Mini-project {summary.miniProject}%</span>
            <span>Assessment {summary.assessment}%</span>
            <span>Interview {summary.interview}%</span>
            <span>Evidence {summary.evidence}%</span>
          </div>

          {!progress.status || progress.status === 'not_started' ? (
            <button
              onClick={markStudied}
              className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Play className="h-4 w-4" /> Start this topic
            </button>
          ) : null}
        </div>
      )}

      {/* Status requirements */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <Target className="h-4 w-4 text-primary" /> Requirements: Demonstrated
          </div>
          {demonstrated.met ? (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-green-600"><CheckCircle2 className="h-4 w-4" /> All met</p>
          ) : (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {demonstrated.missing.map((m) => <li key={m}>{m}</li>)}
            </ul>
          )}
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <Trophy className="h-4 w-4 text-primary" /> Requirements: Mastered
          </div>
          {mastered.met ? (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-green-600"><CheckCircle2 className="h-4 w-4" /> All met</p>
          ) : (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {mastered.missing.map((m) => <li key={m}>{m}</li>)}
            </ul>
          )}
        </div>
      </div>

      {/* ===== Objectives ===== */}
      <Section id="objectives" icon={<Target className="h-4 w-4" />} title="Learning objectives" subtitle={`${summary?.objectivesCompleted ?? 0}/${curriculum.objectives.length} complete`} open={openSections.has('objectives')} onToggle={() => toggleSection('objectives')}>
        <div className="space-y-2">
          {curriculum.objectives.map((o) => {
            const done = progress.objectivesCompleted.includes(o.id);
            return (
              <button
                key={o.id}
                onClick={() => toggleObjective(o.id, !done)}
                className={cn('flex w-full items-start gap-3 rounded-md border p-3 text-left transition-colors', done ? 'border-green-500/30 bg-green-500/5' : 'border-border hover:bg-accent')}
              >
                {done ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />}
                <span className={cn('text-sm', done && 'text-muted-foreground line-through')}>{o.text}</span>
              </button>
            );
          })}
        </div>
      </Section>

      {/* ===== Resources ===== */}
      <Section id="resources" icon={<GraduationCap className="h-4 w-4" />} title="Resources" subtitle={`${summary?.resourcesRead ?? 0}/${curriculum.resources.length} read`} open={openSections.has('resources')} onToggle={() => toggleSection('resources')}>
        <div className="space-y-2">
          {curriculum.resources.map((r) => {
            const state = progress.resourcesRead[r.id];
            const handled = state !== undefined;
            return (
              <div key={r.id} className={cn('rounded-md border p-3 transition-colors', handled ? 'border-green-500/30 bg-green-500/5' : 'border-border')}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:text-primary hover:underline">
                      {r.title} <ExternalLink className="-mt-0.5 inline h-3.5 w-3.5" />
                    </a>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {r.kind} · {r.source} · {r.difficulty} · ~{r.estimatedMinutes} min
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{r.description}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {handled ? (
                      <>
                        <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-600">Read</span>
                        <button
                          onClick={() => ResourceRepository.unsetRead(item.id, r.id).then(refresh)}
                          className="rounded-md border border-border p-1 text-muted-foreground hover:bg-accent"
                          aria-label="Mark unread"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => ResourceRepository.setRead(item.id, r.id, { dateRead: new Date().toISOString(), notes: '', rating: 0, keyTakeaway: '' }).then(refresh)}
                        className="rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ===== Labs ===== */}
      <Section id="labs" icon={<FlaskConical className="h-4 w-4" />} title="Labs" subtitle={`${summary?.labsCompleted ?? 0}/${curriculum.labs.length} complete`} open={openSections.has('labs')} onToggle={() => toggleSection('labs')}>
        <div className="space-y-4">
          {curriculum.labs.map((lab) => (
            <LabCard
              key={lab.id}
              labId={lab.id}
              title={lab.title}
              difficulty={lab.difficulty}
              minutes={lab.estimatedMinutes}
              problem={lab.problem}
              why={lab.whyItMatters}
              requirements={lab.requirements.map((r) => r.text)}
              hints={lab.hints}
              expectedOutput={lab.expectedOutput}
              acceptance={lab.acceptanceCriteria.map((a) => a.text)}
              skills={lab.skillsPracticed}
              state={progress.labs[lab.id]}
              topicId={item.id}
              onChanged={refresh}
            />
          ))}
        </div>
      </Section>

      {/* ===== Mini project ===== */}
      <Section id="mini-project" icon={<FileCode2 className="h-4 w-4" />} title="Mini project" subtitle={progress.miniProject?.completed ? 'complete' : '~' + curriculum.miniProject.estimatedHours + ' hours'} open={openSections.has('mini-project')} onToggle={() => toggleSection('mini-project')}>
        <MiniProjectCard
          topicId={item.id}
          title={curriculum.miniProject.title}
          problem={curriculum.miniProject.problem}
          requirements={curriculum.miniProject.requirements.map((r) => r.text)}
          acceptance={curriculum.miniProject.acceptanceCriteria.map((a) => a.text)}
          state={progress.miniProject}
          onChanged={refresh}
        />
      </Section>

      {/* ===== Assessment ===== */}
      <Section id="assessment" icon={<ListChecks className="h-4 w-4" />} title="Assessment" subtitle={`score ${summary?.assessmentScore ?? 0}%`} open={openSections.has('assessment')} onToggle={() => toggleSection('assessment')}>
        <div className="space-y-4">
          {curriculum.assessment.map((q) => (
            <AssessmentCard key={q.id} topicId={item.id} question={q} answer={progress.assessment[q.id]} onChanged={refresh} />
          ))}
        </div>
      </Section>

      {/* ===== Interview ===== */}
      <Section id="interview" icon={<Trophy className="h-4 w-4" />} title="Interview questions" subtitle={`${summary?.interviewConfident ?? 0}/${curriculum.interviewQuestions.length} confident`} open={openSections.has('interview')} onToggle={() => toggleSection('interview')}>
        <div className="space-y-3">
          {curriculum.interviewQuestions.map((q) => (
            <InterviewCard key={q.id} topicId={item.id} question={q} progress={progress.interview[q.id]} onChanged={refresh} />
          ))}
        </div>
      </Section>

      {/* ===== Repositories ===== */}
      <Section id="repositories" icon={<FileCode2 className="h-4 w-4" />} title="Repositories to study" subtitle={`${curriculum.repositories.length} reference systems`} open={openSections.has('repositories')} onToggle={() => toggleSection('repositories')}>
        <div className="space-y-4">
          {curriculum.repositories.map((repo) => {
            const done = progress.repositorySteps[repo.id] ?? [];
            return (
              <div key={repo.id} className="rounded-md border border-border p-4">
                <a href={repo.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:text-primary hover:underline">
                  {repo.name} <ExternalLink className="-mt-0.5 inline h-3.5 w-3.5" />
                </a>
                <p className="mt-1 text-sm text-muted-foreground">{repo.whyStudy}</p>
                <div className="mt-2 text-xs text-muted-foreground">Look for: {repo.whatToLookFor}</div>
                {repo.importantFiles.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {repo.importantFiles.map((f) => <span key={f} className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-muted-foreground">{f}</span>)}
                  </div>
                )}
                <div className="mt-3 space-y-1.5">
                  {repo.guidedSteps.map((step) => {
                    const isDone = done.includes(step.id);
                    return (
                      <button
                        key={step.id}
                        onClick={() => ProgressRepository.markRepoStep(item.id, repo.id, step.id, !isDone).then(refresh)}
                        className="flex w-full items-start gap-2 rounded-md p-1.5 text-left text-xs hover:bg-accent"
                      >
                        {isDone ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-600" /> : <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                        <span className={cn(isDone && 'text-muted-foreground line-through')}>{step.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ===== Evidence ===== */}
      <Section id="evidence" icon={<Trophy className="h-4 w-4" />} title="Evidence" subtitle={`${summary?.evidenceCount ?? 0} item${(summary?.evidenceCount ?? 0) === 1 ? '' : 's'} — 2 required`} open={openSections.has('evidence')} onToggle={() => toggleSection('evidence')}>
        <EvidenceCard topicId={item.id} items={progress.evidence ?? []} onChanged={refresh} />
      </Section>

      {/* ===== Notes ===== */}
      <Section id="notes" icon={<Lightbulb className="h-4 w-4" />} title="Notes" subtitle="private scratchpad for this topic" open>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
          placeholder="What did you learn? What broke? What would you do differently?"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button
          onClick={async () => {
            await NotesRepository.save(item.id, notes);
            await refresh();
          }}
          className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
        >
          <Save className="h-3.5 w-3.5" /> Save notes
        </button>
        {notesLoaded && <span className="ml-2 text-xs text-muted-foreground">saved locally</span>}
      </Section>

      {/* Videos */}
      {videos.length > 0 && (
        <div>
          <h2 className="text-lg font-bold">Watch &amp; Learn</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map((v, i) => <VideoCard key={`${v.youtubeId}-${i}`} {...v} />)}
          </div>
        </div>
      )}

      {!loaded && <p className="text-sm text-muted-foreground">Loading progress…</p>}
    </div>
  );
}

/* ===================== Section wrapper ===================== */

function Section({
  id,
  icon,
  title,
  subtitle,
  open,
  onToggle,
  children,
}: {
  id: string;
  icon: ReactNode;
  title: string;
  subtitle?: string;
  open: boolean;
  onToggle?: () => void;
  children: ReactNode;
}) {
  const header = onToggle ? (
    <button onClick={onToggle} className="flex w-full items-center gap-3 px-4 py-3 text-left">
      <span className="rounded-md bg-secondary p-1.5 text-primary">{icon}</span>
      <span className="flex-1">
        <span className="block font-medium">{title}</span>
        {subtitle && <span className="block text-xs text-muted-foreground">{subtitle}</span>}
      </span>
      {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
    </button>
  ) : (
    <div className="flex w-full items-center gap-3 px-4 py-3 text-left">
      <span className="rounded-md bg-secondary p-1.5 text-primary">{icon}</span>
      <span className="flex-1">
        <span className="block font-medium">{title}</span>
        {subtitle && <span className="block text-xs text-muted-foreground">{subtitle}</span>}
      </span>
    </div>
  );
  return (
    <section id={id} className="scroll-mt-20 rounded-lg border border-border bg-card">
      {header}
      {open && <div className="border-t border-border px-4 py-4">{children}</div>}
    </section>
  );
}

/* ===================== Lab card ===================== */

function LabCard({
  topicId,
  labId,
  title,
  difficulty,
  minutes,
  problem,
  why,
  requirements,
  hints,
  expectedOutput,
  acceptance,
  skills,
  state,
  onChanged,
}: {
  topicId: string;
  labId: string;
  title: string;
  difficulty: string;
  minutes: number;
  problem: string;
  why: string;
  requirements: string[];
  hints: string;
  expectedOutput: string;
  acceptance: string[];
  skills: string[];
  state?: LabState;
  onChanged: () => Promise<void>;
}) {
  const [githubUrl, setGithubUrl] = useState(state?.githubUrl ?? '');
  const [notes] = useState(state?.notes ?? '');
  const [time, setTime] = useState<number>(state?.timeSpentMinutes ?? 0);

  const status = state?.status ?? 'not_started';
  return (
    <div className="rounded-md border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium">{title}</h3>
            <Badge tone={status === 'completed' ? 'green' : status === 'in_progress' ? 'blue' : 'muted'}>{status.replace('_', ' ')}</Badge>
            <Badge tone="default">{difficulty}</Badge>
            <Badge tone="muted">{minutes} min</Badge>
          </div>
        </div>
        <div className="flex shrink-0 gap-1.5">
          {status !== 'completed' && (
            <button
              onClick={async () => {
                await LabRepository.setStatus(topicId, labId, status === 'not_started' ? 'in_progress' : 'completed');
                onChanged();
              }}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
            >
              {status === 'not_started' ? 'Start lab' : 'Mark complete'}
            </button>
          )}
          {status === 'completed' && (
            <button
              onClick={async () => {
                await LabRepository.setStatus(topicId, labId, 'in_progress');
                onChanged();
              }}
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent"
            >
              Reopen
            </button>
          )}
        </div>
      </div>

      <p className="mt-2 text-sm"><span className="font-medium">Problem: </span>{problem}</p>
      <p className="mt-1 text-sm text-muted-foreground">{why}</p>

      <div className="mt-3 text-sm">
        <div className="font-medium">Requirements</div>
        <ul className="mt-1 list-disc space-y-0.5 pl-5 text-muted-foreground">
          {requirements.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-md bg-secondary/40 p-3 text-xs">
          <div className="font-medium text-foreground">Expected output</div>
          <p className="mt-1 text-muted-foreground">{expectedOutput}</p>
        </div>
        <div className="rounded-md bg-secondary/40 p-3 text-xs">
          <div className="font-medium text-foreground">Acceptance criteria</div>
          <ul className="mt-1 list-disc space-y-0.5 pl-4 text-muted-foreground">
            {acceptance.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      </div>

      {hints && (
        <div className="mt-3 rounded-md border-l-2 border-amber-500/60 bg-amber-500/5 p-3 text-xs text-muted-foreground">
          <span className="font-medium text-amber-600">Hints: </span>{hints}
        </div>
      )}

      {skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {skills.map((s) => <span key={s} className="rounded bg-primary/5 px-1.5 py-0.5 text-xs text-primary/80">{s}</span>)}
        </div>
      )}

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <input
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
          placeholder="GitHub URL (PR or branch)"
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <input
          value={time === 0 ? '' : time}
          onChange={(e) => setTime(Number(e.target.value) || 0)}
          type="number"
          min={0}
          placeholder="Minutes spent"
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button
          onClick={async () => {
            await LabRepository.save(topicId, labId, {
              ...state,
              status,
              githubUrl,
              notes,
              timeSpentMinutes: time,
              evidence: state?.evidence ?? '',
            });
            onChanged();
          }}
          className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
        >
          <Save className="h-3.5 w-3.5" /> Save lab details
        </button>
      </div>
    </div>
  );
}

/* ===================== Mini project card ===================== */

function MiniProjectCard({
  topicId,
  title,
  problem,
  requirements,
  acceptance,
  state,
  onChanged,
}: {
  topicId: string;
  title: string;
  problem: string;
  requirements: string[];
  acceptance: string[];
  state: MiniProjectState;
  onChanged: () => Promise<void>;
}) {
  const [githubUrl, setGithubUrl] = useState(state?.githubUrl ?? '');
  const [notes, setNotes] = useState(state?.notes ?? '');

  return (
    <div className="rounded-md border border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-medium">{title}</h3>
        <Badge tone={state?.completed ? 'green' : 'default'}>{state?.completed ? 'Complete' : 'Pending'}</Badge>
      </div>
      <p className="mt-2 text-sm">{problem}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <div className="text-xs font-medium">Requirements</div>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-muted-foreground">
            {requirements.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
        <div>
          <div className="text-xs font-medium">Acceptance criteria</div>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-muted-foreground">
            {acceptance.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <input
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
          placeholder="GitHub URL"
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes / outcome"
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={async () => {
            await MiniProjectRepository.save(topicId, { completed: !!state?.completed, githubUrl, notes });
            onChanged();
          }}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
        >
          <Save className="h-3.5 w-3.5" /> Save
        </button>
        <button
          onClick={async () => {
            await MiniProjectRepository.save(topicId, { completed: !state?.completed, githubUrl, notes });
            onChanged();
          }}
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
        >
          {state?.completed ? 'Mark incomplete' : 'Mark complete'}
        </button>
      </div>
    </div>
  );
}

/* ===================== Assessment card ===================== */

function AssessmentCard({
  topicId,
  question,
  answer,
  onChanged,
}: {
  topicId: string;
  question: { id: string; type: string; question: string; options?: string[]; correctOption?: number; idealAnswer?: string };
  answer?: AssessmentAnswer;
  onChanged: () => Promise<void>;
}) {
  const [text, setText] = useState((answer as AssessmentAnswer)?.text ?? '');
  const selected = (answer as AssessmentAnswer)?.selectedOption;

  async function save(a: AssessmentAnswer) {
    await AssessmentRepository.save(topicId, question.id, a);
    onChanged();
  }

  return (
    <div className={cn('rounded-md border p-4', answer ? 'border-green-500/30 bg-green-500/5' : 'border-border')}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={question.type === 'mcq' ? 'blue' : question.type === 'architecture' ? 'purple' : 'default'}>{question.type.replace('_', ' ')}</Badge>
        {answer && <Badge tone="green">submitted</Badge>}
      </div>
      <p className="mt-2 text-sm font-medium">{question.question}</p>

      {question.type === 'mcq' && question.options ? (
        <div className="mt-3 space-y-1.5">
          {question.options.map((opt, i) => {
            const isSelected = selected === i;
            const isCorrect = i === question.correctOption;
            return (
              <button
                key={i}
                onClick={() => save({ selectedOption: i, text: '' })}
                className={cn(
                  'flex w-full items-start gap-2 rounded-md border p-2.5 text-left text-sm transition-colors',
                  answer && isCorrect ? 'border-green-500/50 bg-green-500/10 text-green-600' :
                  answer && isSelected && !isCorrect ? 'border-red-500/50 bg-red-500/10 text-red-500' :
                  isSelected ? 'border-primary/60 bg-primary/10' : 'border-border hover:bg-accent'
                )}
              >
                <span className="font-mono text-xs">{String.fromCharCode(97 + i)})</span> {opt}
              </button>
            );
          })}
          {answer && (
            <p className="mt-1 text-xs text-muted-foreground">
              {selected === question.correctOption ? 'Correct.' : `Answer: ${question.options![question.correctOption!]}`}
            </p>
          )}
        </div>
      ) : (
        <div className="mt-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Write your answer…"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => save({ text, selectedOption: undefined })}
              disabled={text.trim() === ''}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              Submit answer
            </button>
            {answer && question.idealAnswer && (
              <details className="flex-1">
                <summary className="cursor-pointer rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent">Reveal ideal answer</summary>
                <p className="mt-2 rounded-md bg-secondary/40 p-3 text-sm text-muted-foreground">{question.idealAnswer}</p>
              </details>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ===================== Interview card ===================== */

const confidences: { value: InterviewStatus; label: string }[] = [
  { value: 'not_attempted', label: 'Not attempted' },
  { value: 'attempted', label: 'Attempted' },
  { value: 'confident', label: 'Confident' },
  { value: 'mastered', label: 'Mastered' },
];

function InterviewCard({
  topicId,
  question,
  progress,
  onChanged,
}: {
  topicId: string;
  question: { id: string; question: string; idealAnswer: string };
  progress?: { status: InterviewStatus; confidence: number; myAnswer: string };
  onChanged: () => Promise<void>;
}) {
  const [myAnswer, setMyAnswer] = useState(progress?.myAnswer ?? '');
  const status = progress?.status ?? 'not_attempted';

  return (
    <div className="rounded-md border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-sm font-medium">{question.question}</p>
        <select
          value={status}
          onChange={async (e) => {
            await InterviewRepository.save(topicId, question.id, {
              status: e.target.value as InterviewStatus,
              confidence: progress?.confidence ?? 0,
              myAnswer,
            });
            onChanged();
          }}
          className="shrink-0 rounded-md border border-border bg-card px-2 py-1 text-xs"
        >
          {confidences.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        <span>Confidence</span>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={progress?.confidence ?? 0}
          onChange={async (e) => {
            await InterviewRepository.save(topicId, question.id, { status, confidence: Number(e.target.value), myAnswer });
            onChanged();
          }}
          className="h-1.5 flex-1 accent-current"
        />
        <span className="w-8 font-mono">{progress?.confidence ?? 0}</span>
      </div>
      <textarea
        value={myAnswer}
        onChange={(e) => setMyAnswer(e.target.value)}
        onBlur={async () => {
          await InterviewRepository.save(topicId, question.id, { status, confidence: progress?.confidence ?? 0, myAnswer });
          onChanged();
        }}
        rows={2}
        placeholder="Your answer — speak it out loud…"
        className="mt-3 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
      <details className="mt-2">
        <summary className="cursor-pointer rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent">Reveal ideal answer</summary>
        <p className="mt-2 rounded-md bg-secondary/40 p-3 text-sm text-muted-foreground">{question.idealAnswer}</p>
      </details>
    </div>
  );
}

/* ===================== Evidence card ===================== */

function EvidenceCard({
  topicId,
  items,
  onChanged,
}: {
  topicId: string;
  items: { id: string; type: string; title: string; url: string; date: string }[];
  onChanged: () => Promise<void>;
}) {
  const [type, setType] = useState('repository');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');

  async function add() {
    if (!title.trim()) return;
    await EvidenceRepository.add(topicId, {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      title,
      url: url.trim(),
      date: new Date().toISOString(),
    });
    setTitle('');
    setUrl('');
    onChanged();
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Attach a pull request, repo, benchmark, article, or deployment that demonstrates this topic. Two items unlock the evidence weight.
      </p>
      <div className="flex flex-wrap gap-2">
        <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-md border border-border bg-card px-2 py-1.5 text-sm">
          {['repository', 'pull_request', 'benchmark', 'article', 'deployment', 'certification', 'experiment'].map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
        </select>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (e.g. PR: reset detection tests)"
          className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="URL (optional)"
          className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button
          onClick={add}
          disabled={!title.trim()}
          className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>

      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map((e) => (
            <div key={e.id} className="flex items-center justify-between gap-2 rounded-md border border-border p-2.5">
              <div className="min-w-0">
                <a href={e.url || '#'} target="_blank" rel="noopener noreferrer" className="truncate text-sm font-medium hover:text-primary hover:underline">
                  {e.title}
                </a>
                <div className="text-xs text-muted-foreground">{e.type.replace('_', ' ')} · {new Date(e.date).toLocaleDateString()}</div>
              </div>
              <button
                onClick={async () => {
                  await EvidenceRepository.remove(topicId, e.id);
                  onChanged();
                }}
                className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-red-500"
                aria-label="Remove evidence"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">No evidence yet.</p>
      )}
    </div>
  );
}