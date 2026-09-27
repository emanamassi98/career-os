import type { ProjectBuild } from '@/types';

export const projectBuilds: ProjectBuild[] = [
  {
    projectId: 'cairn',
    title: 'Cairn — Fleet Introspection Plane',
    slug: 'cairn',
    tagline: 'A cAdvisor clone with a query-shaped API that answers "which containers are about to fall over, and why?"',
    overview:
      'Three binaries — cairn-agent (DaemonSet), cairn-collector (sharded), cairn-api (query surface) — that read cgroup v2 from every node and expose a fleet-wide query layer over a recent-window collector plus a BigQuery/GCS historical tier.',
    problem:
      'On-call engineers ask "which containers on my fleet are under memory pressure / being throttled to death" at 3am, and no tool answers directly. cAdvisor/Prometheus hand you counters and make you assemble the question yourself.',
    difficulty: 'production',
    estimatedHours: { min: 120, max: 260 },
    skills: [
      { id: 'go', name: 'Go' },
      { id: 'cgroup-v2', name: 'cgroup v2' },
      { id: 'consistent-hashing', name: 'Consistent Hashing' },
      { id: 'gke', name: 'GKE' },
      { id: 'bigquery', name: 'BigQuery' },
    ],
    technologies: [
      { id: 'lang', label: 'Language', recommended: 'Go', alternatives: ['Rust'], why: 'Prevalence in this field, stdlib HTTP, and the ecosystem you will actually work in.' },
      { id: 'storage', label: 'Hot storage', recommended: 'In-memory ring window', alternatives: ['Redis'], why: 'The recent window is an in-process data structure; Redis adds a hop for no benefit at this scale.' },
      { id: 'cold-storage', label: 'Cold storage', recommended: 'GCS parquet + BigQuery external tables', alternatives: ['ClickHouse'], why: 'The assignment demands it, and external tables make the historical tier cheap to stand up.' },
    ],
    prerequisites: [
      { id: 'pre-linux', skill: 'Linux', required: true },
      { id: 'pre-go', skill: 'Go basics', roadmapSlug: 'the-naive-agent', required: true },
      { id: 'pre-k8s', skill: 'Kubernetes basics', roadmapSlug: 'kubernetes-deployment', required: true },
    ],
    objectives: [
      { id: 'obj-c-1', text: 'Read real cgroup v2 numbers on a live cluster.' },
      { id: 'obj-c-2', text: 'Answer fleet queries honestly, including staleness.' },
      { id: 'obj-c-3', text: 'Run it for real on GKE with GitOps.' },
    ],
    contextEngineering: [
      { id: 'ctx-1', question: 'Which containers are above 90% memory on the fleet right now?', example: 'GET /fleet/pressure?over=memory&threshold=0.9' },
    ],
    architecture: {
      flow: ['Agent walks /sys/fs/cgroup', 'Collector fans in agents over a hash ring', 'cairn-api evaluates predicates over the window', 'Standing queries emit to Pub/Sub', 'Rollups land in GCS parquet → BigQuery'],
      why: ['Read-only hostPath keeps the threat model short', 'Pull-scrape makes scrape failure itself signal', 'Named queries with one escape hatch keep the product honest'],
      decisions: [
        { id: 'adr-1', question: 'Push or pull?', answer: 'Pull — the failure of a scrape is signal, same as Prometheus.' },
        { id: 'adr-2', question: 'How expressive is the query layer?', answer: 'Named queries with parameters plus /fleet/query as the single escape hatch.' },
      ],
    },
    milestones: [
      { id: 'ms-1', title: 'Naive agent', summary: 'Reads cgroups, serves /vitals, explains the working-set lie.', taskIds: ['t-1', 't-2', 't-3'] },
      { id: 'ms-2', title: 'Query engine', summary: 'The product surface: pressure, throttled, and the general form.', taskIds: ['t-4', 't-5'] },
      { id: 'ms-3', title: 'Fleet deploy', summary: 'Sharded collectors, GKE, GitOps, and observability.', taskIds: ['t-6', 't-7'] },
    ],
    tasks: [
      { id: 't-1', milestoneId: 'ms-1', title: 'cgroup walker', goal: 'Recursively read cgroup v2 files.', whyItMatters: 'Nothing else exists before this.', prerequisites: ['Linux'], concepts: ['cgroup v2'], approach: ['Walk the tree', 'Parse ints and max'], acceptanceCriteria: ['Raw files parse correctly'] },
      { id: 't-2', milestoneId: 'ms-1', title: '/vitals endpoint', goal: 'Serve readings as JSON.', whyItMatters: 'First HTTP surface.', prerequisites: ['Go stdlib'], concepts: ['net/http', 'JSON'], approach: ['Single handler', 'Structured logs'], acceptanceCriteria: ['curl returns JSON'], evidenceRequirement: 'A repo with tests.' },
      { id: 't-3', milestoneId: 'ms-1', title: 'Working-set ADR', goal: 'Explain the page-cache discrepancy in writing.', whyItMatters: 'Monitoring is modelling, not reading.', prerequisites: ['Cluster'], concepts: ['working set'], approach: ['Run the experiment', 'Write the ADR'], acceptanceCriteria: ['Numbers from own cluster'] },
      { id: 't-4', milestoneId: 'ms-2', title: 'Named queries', goal: '/fleet/pressure and /fleet/throttled.', whyItMatters: 'The product.', prerequisites: ['t-2'], concepts: ['predicate eval'], approach: ['ADR 004 first', 'Return triggering values'], acceptanceCriteria: ['Worst-first with values'], evidenceRequirement: 'API tests + ADR 004.' },
      { id: 't-5', milestoneId: 'ms-2', title: 'Escape hatch', goal: 'Minimal /fleet/query parser.', whyItMatters: 'Proves generality without owning a whole language.', prerequisites: ['t-4'], concepts: ['tokenizer'], approach: ['Hand-written parser', 'Good errors'], acceptanceCriteria: ['Sample expression works'] },
      { id: 't-6', milestoneId: 'ms-3', title: 'Hash-ring collector', goal: 'Ordered fan-in with rebalance semantics.', whyItMatters: 'One node was easy; forty is the job.', prerequisites: ['Go concurrency'], concepts: ['consistent hashing'], approach: ['Ring + ownership', 'Gaps-or-duplicates decision'], acceptanceCriteria: ['Rebalance tested'], evidenceRequirement: 'Chaos drill notes.' },
      { id: 't-7', milestoneId: 'ms-3', title: 'GKE + GitOps + observability', goal: 'Run Cairn on GKE with OIDC CI and self-monitoring.', whyItMatters: 'The recursive part: monitor the monitor.', prerequisites: ['GCP'], concepts: ['Workload Identity', 'ArgoCD', 'SLOs'], approach: ['Terraform everything', 'Diff against cAdvisor'], acceptanceCriteria: ['runs for real on GKE'] },
    ],
    labs: [
      { id: 'labs-c-1', title: 'Working-set experiment', problem: 'Compare memory.current, kubectl top, cAdvisor on one pod.', description: 'The thesis of the project, felt not read.', compare: ['memory.current', 'kubectl top pod', 'cAdvisor working set'], measure: ['The gap between raw and working set'], deliverables: ['ADR-001 with numbers'], estimatedMinutes: 150 },
    ],
    experiments: [
      { id: 'exp-c-1', name: 'Rate reset', description: 'How a restart distorts rate.', variants: ['reset-aware delta', 'prometheus reset assumption'], metrics: ['negative rate count', 'AUC error'], expectedInsights: 'Prometheus\'s assumption is right even when wrong.' },
    ],
    evaluation: {
      description: 'Ships, answers real queries, is honest about silence, and can be monitored by itself.',
      metrics: [
        { key: 'latency', name: 'Query latency p99', unit: 'ms', description: 'Memory tier < 500ms.' },
        { key: 'coverage', name: 'Node reporting', unit: '%', description: '95% of nodes within 30s.' },
        { key: 'cost', name: 'Cost per node', unit: '$/mo', description: 'GCS + BigQuery + DaemonSet overhead.' },
      ],
    },
    testing: [
      { id: 'test-1', text: 'Race detector passes', description: 'Concurrent scrape loops are clean under -race.' },
      { id: 'test-2', text: 'Chaos drills', description: 'Collector death, partition, clock step, full disk.' },
      { id: 'test-3', text: 'Load test at 4,000 containers', description: 'First bottleneck identified and acknowledged.' },
    ],
    security: [
      { id: 'sec-1', title: 'Agent blast radius', threat: 'Compromised agent reads all container profiles on a node.', attackExample: 'RAT in a container image.', mitigation: 'Read-only mount, nodes/proxy only.', test: 'Attempt surface beyond the mount.' },
    ],
    deployment: [
      { id: 'dep-1', text: 'Kustomize base + overlays', description: 'dev and prod from one base.' },
      { id: 'dep-2', text: 'ArgoCD reconciliation', description: 'Repo is source of truth.' },
    ],
    relatedRoadmap: [
      { slug: 'the-naive-agent', label: 'Phase 0: Naive Agent' },
      { slug: 'query-engine', label: 'Phase 3: Query Engine' },
      { slug: 'fleet-fan-in', label: 'Phase 4: Fleet Fan-In' },
    ],
    relatedRepositories: [
      { id: 'repo-cadvisor', name: 'cAdvisor', url: 'https://github.com/google/cadvisor', whyStudy: 'The original you are reimplementing — your diff target.', whatToLookFor: 'Working-set computation', importantFiles: ['container/libcontainer/handler.go'], concepts: ['working-set'], guidedSteps: [{ id: 'rs-1', text: 'Find the working-set function.' }] },
    ],
    portfolioFields: [
      { id: 'pf-1', label: 'Architecture diagram', placeholder: 'Paste the three-binary + GCS/BigQuery diagram.' },
      { id: 'pf-2', label: 'Query language sample', placeholder: 'Show a predicate and its answer.' },
    ],
    completionRequirements: {
      projectComplete: ['All milestone tasks done.', 'Chaos and load reports committed.'],
      portfolioReady: ['Architecture diagram final.', 'Query API demonstrated with real answers.'],
      interviewReady: ['Can defend every ADR out loud.', 'Diffed Cairn against cAdvisor and explained discrepancies.'],
    },
    githubUrl: 'https://github.com/emanamassi/career-os-eman',
    demoUrl: 'https://emanamassi.github.io/career-os-eman/',
  },
];

export function getProjectBuild(slug: string): ProjectBuild | undefined {
  return projectBuilds.find((p) => p.slug === slug);
}