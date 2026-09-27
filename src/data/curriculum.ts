import type { TopicCurriculum } from '@/types';

const curricula: Record<string, TopicCurriculum> = {
  // =====================================================================
  // Phase 0: The Naive Agent
  // =====================================================================
  'rm-1': {
    topicId: 'rm-1',
    introduction:
      'Write the dumbest possible thing: a Go binary that walks /sys/fs/cgroup, reads the relevant control files, and returns them as JSON on GET /vitals. No Kubernetes awareness. Then do the thing that makes the whole project work: run a pod with a known memory limit, read a large file, and compare memory.current with kubectl top pod and cAdvisor. They won\'t agree — yours will be higher — and explaining why is the point.',
    estimatedHours: 12,
    difficulty: 'beginner',
    objectives: [
      { id: 'obj-1-1', text: 'Explain what each cgroup v2 control file holds (memory.current, memory.max, memory.stat, memory.events, cpu.stat, cpu.max, pids.current, io.stat).' },
      { id: 'obj-1-2', text: 'Walk the cgroup v2 filesystem from a Go binary using only the standard library.' },
      { id: 'obj-1-3', text: 'Serve a /vitals JSON endpoint with log/slog structured logging from line one.' },
      { id: 'obj-1-4', text: 'Demonstrate the working-set discrepancy and write ADR 001 explaining it in writing.' },
    ],
    resources: [
      { id: 'res-1-1', title: 'cgroup v2 Kernel Docs (memory section)', kind: 'documentation', source: 'kernel.org', url: 'https://docs.kernel.org/admin-guide/cgroup-v2.html', description: 'Dry and authoritative. Read the memory section end to end.', difficulty: 'intermediate', estimatedMinutes: 90, priority: 'high' },
      { id: 'res-1-2', title: 'cgroup v2 — Red Hat intro', kind: 'article', source: 'Red Hat', url: 'https://www.redhat.com/en/blog/linux-cgroups-part-1', description: 'A gentler on-ramp to what cgroups are and why they exist.', difficulty: 'beginner', estimatedMinutes: 20, priority: 'high' },
      { id: 'res-1-3', title: 'Write Web Apps in Go (net/http)', kind: 'documentation', source: 'go.dev', url: 'https://go.dev/doc/articles/wiki/', description: 'The classic tour of a stdlib HTTP server in Go.', difficulty: 'beginner', estimatedMinutes: 60, priority: 'medium' },
      { id: 'res-1-4', title: 'cAdvisor: working-set computation', kind: 'repository', source: 'github.com/google', url: 'https://github.com/google/cadvisor/blob/master/container/libcontainer/handler.go', description: 'Read it after your own attempt, not before, and find where working set is computed.', difficulty: 'intermediate', estimatedMinutes: 45, priority: 'medium' },
    ],
    labs: [
      {
        id: 'lab-1-1',
        title: 'Read the raw files',
        problem: 'Walk /sys/fs/cgroup and print every control file relevant to memory, cpu, pids, and io for each cgroup directory.',
        whyItMatters: 'If you cannot read a file and parse an integer reliably, nothing else in the project exists.',
        prerequisites: ['Basic Go', 'Linux shell'],
        requirements: [
          { id: 'req-1-1', text: 'Recursively walk cgroup v2 directories under /sys/fs/cgroup.' },
          { id: 'req-1-2', text: 'Parse memory.current, memory.max, cpu.stat, cpu.max, pids.current, pids.max, memory.events, io.stat.' },
          { id: 'req-1-3', text: 'Skip files that do not exist for a given cgroup and log the skip.' },
        ],
        hints: 'cgroup v2 has a unified hierarchy. Root is your system cgroup; leaf directories are the interesting ones. Memory limits can be "max", so parse that as the sentinel.',
        expectedOutput: 'A JSON object per cgroup with parsed numeric fields and a "max" sentinel handled.',
        acceptanceCriteria: [
          { id: 'ac-1-1', text: 'At least one real cgroup renders all fields as numbers.' },
          { id: 'ac-1-2', text: '"max" limits are represented, not parse errors.' },
          { id: 'ac-1-3', text: 'Skips are logged with slog, not silently dropped.' },
        ],
        skillsPracticed: ['cgroup-v2', 'go', 'syscalls'],
        estimatedMinutes: 120,
        difficulty: 'beginner',
      },
      {
        id: 'lab-1-2',
        title: 'Serve /vitals',
        problem: 'Expose the readings from lab 1 as JSON on GET /vitals over HTTP.',
        whyItMatters: 'The whole platform is a set of HTTP surfaces; the agent is the first one.',
        prerequisites: ['lab-1-1', 'Go net/http'],
        requirements: [
          { id: 'req-1-4', text: 'GET /vitals returns the full set of cgroup readings as JSON.' },
          { id: 'req-1-5', text: 'Requests are logged with slog (method, path, latency).' },
          { id: 'req-1-6', text: 'The server starts from a single entrypoint command.' },
        ],
        hints: 'Use http.ServeMux and a single handler struct. Prefer explicit JSON fields over map[string]interface{}.',
        expectedOutput: 'curl localhost:8080/vitals returns a structured snapshot of the machine.',
        acceptanceCriteria: [
          { id: 'ac-1-4', text: 'The endpoint is reachable and returns valid JSON.' },
          { id: 'ac-1-5', text: 'A request appears as a structured log line.' },
        ],
        skillsPracticed: ['go', 'rest-apis'],
        estimatedMinutes: 90,
        difficulty: 'beginner',
      },
      {
        id: 'lab-1-3',
        title: 'The working-set experiment',
        problem: 'Run a container with a known memory limit, have it read a large file into page cache, and compare three numbers: your memory.current reading, kubectl top pod, and cAdvisor\'s working set.',
        whyItMatters: 'This is the thesis of the assignment: monitoring is a modelling problem, not a reading problem. You must feel the "obvious reading is wrong" before you can design anything above it.',
        prerequisites: ['A running Kubernetes cluster', 'kubectl', 'lab-1-1'],
        requirements: [
          { id: 'req-1-7', text: 'Create a pod with an explicit memory limit (e.g. 256Mi).' },
          { id: 'req-1-8', text: 'Inside the pod, read a file large enough to fill page cache.' },
          { id: 'req-1-9', text: 'Record memory.current from your agent, kubectl top pod, and cAdvisor working set at the same moment.' },
        ],
        hints: 'memory.current includes page cache. Page cache is reclaimable. Working set ≈ memory.current − inactive_file. The OOM killer approximates working set, not current.',
        expectedOutput: 'Three numbers that do not agree, yours being highest.',
        acceptanceCriteria: [
          { id: 'ac-1-6', text: 'You can explain the discrepancy in ADR 001 in writing, with numbers from your own cluster.' },
          { id: 'ac-1-7', text: 'You have not changed the code to "fix" the discrepancy.' },
        ],
        skillsPracticed: ['cgroup-v2', 'go', 'k8s-api'],
        estimatedMinutes: 150,
        difficulty: 'intermediate',
      },
    ],
    miniProject: {
      id: 'mp-1',
      title: 'Cairn Agent — Phase 0',
      problem: 'Ship a working cairn-agent binary that walks cgroups and serves /vitals, plus a docs/adr/001-working-set.md that explains the page-cache lie with your cluster\'s numbers.',
      requirements: [
        { id: 'mpr-1-1', text: 'cairn-agent builds with `go build ./cmd/cairn-agent`.' },
        { id: 'mpr-1-2', text: 'GET /vitals returns real numbers for the host it runs on.' },
        { id: 'mpr-1-3', text: 'ADR-001 exists and explains working set with evidence.' },
      ],
      acceptanceCriteria: [
        { id: 'mpa-1-1', text: 'The binary runs and /vitals returns JSON.' },
        { id: 'mpa-1-2', text: 'An engineer can read ADR-001 and reproduce the experiment.' },
      ],
      skillsPracticed: ['go', 'cgroup-v2', 'syscalls'],
      estimatedHours: 6,
    },
    repositories: [
      {
        id: 'repo-cadvisor',
        name: 'cAdvisor',
        url: 'https://github.com/google/cadvisor',
        whyStudy: 'The project you are reimplementing. The discrepancies with its output are your unit tests.',
        whatToLookFor: 'Working-set computation, how it caches container identities, and how it handles counters across restarts.',
        importantFiles: ['container/libcontainer/handler.go', 'container/common/helpers.go'],
        concepts: ['working-set', 'container identity', 'scrape loop'],
        guidedSteps: [
          { id: 'rs-c-1', text: 'Find the function that computes working set.' },
          { id: 'rs-c-2', text: 'Trace where inactive_file is subtracted.' },
          { id: 'rs-c-3', text: 'Note what happens on container restart in the handler.' },
        ],
      },
    ],
    assessment: [
      { id: 'as-1-1', type: 'mcq', question: 'A cgroup\'s memory.current reads 95% of memory.max. Which claim is definitely TRUE?', options: ['The container is about to be OOM-killed.', 'The number includes reclaimable page cache.', 'kubectl top pod shows the same number.', 'The cgroup is out of memory.'], correctOption: 1 },
      { id: 'as-1-2', type: 'short_answer', question: 'Why is working set approximately memory.current − inactive_file? Write the reasoning as you would in an ADR.', idealAnswer: 'memory.current includes all file-backed pages charged to the cgroup, including clean, reclaimable page cache. That cache is not "memory in use" in the human sense. The kernel approximates what a workload actually needs as the working set, excluding inactive file pages, and cAdvisor/kubectl top report that instead of the raw charge.' },
      { id: 'as-1-3', type: 'short_answer', question: 'What does memory.events tell you, and why is oom_kill a counter worth alerting on that is different from oom?', idealAnswer: 'memory.events holds monotonic counters for oom and oom_kill events. oom means the kernel considered the cgroup for OOM, oom_kill means it actually killed a process. A rising oom_kill is a past-tense alert: a kill already happened. oom can rise without a kill if other cgroups get reclaimed instead. The distinction matters because your alert message must not claim a kill happened when only pressure did.' },
      { id: 'as-1-4', type: 'architecture', question: 'Draw the read path for /vitals on a single node. Where would you add caching, and what would you trade for it?', idealAnswer: 'Handler → walk function per cgroup → file reads → JSON encode. Caching stale readings would lower per-request latency but make the endpoint lie under churn; the naive agent should prefer fresh reads and accept the cost.' },
    ],
    interviewQuestions: [
      { id: 'iq-1-1', question: 'Your container\'s memory.current is at 95% of memory.max. Is it about to be OOM-killed? How do you know, and which of you (you, kubectl, cAdvisor) is lying?', idealAnswer: 'No — current includes reclaimable page cache. You need working set and, more importantly, memory.events and the kernel\'s actual pressure decision (which considers reclaimability, shrinkers, and the global scoring). The answer is "probably not, here\'s the evidence", and the three tools disagree precisely because they model memory differently.' },
      { id: 'iq-1-2', question: 'What does the OOM killer approximate, and why does cAdvisor/kubectl top display a different number than memory.current?', idealAnswer: 'The OOM killer approximates working set. memory.current is a raw charge; working set strips reclaimable file cache. Displaying the charge would make every container look like it has a mystery sidecar, so the tools report working set.' },
      { id: 'iq-1-3', question: 'How would you verify your agent is correct without trusting yourself?', idealAnswer: 'Diff against ground truth: kubectl top and cAdvisor. Where they disagree, one of you is wrong, and you find out which by isolating the variable (run under load, not idle), and by reading the kernel source for the exact computation.' },
    ],
  },

  // =====================================================================
  // Phase 1: Container Discovery
  // =====================================================================
  'rm-2': {
    topicId: 'rm-2',
    introduction:
      'Your agent reports cgroup paths; nobody wants cgroup paths. Turn kubepods-burstable-pod3f2a.../cri-containerd-9ab4....scope into default/checkout-7d9f4-x2klm/checkout. This is the hardest and least glamorous week: there is no clean API, and the string parsing is load-bearing. Do the kubelet /pods route first, treat CRI over containerd as a stretch.',
    estimatedHours: 14,
    difficulty: 'intermediate',
    objectives: [
      { id: 'obj-2-1', text: 'Explain the two cgroup driver layouts (systemd vs cgroupfs) and how pod UIDs appear in each.' },
      { id: 'obj-2-2', text: 'Authenticate to the kubelet /pods endpoint with a nodes/proxy token.' },
      { id: 'obj-2-3', text: 'Map container IDs in cgroup paths to pod/namespace/container identities, filtering pause containers.' },
      { id: 'obj-2-4', text: 'Write ADR 002 defending the discovery route you chose.' },
    ],
    resources: [
      { id: 'res-2-1', title: 'Kubelet API: pods endpoint', kind: 'documentation', source: 'kubernetes.io', url: 'https://kubernetes.io/docs/concepts/overview/kubernetes-api/', description: 'How to hit the node-local read-only API and what RBAC it needs.', difficulty: 'intermediate', estimatedMinutes: 40, priority: 'high' },
      { id: 'res-2-2', title: 'Kubernetes Pod Lifecycle', kind: 'documentation', source: 'kubernetes.io', url: 'https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/', description: 'Container statuses, containerIDs, and restart semantics.', difficulty: 'intermediate', estimatedMinutes: 30, priority: 'high' },
      { id: 'res-2-3', title: 'containerd CRI socket', kind: 'documentation', source: 'containerd.io', url: 'https://containerd.io/docs/getting-started/', description: 'The stretch route: gRPC ListContainers + ContainerStatus over the socket.', difficulty: 'advanced', estimatedMinutes: 60, priority: 'low' },
      { id: 'res-2-4', title: 'How cAdvisor handles container discovery', kind: 'repository', source: 'github.com/google', url: 'https://github.com/google/cadvisor', description: 'The exact burden you are now carrying: a decade of it.', difficulty: 'intermediate', estimatedMinutes: 45, priority: 'medium' },
    ],
    labs: [
      {
        id: 'lab-2-1',
        title: 'Parse cgroup paths for both drivers',
        problem: 'Write parsers that turn a raw cgroup path into {podUID?, containerID, qos} for both the systemd and cgroupfs layouts.',
        whyItMatters: 'The cgroup driver decides the string layout. Handle both or document loudly that you only handle one.',
        prerequisites: ['cgroup v2 basics', 'Sample paths from lab 1'],
        requirements: [
          { id: 'req-2-1', text: 'Parse systemd-style paths (kubepods-burstable-pod<uid>.slice/cri-containerd-<id>.scope).' },
          { id: 'req-2-2', text: 'Parse cgroupfs-style paths (kubepods/burstable/pod<uid>/<id>).' },
          { id: 'req-2-3', text: 'Handle the variable-depth hierarchy: guaranteed pods sit directly under kubepods.slice.' },
          { id: 'req-2-4', text: 'Export QoS class from the path segment.' },
        ],
        hints: 'The UID in the cgroup path is the container ID, not the pod UID — do not mix them. The systemd driver writes pod UIDs with underscores instead of dashes.',
        expectedOutput: 'A path → identity parse table with a unit test per driver.',
        acceptanceCriteria: [
          { id: 'ac-2-1', text: 'Both driver layouts parse to the same identity structure.' },
          { id: 'ac-2-2', text: 'Tests cover the guaranteed (shallow) and burstable (deep) hierarchies.' },
        ],
        skillsPracticed: ['cgroup-v2', 'go', 'containerd'],
        estimatedMinutes: 120,
        difficulty: 'intermediate',
      },
      {
        id: 'lab-2-2',
        title: 'Query kubelet /pods and join identities',
        problem: 'Get the node\'s PodList from kubelet (https://<node>:10250/pods) with a nodes/proxy token, extract containerStatuses[].containerID, and join it to your cgroup container IDs.',
        whyItMatters: 'This is the mapping problem solved for real: it is the only source of truth for what a container "is".',
        prerequisites: ['RBAC fundamentals', 'lab-2-1'],
        requirements: [
          { id: 'req-2-5', text: 'Create a ServiceAccount with nodes/proxy RBAC only.' },
          { id: 'req-2-6', text: 'Fetch and decode the PodList from the kubelet pod endpoint.' },
          { id: 'req-2-7', text: 'Join CRI container IDs from cgroup paths to identity from the PodList.' },
        ],
        hints: 'Identify and filter the pause container — every pod has one and it would otherwise look like a mystery sidecar. Use the test/init containers markers or the sandbox ID in containerStatuses.',
        expectedOutput: '/vitals returns real pod names: namespace/pod/container.',
        acceptanceCriteria: [
          { id: 'ac-2-3', text: 'A known pod renders as default/name/container, not a cgroup path.' },
          { id: 'ac-2-4', text: 'Pause containers are filtered and the filter is explained in code.' },
        ],
        skillsPracticed: ['k8s-api', 'rbac', 'go'],
        estimatedMinutes: 150,
        difficulty: 'intermediate',
      },
      {
        id: 'lab-2-3',
        title: 'Stretch: CRI over containerd',
        problem: 'Re-implement discovery over the containerd socket via gRPC (ListContainers + ContainerStatus).',
        whyItMatters: 'More direct and runtime-coupled; it shows you what the kubelet route hides.',
        prerequisites: ['gRPC basics'],
        requirements: [
          { id: 'req-2-8', text: 'Connect to unix:///run/containerd/containerd.sock with the CRI API.' },
          { id: 'req-2-9', text: 'Map attrs.labels back to pod identity.' },
        ],
        hints: 'This is stretch. If the kubelet route works, the bar for switching is high: you now deal with a socket, a protocol, and runtime lock-in.',
        expectedOutput: 'The same identity table, produced without the kubelet.',
        acceptanceCriteria: [{ id: 'ac-2-5', text: 'The table matches the kubelet route for at least 10 containers.' }],
        skillsPracticed: ['containerd', 'go'],
        estimatedMinutes: 120,
        difficulty: 'advanced',
      },
    ],
    miniProject: {
      id: 'mp-2',
      title: 'Discovery layer + ADR 002',
      problem: 'cairn-agent now reports real names in /vitals, powered by the kubelet route, with docs/adr/002-container-discovery.md explaining why.',
      requirements: [
        { id: 'mpr-2-1', text: '/vitals reports namespace/pod/container for discovered containers.' },
        { id: 'mpr-2-2', text: 'ADR 002 states the route chosen and what you gave up.' },
      ],
      acceptanceCriteria: [
        { id: 'mpa-2-1', text: 'Discovery works against a real cluster.' },
        { id: 'mpa-2-2', text: 'The pause container never appears in output.' },
      ],
      skillsPracticed: ['k8s-api', 'go', 'rbac'],
      estimatedHours: 8,
    },
    repositories: [
      {
        id: 'repo-cadvisor',
        name: 'cAdvisor (discovery area)',
        url: 'https://github.com/google/cadvisor',
        whyStudy: 'It carries this exact string-parsing burden for a decade.',
        whatToLookFor: 'How it detects the runtime and caches the mapping.',
        importantFiles: ['container/raw/', 'container/containerd/', 'container/libcontainer/'],
        concepts: ['runtime detection', 'identity cache', 'pause filtering'],
        guidedSteps: [
          { id: 'rs-c-4', text: 'Find where cAdvisor decides the runtime from the path prefix.' },
          { id: 'rs-c-5', text: 'Trace the pause-container filter.' },
          { id: 'rs-c-6', text: 'Note how it caches identities and what invalidates them.' },
        ],
      },
    ],
    assessment: [
      { id: 'as-2-1', type: 'mcq', question: 'The UID appearing inside a cgroup path like …pod<uid>.slice/cri-containerd-<id>.scope is which of the following?', options: ['The pod UID', 'The container ID', 'The node name', 'The sandbox namespace ID'], correctOption: 1 },
      { id: 'as-2-2', type: 'mcq', question: 'Where does the guaranteed QoS class typically sit in the cgroup hierarchy?', options: ['Directly under kubepods.slice', 'Under a separate compensation slice', 'At the same depth as best-effort', 'Only in cgroupfs, never systemd'], correctOption: 0 },
      { id: 'as-2-3', type: 'short_answer', question: 'Why must the pause container be filtered, and how do you identify it?', idealAnswer: 'Every pod has one sandbox/pause container that uses ~0 CPU and ~500KB. If reported, every pod looks like it has a mystery container consuming resources. Identify it via the sandbox metadata in containerStatuses (or its role/test labels), then exclude it from the vitals set or explicitly flag it.' },
      { id: 'as-2-4', type: 'architecture', question: 'You spent a week on string parsing to work around the absence of a stable interface. Is that a failure of the ecosystem, or is the instability load-bearing?', idealAnswer: 'Defensible either way, and that is the point. It is load-bearing in some sense: an explicit, if unstable, string encoding is what lets the kernel not own a container identity registry. cAdvisor paying this cost for everyone is a real engineering trade.' },
    ],
    interviewQuestions: [
      { id: 'iq-2-1', question: 'How do you map a cgroup path to a Kubernetes pod identity, and what breaks this mapping?', idealAnswer: 'Two routes: kubelet /pods (containerID → status) or CRI over the socket. Breaks: driver layout differences, UID/containerID confusion, pause containers, runtime prefix changes, and container restarts that silently change the ID.' },
      { id: 'iq-2-2', question: 'What does "one agent per node" require from RBAC, and what is the leaast privilege that works?', idealAnswer: 'A ServiceAccount bound to nodes/proxy so it can read the kubelet pods endpoint. Nothing else: no cluster-wide read, no secrets. Justify each verb; you should end with about one resource and one verb.' },
      { id: 'iq-2-3', question: 'Why is container identity the fragile part of every metrics system?', idealAnswer: 'Because the universe of truthful identity sources (kubelet, CRI, log dirs, cgroups) are not designed as a coherent API, and containers come and go faster than scrapes. Identity drift is where wrong answers silently originate.' },
    ],
  },

  // =====================================================================
  // Phase 2: Counter Rates & Reset Detection
  // =====================================================================
  'rm-3': {
    topicId: 'rm-3',
    introduction:
      'cpu.stat gives you usage_usec — a monotonically increasing cumulative counter. Nobody wants cumulative nanoseconds. Converting to "43% CPU" needs two samples, a time delta, and immediately a small distributed-systems problem on a single machine. Build rates, break them with restarts and jitter, and decide what a "container" even is across a restart.',
    estimatedHours: 14,
    difficulty: 'intermediate',
    objectives: [
      { id: 'obj-3-1', text: 'Compute rates from consecutive samples and divide by the observed (not nominal) interval.' },
      { id: 'obj-3-2', text: 'Detect counter resets and decide what reset-to-zero means for the rate.' },
      { id: 'obj-3-3', text: 'Explain why Prometheus assumes a counter reset even when that assumption is sometimes wrong.' },
      { id: 'obj-3-4', text: 'Design the identity model in ADR 003 that decides when a restart is a new container.' },
    ],
    resources: [
      { id: 'res-3-1', title: 'Prometheus: counter vs gauge', kind: 'article', source: 'prometheus.io', url: 'https://prometheus.io/docs/practices/instrumentation/#counter-vs-gauge-vs-histogram', description: 'The mental model for what counters are allowed to do.', difficulty: 'intermediate', estimatedMinutes: 25, priority: 'high' },
      { id: 'res-3-2', title: 'Google SRE: Monitoring Distributed Systems', kind: 'article', source: 'sre.google', url: 'https://sre.google/sre-book/monitoring-distributed-systems/', description: 'Four golden signals and the shape of good metrics.', difficulty: 'intermediate', estimatedMinutes: 50, priority: 'medium' },
      { id: 'res-3-3', title: 'Prometheus rate() source', kind: 'repository', source: 'prometheus/prometheus', url: 'https://github.com/prometheus/prometheus/blob/main/promql/functions.go', description: 'Reinvent it badly first, then read the extrapolation logic.', difficulty: 'advanced', estimatedMinutes: 60, priority: 'medium' },
      { id: 'res-3-4', title: 'Go time: monotonic clocks', kind: 'documentation', source: 'go.dev', url: 'https://pkg.go.dev/time', description: 'time.Time carries monotonic reading; serialisation strips it. Find out what that costs.', difficulty: 'intermediate', estimatedMinutes: 30, priority: 'high' },
    ],
    labs: [
      {
        id: 'lab-3-1',
        title: 'Compute a rate, then break it',
        problem: 'Compute CPU rate from two consecutive cpu.stat samples. Then restart the container and observe your rate become a large negative number.',
        whyItMatters: 'The moment you have two samples you have a rate; the moment you have a restart you have an identity problem.',
        prerequisites: ['Go basics', 'Phase 0 agent'],
        requirements: [
          { id: 'req-3-1', text: 'Rate = (current − previous) / observed_interval.' },
          { id: 'req-3-2', text: 'When current < previous, detect a reset and produce a positive delta from zero.' },
          { id: 'req-3-3', text: 'Use the observed scrape interval, not the nominal one.' },
        ],
        hints: 'Prometheus assumes the counter reset to 0 and treats the new value as the delta. That assumption is wrong when a counter wraps or when you missed samples — write down why it is still the right call.',
        expectedOutput: 'A throttled_pct and CPU% that survive a container restart without a giant negative spike.',
        acceptanceCriteria: [
          { id: 'ac-3-1', text: 'Unit tests cover: normal rate, reset, jittered interval.' },
          { id: 'ac-3-2', text: 'A restart produces a reset-aware rate, not a negative one.' },
        ],
        skillsPracticed: ['rate-computation', 'go', 'concurrency'],
        estimatedMinutes: 120,
        difficulty: 'intermediate',
      },
      {
        id: 'lab-3-2',
        title: 'Lifecycle races',
        problem: 'Handle the ENOENT race: open the cgroup, read cpu.stat fine, then lose memory.current because the container died mid-read.',
        whyItMatters: 'Half a sample is real. Decide: emit partial, drop, or retry — and write the decision down.',
        prerequisites: ['lab-3-1'],
        requirements: [
          { id: 'req-3-4', text: 'Define behavior when a cgroup disappears mid-read.' },
          { id: 'req-3-5', text: 'Define behavior when a container starts and exits within one scrape interval.' },
          { id: 'req-3-6', text: 'Define identity across a kubelet restart (same pod, new container ID).' },
        ],
        hints: 'Dropping is fine if you say so explicitly. The fleet view being a lie by omission is mostly acceptable, but only if you notice it rather than not.' ,
        expectedOutput: 'A documented policy, implemented, with a test for each race.',
        acceptanceCriteria: [
          { id: 'ac-3-3', text: 'Partial samples are either dropped loudly or retried — never silently half-used.' },
          { id: 'ac-3-4', text: 'Identity semantics are tested: new container == hole or spike, your choice, defended in ADR 003.' },
        ],
        skillsPracticed: ['go', 'concurrency', 'rate-computation'],
        estimatedMinutes: 120,
        difficulty: 'advanced',
      },
    ],
    miniProject: {
      id: 'mp-3',
      title: 'Rates + ADR 003',
      problem: '/vitals now returns rates and real throttled_pct, reset detection is tested, and docs/adr/003-sample-identity.md says what makes two samples "the same container". Compare against kubectl top again — under load, not idle.',
      requirements: [
        { id: 'mpr-3-1', text: '/vitals returns CPU% and throttled_pct, not raw usages.' },
        { id: 'mpr-3-2', text: 'Reset detection has passing tests.' },
        { id: 'mpr-3-3', text: 'ADR 003 defines the sample identity model.' },
      ],
      acceptanceCriteria: [
        { id: 'mpa-3-1', text: 'CPU agrees with kubectl top under load.' },
        { id: 'mpa-3-2', text: 'A restart does not spike the graph.' },
      ],
      skillsPracticed: ['go', 'rate-computation', 'concurrency'],
      estimatedHours: 7,
    },
    repositories: [
      {
        id: 'repo-prometheus',
        name: 'Prometheus (promql)',
        url: 'https://github.com/prometheus/prometheus',
        whyStudy: 'The reference implementation of rate() and irate() extrapolation.',
        whatToLookFor: 'Extrapolation to window boundaries and why irate() disagrees with rate().',
        importantFiles: ['promql/functions.go'],
        concepts: ['extrapolation', 'reset handling', 'window boundary'],
        guidedSteps: [
          { id: 'rs-p-1', text: 'Find rate() and read the extrapolation logic.' },
          { id: 'rs-p-2', text: 'Explain why the two disagree on the same data.' },
          { id: 'rs-p-3', text: 'Note where reset is assumed and what happens when the assumption is wrong.' },
        ],
      },
    ],
    assessment: [
      { id: 'as-3-1', type: 'mcq', question: 'Your scrape interval jitters (10s, 12s, 9s). Which interval do you divide by?', options: ['The nominal interval', 'The observed interval', 'The mean of the last 10', 'The smallest interval seen'], correctOption: 1 },
      { id: 'as-3-2', type: 'mcq', question: 'A container restarts; its cpu counter resets to zero. Prometheus assumes:', options: ['The counter wrapped', 'The counter reset to 0 and the new value is the delta', 'The sample is invalid', 'Extrapolate backwards'], correctOption: 1 },
      { id: 'as-3-3', type: 'short_answer', question: 'When current < previous, why is assuming reset-to-zero still the right call even though it is sometimes wrong?', idealAnswer: 'Counters that only ever increase have one discontinuity that a reset explains. The alternative — assuming a wrap or a backward clock step — is rare and cannot be recovered without additional data. Assuming reset bounds the error to the samples you missed and always yields a sane, non-negative rate. You accept occasional underestimation to stay honest and implementable.' },
      { id: 'as-3-4', type: 'short_answer', question: 'A pod is restarted by kubelet: same pod name, new container ID, counters back to zero. Is your rate graph a hole or a spike, and which did you choose?', idealAnswer: 'Either is defensible: a hole (skip the delta, resume counting from the new ID) keeps the graph clean but loses the transition; a spike (assume reset) keeps continuity but fabricates load at the restart. Cairn chose the reset-aware hole documented in ADR 003, because fabricating load at a restart is exactly wrong for alerting.' },
    ],
    interviewQuestions: [
      { id: 'iq-3-1', question: 'A container\'s CPU reads 12% and its p99 latency is 800ms. How are both true?', idealAnswer: 'CPU% is a utilization snapshot; p99 is a distribution of request latency. A single-threaded worker queue can average single-digit CPU while holding requests for hundreds of ms; they measure different axes and both can be true simultaneously, which is why you alert on both.' },
      { id: 'iq-3-2', question: 'What does it mean to "extrapolate to window boundaries" in rate(), and why does it matter?', idealAnswer: 'rate() estimates growth over the full requested window even when the first/last samples fall inside it, extrapolating the slope to the boundaries and confining it to the window. It matters because it approximates what the counter did over the interval you asked about, not just between observed points — and it is why rate() and irate() disagree.' },
      { id: 'iq-3-3', question: 'What happens to a rate you already computed if the node clock steps backward five minutes?', idealAnswer: 'If you divide by observed wall-clock delta, a backward step produces negative slope and nonsense rates. The fix is using Go\'s monotonic time for deltas — but monotonic readings are stripped on serialization, so the agent must re-attach time carefully or the collector must treat agent timestamps as untrusted wall time for delta math.' },
    ],
  },

  // =====================================================================
  // Phase 3: The Query Engine
  // =====================================================================
  'rm-4': {
    topicId: 'rm-4',
    introduction:
      'Everything so far rebuilt a known system. Now build the part that is not in the box: the query layer. Prometheus gives counters and makes you write PromQL; Cairn answers questions directly — /fleet/pressure, /fleet/throttled, /fleet/query. Write ADR 004 before the code, because the query surface is the product and everything downstream is shaped by it.',
    estimatedHours: 16,
    difficulty: 'advanced',
    objectives: [
      { id: 'obj-4-1', text: 'Write ADR 004 first: choose between named queries, a general expression parser, or named queries plus one escape hatch.' },
      { id: 'obj-4-2', text: 'Implement /fleet/pressure and /fleet/throttled over a single node\'s data.' },
      { id: 'obj-4-3', text: 'Return the specific values that triggered a match, not just which containers matched.' },
      { id: 'obj-4-4', text: 'Decide a worst-first ordering/scoring policy and implement stable pagination.' },
    ],
    resources: [
      { id: 'res-4-1', title: 'Go net/http routing & JSON patterns', kind: 'documentation', source: 'go.dev', url: 'https://go.dev/doc/articles/wiki/', description: 'The server mechanics behind every /fleet endpoint.', difficulty: 'beginner', estimatedMinutes: 40, priority: 'high' },
      { id: 'res-4-2', title: 'PromQL basics (what you are NOT building)', kind: 'article', source: 'prometheus.io', url: 'https://prometheus.io/docs/prometheus/latest/querying/basics/', description: 'Know the incumbent well enough to explain the difference.', difficulty: 'intermediate', estimatedMinutes: 45, priority: 'medium' },
      { id: 'res-4-3', title: 'Google SRE: Monitoring Distributed Systems', kind: 'article', source: 'sre.google', url: 'https://sre.google/sre-book/monitoring-distributed-systems/', description: 'The semantics your query answers must respect.', difficulty: 'intermediate', estimatedMinutes: 30, priority: 'medium' },
    ],
    labs: [
      {
        id: 'lab-4-1',
        title: 'Design ADR 004 before code',
        problem: 'Write docs/adr/004-query-surface.md deciding the predicate language before implementing anything.',
        whyItMatters: 'This is the one place design-first is right. The query surface is the product; ADRs 005+ inherit its decisions.',
        prerequisites: ['Phase 0–2 agent'],
        requirements: [
          { id: 'req-4-1', text: 'Pick: fixed named queries, general expression parser, or named-with-escape-hatch, and justify it.' },
          { id: 'req-4-2', text: 'Define the unit of the answer: containers plus triggering values.' },
          { id: 'req-4-3', text: 'Define ordering, pagination, and the scoring function if worst-first.' },
        ],
        hints: 'The middle ground — named queries with parameters plus one escape hatch — is the recommended starting point. You own a language the moment you write a parser.',
        expectedOutput: 'An ADR an engineer can implement against without asking questions.',
        acceptanceCriteria: [
          { id: 'ac-4-1', text: 'The ADR answers expressiveness, response shape, ordering, and staleness explicitly.' },
        ],
        skillsPracticed: ['rest-apis', 'query-engines'],
        estimatedMinutes: 90,
        difficulty: 'intermediate',
      },
      {
        id: 'lab-4-2',
        title: 'Implement pressure & throttled',
        problem: 'Implement GET /fleet/pressure?over=memory&threshold=0.9 and GET /fleet/throttled?min_pct=0.05&since=5m over a single node\'s data.',
        whyItMatters: 'The named-query surface is the honest, limited core; getting it right pays for the escape hatch.',
        prerequisites: ['lab-4-1'],
        requirements: [
          { id: 'req-4-4', text: '/fleet/pressure returns containers with working_set/limit over the threshold.' },
          { id: 'req-4-5', text: '/fleet/throttled returns containers throttled more than min_pct over the window.' },
          { id: 'req-4-6', text: 'Every hit includes the specific values that triggered it.' },
        ],
        hints: '"This matched" without "here\'s why" is useless at 3am. Include ratio, limit, current — whatever drove the match.',
        expectedOutput: 'Answers that name both the container and the numbers that made it match.',
        acceptanceCriteria: [
          { id: 'ac-4-2', text: 'Each result carries the triggering metric values.' },
          { id: 'ac-4-3', text: 'Empty answers are consistent JSON, not 500s.' },
        ],
        skillsPracticed: ['go', 'rest-apis', 'query-engines'],
        estimatedMinutes: 150,
        difficulty: 'intermediate',
      },
      {
        id: 'lab-4-3',
        title: 'The escape hatch: /fleet/query',
        problem: 'Implement a minimal general predicate over metric fields with AND/OR and comparison operators.',
        whyItMatters: 'The escape hatch proves the query framing is general without committing you to a full language.',
        prerequisites: ['lab-4-2'],
        requirements: [
          { id: 'req-4-7', text: 'Parse p=memory.working_set/memory.limit>0.85 AND cpu.throttled_pct>0.1.' },
          { id: 'req-4-8', text: 'Support >, >=, <, <= on numeric metric paths.' },
          { id: 'req-4-9', text: 'Return parse errors that say what went wrong, not a stack trace.' },
        ],
        hints: 'Prefer a tiny hand-written tokenizer over a grammar framework. You want to feel the parser tradeoffs, not learn yacc.' ,
        expectedOutput: 'The general form returns the same shape of answer as the named queries.',
        acceptanceCriteria: [{ id: 'ac-4-4', text: 'The sample expression returns containers that match both clauses, with both values shown.' }],
        skillsPracticed: ['go', 'query-engines', 'rest-apis'],
        estimatedMinutes: 180,
        difficulty: 'advanced',
      },
    ],
    miniProject: {
      id: 'mp-4',
      title: 'Query API over a single node',
      problem: 'A working cairn-api that answers /fleet/* against the agent data, designed by ADR 004 first.',
      requirements: [
        { id: 'mpr-4-1', text: 'All three /fleet endpoints implemented and covered by tests.' },
        { id: 'mpr-4-2', text: 'ADR 004 exists before the code and the code matches it.' },
      ],
      acceptanceCriteria: [
        { id: 'mpa-4-1', text: 'The API answers a fleet-wide question about a single node.' },
        { id: 'mpa-4-2', text: 'Answers include triggering values and stable ordering.' },
      ],
      skillsPracticed: ['go', 'rest-apis', 'query-engines'],
      estimatedHours: 8,
    },
    repositories: [
      {
        id: 'repo-prometheus',
        name: 'Prometheus query engine',
        url: 'https://github.com/prometheus/prometheus/tree/main/promql',
        whyStudy: 'The incumbent\'s language design and why the current form exists.',
        whatToLookFor: 'How they decided what PromQL is and is not.',
        importantFiles: ['promql/parser.go', 'promql/engine.go'],
        concepts: ['expression grammar', 'query evaluation', 'error handling'],
        guidedSteps: [
          { id: 'rs-p-4', text: 'Skim the parser grammar.' },
          { id: 'rs-p-5', text: 'Note how errors are returned to callers.' },
          { id: 'rs-p-6', text: 'Compare their "language you own" burden with the named-query alternative.' },
        ],
      },
    ],
    assessment: [
      { id: 'as-4-1', type: 'mcq', question: 'Why does the ADR recommend "named queries with parameters plus one escape hatch"?', options: ['Named queries are simpler to implement', 'It is honest and limited, while the escape hatch proves generality without owning a full language', 'Prometheus requires it', 'It is the fastest to type'], correctOption: 1 },
      { id: 'as-4-2', type: 'mcq', question: 'A query over 4,000 containers returns a list. What is the WORST product decision?', options: ['Worst-first by a documented scoring function', 'Returning matches with triggering values', 'Pagination with stable order', 'Returning matches without explaining why they matched'], correctOption: 3 },
      { id: 'as-4-3', type: 'short_answer', question: '3 of 40 nodes have not reported in 90 seconds. What does /fleet/pressure return, and why is silently returning 37 nodes\' answers a lie?', idealAnswer: 'It must not silently return a short list: that is under-reporting exactly when the system matters. Options: answer + incomplete:true + missing_nodes; answer + last-known values marked stale; or 503. Cairn marks completeness because a monitoring system that under-reports during a partial outage fails at the critical moment.' },
      { id: 'as-4-4', type: 'architecture', question: 'Design the scoring function for "worst-first" across memory pressure and CPU throttling. What is the product decision you are making?', idealAnswer: 'You are asserting that 95% memory is worse than 80% throttling (or vice versa). A defensible scoring function weights ratios by their distance from danger thresholds, and you publish the weights so operators can challenge them. The decision is a product call, not a math result.' },
    ],
    interviewQuestions: [
      { id: 'iq-4-1', question: 'You now own a language if you build a parser. How do you keep that honest?', idealAnswer: 'Start with named queries with parameters and exactly one escape hatch. Language ownership costs: parser, error model, documentation, security, and deprecation policy. The escape hatch proves the framing without committing to every cost.' },
      { id: 'iq-4-2', question: 'Why must answers include the values that triggered the match?', idealAnswer: '"This matched" without "here\'s why" is useless at 3am. An operator can\'t act on a flag; they can act on "working_set/limit = 0.93, throttled_pct = 0.11". The triggering values turn an output into a decision.' },
      { id: 'iq-4-3', question: 'What does the response say about confidence when some nodes are silent?', idealAnswer: 'It says so explicitly: incomplete:true, missing_nodes:[...], or marked-stale rows with last_seen. The one forbidden option is quietly returning a shorter answer, because under-reporting during failure is the worst time to be wrong.' },
    ],
  },

  // =====================================================================
  // Phase 4: Fleet Fan-In
  // =====================================================================
  'rm-5': {
    topicId: 'rm-5',
    introduction:
      'One node was easy. Forty nodes is the job. Introduce the collector tier with push-or-pull (write the ADR first), a consistent-hashing ring over collector identities, honest staleness semantics, clock-skew handling, and watermarks for closing scrape windows. This is the good distributed systems content — and it is read-only, so when you get it wrong the consequence is a hole in a graph.',
    estimatedHours: 20,
    difficulty: 'advanced',
    objectives: [
      { id: 'obj-5-1', text: 'Decide push vs pull in ADR 005 and argue the other side.' },
      { id: 'obj-5-2', text: 'Implement a consistent-hashing ring mapping nodes to collectors.' },
      { id: 'obj-5-3', text: 'Choose and implement your failure mode for rebalances: gaps or duplicates.' },
      { id: 'obj-5-4', text: 'Implement honest staleness: incomplete flags or stale rows, never silent under-reporting.' },
      { id: 'obj-5-5', text: 'Handle clock skew and watermark semantics for closed windows.' },
    ],
    resources: [
      { id: 'res-5-1', title: 'Consistent hashing (Akamai)', kind: 'article', source: 'akamai.com', url: 'https://www.akamai.com/blog/generative-ai/consistent-hashing-algorithm', description: 'The classic explanation of ring-based mapping.', difficulty: 'intermediate', estimatedMinutes: 25, priority: 'high' },
      { id: 'res-5-2', title: 'Kleppmann — How to do distributed locking', kind: 'paper', source: 'martin.kleppmann.com', url: 'https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html', description: 'Why simple primitives mislead in shared systems.', difficulty: 'advanced', estimatedMinutes: 45, priority: 'medium' },
      { id: 'res-5-3', title: 'Go time package — monotonic clocks', kind: 'documentation', source: 'go.dev', url: 'https://pkg.go.dev/time', description: 'Where monotonic readings live and when serialisation strips them.', difficulty: 'intermediate', estimatedMinutes: 20, priority: 'high' },
      { id: 'res-5-4', title: 'Prometheus scrape design (pull model)', kind: 'article', source: 'prometheus.io', url: 'https://prometheus.io/docs/introduction/faq/', description: 'Why the incumbent pulls and what that buys.', difficulty: 'intermediate', estimatedMinutes: 30, priority: 'medium' },
    ],
    labs: [
      {
        id: 'lab-5-1',
        title: 'ADR 005: push or pull',
        problem: 'Write the ADR deciding whether collectors scrape agents or agents report to collectors.',
        whyItMatters: 'Pull makes scrape failure itself signal; push puts backpressure on the agent and needs buffers and drop policies.',
        prerequisites: ['Phase 3 API'],
        requirements: [
          { id: 'req-5-1', text: 'State the choice and the failure semantics of the other option.' },
          { id: 'req-5-2', text: 'Address discovery: pull needs it, push does not.' },
        ],
        hints: 'Pull is probably right here, for the same reason it is right for Prometheus: the failure of a scrape is itself signal.',
        expectedOutput: 'ADR 005 with a side-by-side of failure modes.',
        acceptanceCriteria: [{ id: 'ac-5-1', text: 'You can argue the loser\'s side out loud.' }],
        skillsPracticed: ['staleness'],
        estimatedMinutes: 60,
        difficulty: 'intermediate',
      },
      {
        id: 'lab-5-2',
        title: 'Consistent-hashing ring',
        problem: 'Build a ring of collectors that maps nodes to collectors, and rebalances when a collector dies.',
        whyItMatters: 'Sharding is the core fan-in decision: each node belongs to exactly one collector.',
        prerequisites: ['Go concurrency'],
        requirements: [
          { id: 'req-5-3', text: 'Add collector identities to the ring with virtual nodes.' },
          { id: 'req-5-4', text: 'Scrape each node from its ring owner.' },
          { id: 'req-5-5', text: 'On owner loss, rebalance: some nodes get double-scraped, some unscraped for a window. Emit both effects.' },
        ],
        hints: 'Choose your failure mode deliberately: gaps (safe, visible) or duplicates (complete, needs dedup). Write it down.',
        expectedOutput: 'A ring that maps and rebalances, with tests for the rebalance window.',
        acceptanceCriteria: [
          { id: 'ac-5-2', text: 'Node → collector mapping is deterministic.' },
          { id: 'ac-5-3', text: 'A removed collector rebalances without crashing scrapes.' },
        ],
        skillsPracticed: ['consistent-hashing', 'go', 'concurrency'],
        estimatedMinutes: 180,
        difficulty: 'advanced',
      },
      {
        id: 'lab-5-3',
        title: 'Staleness, skew, and watermarks',
        problem: 'Make fleet queries honest: incomplete flags for silent nodes, monotonic time for deltas, and closed-window semantics for late samples.',
        whyItMatters: 'The phases 3 question finishes here: what a fleet answer means when part of it is missing.',
        prerequisites: ['lab-5-2', 'Phase 3 query'],
        requirements: [
          { id: 'req-5-6', text: 'Fleet answers include incomplete:true and missing_nodes when any node is silent.' },
          { id: 'req-5-7', text: 'Use monotonic time for all delta math; handle a node clock stepping backward or forward.' },
          { id: 'req-5-8', text: 'Define a watermark: when a 10s window closes, late samples are dropped and the drops counted.' },
        ],
        hints: 'Amending a closed window is a distributed transaction you do not want. Drop and count instead. For clock skew, the timestamp into the timeseries is a product decision: agent-stamped vs collector-stamped.',
        expectedOutput: 'A collector whose answers honestly report completeness and whose rates survive clock steps.',
        acceptanceCriteria: [
          { id: 'ac-5-4', text: 'Silencing one agent flips incomplete:true on the fleet answer.' },
          { id: 'ac-5-5', text: 'A 5-minute forward clock step produces a visible gap, not a fake rate.' },
        ],
        skillsPracticed: ['staleness', 'clock-skew', 'go'],
        estimatedMinutes: 180,
        difficulty: 'advanced',
      },
    ],
    miniProject: {
      id: 'mp-5',
      title: 'Sharded collector',
      problem: 'A cairn-collector that fans in N agents over a ring, holds a recent window, and answers honest fleet queries.',
      requirements: [
        { id: 'mpr-5-1', text: 'Fleet query across N nodes through sharded collectors.' },
        { id: 'mpr-5-2', text: 'Chaos test: delete a collector pod mid-query and show it in the answer.' },
      ],
      acceptanceCriteria: [
        { id: 'mpa-5-1', text: 'Answers from the fleet are complete and honest about missing nodes.' },
        { id: 'mpa-5-2', text: 'The failure mode of the rebalance is documented and demonstrated.' },
      ],
      skillsPracticed: ['go', 'consistent-hashing', 'concurrency', 'staleness'],
      estimatedHours: 10,
    },
    repositories: [
      {
        id: 'repo-kubernetes',
        name: 'Kubernetes (metrics server)',
        url: 'https://github.com/kubernetes-sigs/metrics-server',
        whyStudy: 'A small production example of pull-scraping nodes and serving aggregate metrics.',
        whatToLookFor: 'Scrape loop, ring-free sharding, and how it reports stale data.',
        importantFiles: ['pkg/scraper/', 'pkg/sources/'],
        concepts: ['scrape loop', 'aggregation', 'staleness'],
        guidedSteps: [
          { id: 'rs-k-1', text: 'Trace the scrape scheduling loop.' },
          { id: 'rs-k-2', text: 'See how a silent node is represented in output.' },
        ],
      },
    ],
    assessment: [
      { id: 'as-5-1', type: 'mcq', question: 'In a rebalance window, some nodes get scraped by two collectors and some by none. Which failure mode does Cairn bias toward, and why?', options: ['Duplicates, because complete data is worth dedup cost', 'Gaps, because they are safe and visible', 'Neither — it refuses to scrape during rebalance', 'It pauses the whole ring'], correctOption: 1 },
      { id: 'as-5-2', type: 'mcq', question: 'A node\'s clock steps backward. What happens to every rate computed in that window?', options: ['Nothing, rates are immune', 'They have already been baked into the timeseries correctly', 'The deltas become negative/nonsense unless you use monotonic time', 'The agent re-scrapes'], correctOption: 2 },
      { id: 'as-5-3', type: 'short_answer', question: 'A 10-second window closes; a sample arrives late. What does Cairn do and why?', idealAnswer: 'Drops the sample and counts the drop. Amending a closed window is a distributed transaction that would require cross-partition agreement and change watermarked answers retroactively. Counting drops preserves honest watermarks and keeps the rollup path deterministic.' },
      { id: 'as-5-4', type: 'architecture', question: 'StatefulSet or Deployment for the collector ring? Argue one, then the other.', idealAnswer: 'StatefulSet gives ordinal identities for free (ring members are stable names), but scaling semantics are clunky. Deployment plus a lease-based membership protocol is more work and more correct under scaling. Cairn starts with a StatefulSet because stable identities are the ring\'s requirement.' },
    ],
    interviewQuestions: [
      { id: 'iq-5-1', question: 'Two collectors both scraped node-7 during a rebalance and produced samples with the same timestamp and different values. Which one is right?', idealAnswer: 'Neither is guaranteed right; both read the same source at nearly the same time and the container may have changed between reads. The design question is which one you keep: the ring owner is authoritative, otherwise you keep the first-arriving sample and surface the duplicate via dedup accounting.' },
      { id: 'iq-5-2', question: 'GET /fleet/pressure returns 4 containers. Three nodes are silent. Is the answer 4, or is the answer wrong?', idealAnswer: 'The answer 4 alone is wrong (silent lie). The honest answer is "4 on 37 nodes, incomplete:true, missing_nodes:[...]". Clients must handle that, but that is the cost of a monitoring system that does not fail exactly when it matters.' },
      { id: 'iq-5-3', question: 'You want to know if a node is down, unreachable, or its agent crashed. Which design gives you that signal for free?', idealAnswer: 'Pull. A failed scrape is itself signal — the failure topology (transport, connect, timeout, HTTP status) tells you which layer failed. Push hides it: no report could mean down node, dead agent, or wedged buffer.' },
    ],
  },

  // =====================================================================
  // Phase 5: Kubernetes
  // =====================================================================
  'rm-6': {
    topicId: 'rm-6',
    introduction:
      'cairn-agent as a DaemonSet with a read-only hostPath mount of /sys/fs/cgroup — no privileged, no hostPID, no capabilities. This is the good security conversation, because the threat model is short. Then RBAC (nodes/proxy only), the Downward API for node identity, Deployment-vs-StatefulSet for the collector, PDBs, meaningful readiness gates, and Kustomize overlays.',
    estimatedHours: 16,
    difficulty: 'intermediate',
    objectives: [
      { id: 'obj-6-1', text: 'Write and defend the agent threat model: read-only bind mount, no privileged, one RBAC verb.' },
      { id: 'obj-6-2', text: 'Deploy the agent as a DaemonSet using the Downward API for node identity.' },
      { id: 'obj-6-3', text: 'Argue and choose Deployment vs StatefulSet for the collector.' },
      { id: 'obj-6-4', text: 'Add PodDisruptionBudgets, resource limits, and readiness gates that mean something.' },
      { id: 'obj-6-5', text: 'Maintain dev/prod Kustomize overlays.' },
    ],
    resources: [
      { id: 'res-6-1', title: 'DaemonSets', kind: 'documentation', source: 'kubernetes.io', url: 'https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/', description: 'The workload type that gives you one pod per node.', difficulty: 'beginner', estimatedMinutes: 25, priority: 'high' },
      { id: 'res-6-2', title: 'Pod Security Standards', kind: 'documentation', source: 'kubernetes.io', url: 'https://kubernetes.io/docs/concepts/security/pod-security-standards/', description: 'Restricted vs baseline, and which rule hostPath violates.', difficulty: 'intermediate', estimatedMinutes: 35, priority: 'high' },
      { id: 'res-6-3', title: 'Kustomize (installation & docs)', kind: 'documentation', source: 'kustomize.io', url: 'https://kustomize.io/', description: 'Bases and overlays for env variants.', difficulty: 'beginner', estimatedMinutes: 30, priority: 'high' },
      { id: 'res-6-4', title: 'RBAC docs', kind: 'documentation', source: 'kubernetes.io', url: 'https://kubernetes.io/docs/reference/access-authn-authz/rbac/', description: 'Roles, bindings, and least privilege.', difficulty: 'intermediate', estimatedMinutes: 30, priority: 'high' },
    ],
    labs: [
      {
        id: 'lab-6-1',
        title: 'Threat model, read-only',
        problem: 'Wite the agent threat model and a DaemonSet manifest with a read-only /sys/fs/cgroup hostPath mount. No privileged, no hostPID, no capabilities.',
        whyItMatters: 'The good security conversation: Cairn needs almost nothing, and the shortest threat model is the best one.',
        prerequisites: ['Basic cluster access'],
        requirements: [
          { id: 'req-6-1', text: 'DaemonSet with hostPath mounted readOnly.' },
          { id: 'req-6-2', text: 'No privileged field, no capabilities, no hostPID.' },
          { id: 'req-6-3', text: 'Document what an attacker gets if they compromise the agent.' },
        ],
        hints: 'The agent can see every container\'s resource profile across the fleet — reconnaissance. That is a real but very different conversation from hostPID:true.',
        expectedOutput: 'A deployable DaemonSet plus a threat model paragraph per capability.',
        acceptanceCriteria: [
          { id: 'ac-6-1', text: 'The agent runs on every node without privileged.' },
          { id: 'ac-6-2', text: 'The threat model states exactly what compromise grants.' },
        ],
        skillsPracticed: ['daemonset', 'pod-security', 'rbac'],
        estimatedMinutes: 120,
        difficulty: 'intermediate',
      },
      {
        id: 'lab-6-2',
        title: 'RBAC + Downward API + readiness that means something',
        problem: 'Give the agent nodes/proxy and nothing else; give it its node name via fieldRef; and make the collector\'s readiness gate mean "my shard is scraping".',
        whyItMatters: 'Least privilege plus identity plus a readiness signal an operator can actually trust.',
        prerequisites: ['lab-6-1'],
        requirements: [
          { id: 'req-6-4', text: 'ServiceAccount + Role bound to nodes/proxy only.' },
          { id: 'req-6-5', text: 'spec.nodeName via fieldRef for agent identity.' },
          { id: 'req-6-6', text: 'Collector /readyz returns 200 only while its shard scrapes successfully.' },
        ],
        hints: 'A readiness gate that just checks process-liveness is a lie. Make one that checks the scrape loop heartbeat.',
        expectedOutput: 'Manifests an operator can read and immediately trust.',
        acceptanceCriteria: [
          { id: 'ac-6-3', text: 'RBAC contains no wildcards.' },
          { id: 'ac-6-4', text: 'Killing the scrape loop fails readiness within one interval.' },
        ],
        skillsPracticed: ['rbac', 'daemonset', 'go'],
        estimatedMinutes: 120,
        difficulty: 'intermediate',
      },
      {
        id: 'lab-6-3',
        title: 'PDBs, limits, and overlays',
        problem: 'Add PodDisruptionBudgets, resource requests/limits for agent and collector, and Kustomize overlays for dev and prod.',
        whyItMatters: 'Your own agent has a memory limit — what happens when the fleet grows to 4,000 containers? And your deploy must never be a console dance.',
        prerequisites: ['lab-6-2'],
        requirements: [
          { id: 'req-6-7', text: 'PDB that refuses to let both collectors be disrupted at once.' },
          { id: 'req-6-8', text: 'Resource requests and limits with a documented ratio.' },
          { id: 'req-6-9', text: 'Kustomize base + dev/prod overlays.' },
        ],
        hints: 'The fleet-growth question is answered by your own numbers, not by guessing: cap the agent per-node memory from Phase 9 telemetry.',
        expectedOutput: 'A kustomize build that produces env-specific manifests.',
        acceptanceCriteria: [
          { id: 'ac-6-5', text: 'kustomize build overlays/prod renders a valid manifest set.' },
          { id: 'ac-6-6', text: 'PDB exists for the collector workload.' },
        ],
        skillsPracticed: ['pdb', 'kustomize', 'daemonset'],
        estimatedMinutes: 90,
        difficulty: 'intermediate',
      },
    ],
    miniProject: {
      id: 'mp-6',
      title: 'Deploy Cairn to a cluster',
      problem: 'Deploy agent, collector, and API via Kustomize with the security posture from this phase.',
      requirements: [
        { id: 'mpr-6-1', text: 'Everything deploys from kustomize, not console clicks.' },
        { id: 'mpr-6-2', text: 'The threat model is written and short.' },
      ],
      acceptanceCriteria: [
        { id: 'mpa-6-1', text: 'A clean cluster ends up with all three workloads running.' },
        { id: 'mpa-6-2', text: 'Deleting a collector pod visibly affects readiness, then recovers.' },
      ],
      skillsPracticed: ['kustomize', 'daemonset', 'rbac', 'pod-security'],
      estimatedHours: 7,
    },
    repositories: [
      {
        id: 'repo-prometheus-node-exporter',
        name: 'node-exporter',
        url: 'https://github.com/prometheus/node_exporter',
        whyStudy: 'The canonical read-only host-metrics DaemonSet.',
        whatToLookFor: 'Its security posture and how it handles node identity.',
        importantFiles: ['collector/', 'node_exporter.go'],
        concepts: ['read-only host metrics', 'collector registration'],
        guidedSteps: [
          { id: 'rs-n-1', text: 'Skim the collector registration pattern.' },
          { id: 'rs-n-2', text: 'Note its privilege story and how minimal it is.' },
        ],
      },
    ],
    assessment: [
      { id: 'as-6-1', type: 'mcq', question: 'Which PodSecurity constraint does a hostPath mount to /sys/fs/cgroup violate at restricted level?', options: ['seccompProfile', 'hostPath volumes are not allowed at restricted', 'runAsUser', 'appArmorProfile'], correctOption: 1 },
      { id: 'as-6-2', type: 'mcq', question: 'The collector ring needs stable identities. Which primitive gives you that with the least code?', options: ['Deployment with a lease-based membership protocol', 'StatefulSet with ordinal names', 'A Job', 'A ReplicaSet'], correctOption: 1 },
      { id: 'as-6-3', type: 'short_answer', question: 'An attacker compromises cairn-agent. Walk through exactly what they gain and whether that is acceptable.', idealAnswer: 'They gain the node\'s service account (nodes/proxy), read access to all container resource profiles on the node, and the ability to forge vitals for that node. They cannot read secrets, cannot reach the API server beyond proxy, and cannot touch other nodes\' data. Acceptable if the blast radius is documented and the read-only mount cannot be escalated (no writable host mounts).' },
      { id: 'as-6-4', type: 'architecture', question: 'Design a readiness gate for the collector where "ready" actually means "my shard is scraping".', idealAnswer: 'Run a loop that tracks last-successful-scrape-timestamp per owned node; /readyz returns 200 only if the newest timestamp is within <2 scrape intervals, else 503. That makes readiness a truthful statement about the scrape loop, not process liveness.' },
    ],
    interviewQuestions: [
      { id: 'iq-6-1', question: 'Why is the agent threat model so short compared to most "we need node access" projects?', idealAnswer: 'Because Cairn needs almost nothing: a readonly bind mount and nodes/proxy. No privileged, no hostPID, no capabilities. The work is removing need, then writing down the short list of what a compromise grants.' },
      { id: 'iq-6-2', question: 'StatefulSet vs Deployment for a sharded collector — which do you choose and why?', idealAnswer: 'StatefulSet: ordinal names are ring identities for free, and scaling/draining semantics are manageable. Deployment plus leases is more correct under scaling but is more work; choose it when the ring must rebalance under active scaling.' },
      { id: 'iq-6-3', question: 'How do you know when your own agent hits its memory limit across 4,000 containers before someone pages you?', idealAnswer: 'You instrument the agent\'s own memory (this is Phase 9!) and alert on it. The recursive property: the monitoring system must monitor itself with the same query surface it sells.' },
    ],
  },

  // =====================================================================
  // Phase 6: GCP & Two-Tier Reads
  // =====================================================================
  'rm-7': {
    topicId: 'rm-7',
    introduction:
      'Everything in Terraform, no console clicks, ever. GKE with Workload Identity, GCS for 1-minute parquet rollups with lifecycle rules, BigQuery external tables partitioned by date and clustered by node — and the interesting part, the two-tier read path where ?since=15m comes from collector memory and ?since=7d comes from BigQuery. Find the seam and handle it explicitly.',
    estimatedHours: 18,
    difficulty: 'advanced',
    objectives: [
      { id: 'obj-7-1', text: 'Terraform a GKE cluster with Workload Identity — zero key files anywhere.' },
      { id: 'obj-7-2', text: 'Write hourly 1-minute parquet rollups to GCS with lifecycle rules (Standard/Nearline/Coldline/delete).' },
      { id: 'obj-7-3', text: 'Create a BigQuery external table partitioned by date and clustered by node.' },
      { id: 'obj-7-4', text: 'Implement the two-tier read path and handle the boundary seam (gap vs overlap).' },
      { id: 'obj-7-5', text: 'Track BigQuery bytes scanned per query.' },
    ],
    resources: [
      { id: 'res-7-1', title: 'Terraform GKE (google_container_cluster)', kind: 'documentation', source: 'registry.terraform.io', url: 'https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/container_cluster', description: 'The module you will fight for a weekend.', difficulty: 'advanced', estimatedMinutes: 60, priority: 'high' },
      { id: 'res-7-2', title: 'BigQuery external tables', kind: 'documentation', source: 'cloud.google.com', url: 'https://cloud.google.com/bigquery/docs/external-data-sources', description: 'Querying parquet in GCS without loading.', difficulty: 'intermediate', estimatedMinutes: 40, priority: 'high' },
      { id: 'res-7-3', title: 'Workload Identity', kind: 'documentation', source: 'cloud.google.com', url: 'https://cloud.google.com/kubernetes-engine/docs/how-to/workload-identity', description: 'Keyless auth from pods to GCP APIs.', difficulty: 'intermediate', estimatedMinutes: 35, priority: 'high' },
      { id: 'res-7-4', title: 'GCS lifecycle management', kind: 'documentation', source: 'cloud.google.com', url: 'https://cloud.google.com/storage/docs/lifecycle', description: 'Tiering and deletion rules.', difficulty: 'beginner', estimatedMinutes: 20, priority: 'medium' },
    ],
    labs: [
      {
        id: 'lab-7-1',
        title: 'Terraform the GKE cluster',
        problem: 'Terraform a GKE cluster with Workload Identity enabled and a workload-identity-bound service account for the collector.',
        whyItMatters: 'The "no console clicks, ever" rule forces you to encode everything, which is the whole point of infra-as-code.',
        prerequisites: ['Terraform basics', 'A GCP account'],
        requirements: [
          { id: 'req-7-1', text: 'google_container_cluster via Terraform.' },
          { id: 'req-7-2', text: 'A GCP service account bound to a KSA via Workload Identity.' },
          { id: 'req-7-3', text: 'No key files generated or stored at any point.' },
        ],
        hints: 'You will hit the "no external IP" / "network size" constraints — read the error, understand it, encode the fix, never click.',
        expectedOutput: 'terraform apply brings up a cluster and shows the workload identity wiring.',
        acceptanceCriteria: [
          { id: 'ac-7-1', text: 'A pod in the cluster can call a GCP API keylessly via its KSA.' },
        ],
        skillsPracticed: ['terraform', 'gke', 'workload-identity'],
        estimatedMinutes: 180,
        difficulty: 'advanced',
      },
      {
        id: 'lab-7-2',
        title: 'Rollups to GCS with lifecycle',
        problem: 'Aggregate 10-second samples to 1-minute parquet, write hourly files to GCS, and set lifecycle rules to tier and delete.',
        whyItMatters: 'This is the historical tier; its cost and shape drive everything downstream.',
        prerequisites: ['lab-7-1', 'Go or a scheduler'],
        requirements: [
          { id: 'req-7-4', text: 'Hourly job rolls the watermarked window to 1-minute parquet.' },
          { id: 'req-7-5', text: 'Journal of completed rollups so you do not double-write.' },
          { id: 'req-7-6', text: 'Lifecycle: Standard → Nearline 30d → Coldline 90d → delete 1y.' },
        ],
        hints: 'You are inside the watermark conversation from Phase 4 — a rollup only becomes safe once its window is closed.',
        expectedOutput: 'Parquet files in GCS with tiering rules visible in terraform state.',
        acceptanceCriteria: [
          { id: 'ac-7-2', text: 'Rollup job runs without double-writes across restarts.' },
          { id: 'ac-7-3', text: 'Lifecycle rules are in Terraform, not clicks.' },
        ],
        skillsPracticed: ['gcs', 'go', 'terraform'],
        estimatedMinutes: 150,
        difficulty: 'advanced',
      },
      {
        id: 'lab-7-3',
        title: 'The two-tier seam',
        problem: 'Serve ?since=15m from collector memory and ?since=7d from BigQuery, and handle the boundary where a query straddles both.',
        whyItMatters: 'The seam is where "which tier answers" becomes "how do the tiers disagree and does the response admit it".',
        prerequisites: ['lab-7-2', 'Phase 3 query engine'],
        requirements: [
          { id: 'req-7-7', text: 'Route by time range: memory window, BigQuery, or a union.' },
          { id: 'req-7-8', text: 'Resolve the gap or overlap explicitly (rolled-up vs raw resolution).' },
          { id: 'req-7-9', text: 'Admit in the response when an answer merges two resolutions.' },
        ],
        hints: 'If the memory window is 30m and rollups land hourly, an aged-out-but-not-archived window is a gap. Decide explicitly; do not paper over it.',
        expectedOutput: 'A read path that answers the same question from either tier with honest metadata.',
        acceptanceCriteria: [
          { id: 'ac-7-4', text: 'The same query returns consistent answers across the boundary, or explicitly labels resolution.' },
        ],
        skillsPracticed: ['bigquery', 'go', 'gcs'],
        estimatedMinutes: 180,
        difficulty: 'advanced',
      },
    ],
    miniProject: {
      id: 'mp-7',
      title: 'Two-tier read path',
      problem: 'The API tier-switches between collector memory and BigQuery, with cost telemetry on bytes scanned.',
      requirements: [
        { id: 'mpr-7-1', text: 'Query routing works across both tiers.' },
        { id: 'mpr-7-2', text: 'BigQuery bytes scanned are logged per query.' },
      ],
      acceptanceCriteria: [
        { id: 'mpa-7-1', text: 'A 7d fleet query returns from BigQuery with a scan cost line.' },
        { id: 'mpa-7-2', text: 'A 15m query never touches BigQuery.' },
      ],
      skillsPracticed: ['terraform', 'gke', 'gcs', 'bigquery', 'workload-identity'],
      estimatedHours: 9,
    },
    repositories: [
      {
        id: 'repo-petclinic-other',
        name: 'GKE+Workload Identity sample',
        url: 'https://github.com/GoogleCloudPlatform/kubernetes-engine-samples',
        whyStudy: 'Canonical examples of the keyless path you just built.',
        whatToLookFor: 'KSA/GSA binding and annotations.',
        importantFiles: ['workload-identity/'],
        concepts: ['KSA binding', 'annotation-based mapping'],
        guidedSteps: [
          { id: 'rs-g-1', text: 'Read a Workload Identity sample end to end.' },
          { id: 'rs-g-2', text: 'Compare their annotation choices to yours.' },
        ],
      },
    ],
    assessment: [
      { id: 'as-7-1', type: 'mcq', question: 'The memory window is 30 minutes and rollups land hourly. Mid-session, a ?since=45m query hits...', options: ['Both tiers seamlessly', 'A gap: data aged out of memory but not yet on GCS', 'BigQuery always', 'The collector reloads history'], correctOption: 1 },
      { id: 'as-7-2', type: 'mcq', question: 'How does Cairn authenticate to GCP from a pod?', options: ['A mounted service account key JSON', 'Workload Identity: KSA ↔ GSA mapping, no keys', 'The kubelet token', 'Environment variables'], correctOption: 1 },
      { id: 'as-7-3', type: 'short_answer', question: 'A query straddles the boundary and unions raw samples with 1-minute rollups. What must the response admit?', idealAnswer: 'That the answer merges two resolutions: the recent share is raw 10s samples and the historical share is 1-minute aggregates. It must label the resolution transition so nobody compares p99s across tiers as if they were the same thing.' },
      { id: 'as-7-4', type: 'short_answer', question: 'A ?since=90d fleet query is expensive. What is the cheapest honest policy?', idealAnswer: 'Log it first — you can\'t make policy about a number you\'ve never seen. After telemetry exists, decide: cap (reject or degrade), bill (chargeback), or alert. The assignment requires logging before any of that.' },
    ],
    interviewQuestions: [
      { id: 'iq-7-1', question: 'Why does the GKE on GCP requirement say zero key files?', idealAnswer: 'Keys are a supply-chain liability: they leak, expire, and must be rotated. Workload Identity binds a Kubernetes service account to a GCP identity so pods authenticate without ever possessing a credential file. The answer is: the platform solves authentication, so you never manage secrets.' },
      { id: 'iq-7-2', question: 'Where is the boundary between the memory tier and the historical tier, and what lives in the seam?', idealAnswer: 'The memory window holds recent fresh samples; rollups land with a lag. If rollup window > memory window, a gap exists where data is neither in memory nor archived. The API must either widen memory, shrink rollup lag, or explicitly return a gap between resolutions — and label it.' },
      { id: 'iq-7-3', question: 'What does cost telemetry on BigQuery bytes scanned buy you that you cannot get by guessing?', idealAnswer: 'A real number for policy: you discover which queries are expensive before they become budget line items. Guessing "90d is pricey" is not a number you can defend to finance; bytes-scanned telemetry is.' },
    ],
  },

  // =====================================================================
  // Phase 7: Standing Queries & Pub/Sub
  // =====================================================================
  'rm-8': {
    topicId: 'rm-8',
    introduction:
      'The query framing earns its keep here. A standing query is the predicate you built in Phase 3, registered once and evaluated continuously, emitting events when the answer changes. Same engine, two delivery modes: pull for humans, push for machines. Then: edge vs level trigg, flapping, hysteresis and dwell, dedup, and a DLQ you deliberately poison.',
    estimatedHours: 14,
    difficulty: 'advanced',
    objectives: [
      { id: 'obj-8-1', text: 'Build POST /standing to register predicates evaluated continuously.' },
      { id: 'obj-8-2', text: 'Decide edge vs level triggering and implement it.' },
      { id: 'obj-8-3', text: 'Fix flapping with hysteresis or dwell — after you have deliberately spammed the topic.' },
      { id: 'obj-8-4', text: 'Design the idempotency key for at-least-once delivery.' },
      { id: 'obj-8-5', text: 'Configure a DLQ and poison it on purpose.' },
    ],
    resources: [
      { id: 'res-8-1', title: 'Pub/Sub concepts', kind: 'documentation', source: 'cloud.google.com', url: 'https://cloud.google.com/pubsub/docs', description: 'Topics, subscriptions, push/pull, and at-least-once.', difficulty: 'intermediate', estimatedMinutes: 35, priority: 'high' },
      { id: 'res-8-2', title: 'Edge vs level triggered (K8s)', kind: 'article', source: 'itnext.io', url: 'https://blog.container-solutions.com/kubernetes-architecture-explained', description: 'The classic framing you are borrowing.', difficulty: 'intermediate', estimatedMinutes: 25, priority: 'medium' },
      { id: 'res-8-3', title: 'Google SRE workbook: alerting', kind: 'article', source: 'sre.google', url: 'https://sre.google/workbook/alerting-on-slos/', description: 'Alerting semantics that respect human attention.', difficulty: 'intermediate', estimatedMinutes: 40, priority: 'medium' },
    ],
    labs: [
      {
        id: 'lab-8-1',
        title: 'The evaluation loop',
        problem: 'Register a predicate (memory.working_set/memory.limit > 0.9) and evaluate it every scrape tick, emitting on change.',
        whyItMatters: 'Continuity: the same engine now powers pull and push.',
        prerequisites: ['Phase 3 query engine'],
        requirements: [
          { id: 'req-8-1', text: 'POST /standing accepts a predicate + dwell.' },
          { id: 'req-8-2', text: 'Evaluation runs per tick with a shared state view.' },
          { id: 'req-8-3', text: 'Emissions are structured events, not log lines.' },
        ],
        hints: 'The horse you must not lose: standing queries are the SAME predicate engine as /fleet/query, just continuously evaluated.',
        expectedOutput: 'Posting a predicate produces a subscribeable event stream.',
        acceptanceCriteria: [{ id: 'ac-8-1', text: 'A registered predicate emits when the fleet answer changes.' }],
        skillsPracticed: ['go', 'pubsub', 'query-engines'],
        estimatedMinutes: 150,
        difficulty: 'advanced',
      },
      {
        id: 'lab-8-2',
        title: 'Flapping, hysteresis, dwell',
        problem: 'A container oscillating at 89.8/90.1 fills your topic with 400 events a minute. Fix it with hysteresis (separate high/low thresholds) or dwell (must hold for 60s).',
        whyItMatters: 'Alerting is a product, not a loop, and attention is the scarce resource.',
        prerequisites: ['lab-8-1'],
        requirements: [
          { id: 'req-8-4', text: 'Implement hysteresis with distinct enter/exit thresholds.' },
          { id: 'req-8-5', text: 'Or implement dwell with a 60s hold before firing.' },
          { id: 'req-8-6', text: 'First spam the topic on purpose; then fix it. Feel the pressure.' },
        ],
        hints: 'The design pressure is only real when you have spammed the topic. Do the broken thing first.',
        expectedOutput: 'A topic that stays quiet for a container hovering at the threshold.',
        acceptanceCriteria: [{ id: 'ac-8-2', text: 'An oscillating container emits at most a handful of events over a minute.' }],
        skillsPracticed: ['alerting', 'go', 'pubsub'],
        estimatedMinutes: 120,
        difficulty: 'advanced',
      },
      {
        id: 'lab-8-3',
        title: 'Dedup + DLQ, poisoned on purpose',
        problem: 'At-least-once means the same crossing lands twice. Design the idempotency key, then build a DLQ and deliberately poison it.',
        whyItMatters: '10-second scrapes mean you never observe a crossing; you infer it. The key must survive that.',
        prerequisites: ['lab-8-2'],
        requirements: [
          { id: 'req-8-7', text: 'Idempotency key: container_uid + predicate_id + transition_ts.' },
          { id: 'req-8-8', text: 'Define what a transition timestamp means with 10s scrape interval.' },
          { id: 'req-8-9', text: 'DLQ configured so a malformed event cannot block the topic.' },
        ],
        hints: 'You saw 88% at 08:59:50 and 92% at 09:00:00. The transition is an inference between samples — put the inferred boundary in the event, not a fabricated observation.',
        expectedOutput: 'A pipeline where poison messages land in the DLQ and statistics-free delivery works.',
        acceptanceCriteria: [
          { id: 'ac-8-3', text: 'A duplicated event does not double-fire the subscriber.' },
          { id: 'ac-8-4', text: 'A poison message ends in the DLQ, not a wedged topic.' },
        ],
        skillsPracticed: ['pubsub', 'go', 'concurrency'],
        estimatedMinutes: 120,
        difficulty: 'advanced',
      },
    ],
    miniProject: {
      id: 'mp-8',
      title: 'Standing queries pipeline',
      problem: 'POST a standing query, watch events land in a Pub/Sub topic, and emit something visible (Slack post, k8s Event, or annotation).',
      requirements: [
        { id: 'mpr-8-1', text: 'A subscriber does something a human sees without reading logs.' },
        { id: 'mpr-8-2', text: 'Dedup and DLQ are configured and demonstrated.' },
      ],
      acceptanceCriteria: [
        { id: 'mpa-8-1', text: 'The pipeline ends in visible output, not a log line.' },
        { id: 'mpa-8-2', text: 'Flapping does not produce a topic fire hose.' },
      ],
      skillsPracticed: ['go', 'pubsub', 'alerting'],
      estimatedHours: 8,
    },
    repositories: [
      {
        id: 'repo-prometheus-alertmanager',
        name: 'Prometheus Alertmanager',
        url: 'https://github.com/prometheus/alertmanager',
        whyStudy: 'The popular alarm router with real flapping/grouping semantics.',
        whatToLookFor: 'Repeated firing, grouping, and silencing.',
        importantFiles: ['dispatch/'],
        concepts: ['grouping', 'repeats', 'silence'],
        guidedSteps: [
          { id: 'rs-a-1', text: 'Read how they group related alerts.' },
          { id: 'rs-a-2', text: 'See how repeats are throttled.' },
        ],
      },
    ],
    assessment: [
      { id: 'as-8-1', type: 'mcq', question: 'A standing query is best described as:', options: ['A cron job that POSTs JSON', 'The same predicate engine as /fleet/query, evaluated continuously', 'A BigQuery subscription', 'A webhook endpoint'], correctOption: 1 },
      { id: 'as-8-2', type: 'mcq', question: 'Edge-triggered vs level-triggered standing queries are:', options: ['Identical implementations', 'Edge is an alerting system, level is a state stream, and they are different products', 'Level is always better', 'Edge cannot be used for alerts'], correctOption: 1 },
      { id: 'as-8-3', type: 'short_answer', question: 'You observed 88% at 08:59:50 and 92% at 09:00:00. The standing query fires for a crossing "at 08:59:55". What time goes in the event and why?', idealAnswer: 'The crossing is an inference, not an observation — put the inferred boundary (interpolated between the two samples) in the event and state the observation window. The subscriber should expect the transition_ts to be an inference because scrapes are discrete.' },
      { id: 'as-8-4', type: 'architecture', question: 'Design the dedup model for a topic where a subscriber may receive an event twice.', idealAnswer: 'Idempotency key (container_uid, predicate_id, transition_ts) and make the subscriber dedup on it. The star of the show is what transition_ts means when you only observed below/above samples — it is an inferred boundary, and your model must say so.' },
    ],
    interviewQuestions: [
      { id: 'iq-8-1', question: 'Edge-triggered or level-triggered for your alerts, and what does your subscriber actually want?', idealAnswer: 'Edge is an alerting product: one event per transition, stops firing after the crossing. Level is a state stream: re-emitting while above threshold. Most subscribers want edge for pages (attention is scarce) but level for dashboards and state reconciliation — pick per subscriber, not per product.' },
      { id: 'iq-8-2', question: 'What breaks first when a container flaps across the threshold?', idealAnswer: 'Event volume (topic becomes a fire hose), then subscriber attention, then your DLQ if a wedged subscriber blocks the topic. Fix order: hysteresis/dwell → dedup → DLQ, and prove it by spamming first.' },
      { id: 'iq-8-3', question: 'Why is dedup "at-least-once" a design problem rather than a deployment detail?', idealAnswer: 'Because the duplicate is structurally guaranteed by Pub/Sub, and your idempotency key is a product decision: transition_ts is an inference under 10s scrapes, so the key encodes your identity and timing model — that is design, not plumbing.' },
    ],
  },

  // =====================================================================
  // Phase 8: CI/CD & GitOps
  // =====================================================================
  'rm-9': {
    topicId: 'rm-9',
    introduction:
      'GitHub Actions with OIDC to GCP — zero long-lived secrets. Build, go vet, and race detector in CI; integration tests against a kind cluster; digest-pinned pushes to Artifact Registry; ArgoCD reconciling from the repo; then deliberately kubectl-edit a Deployment and watch Argo revert it, so you feel what level-triggered reconciliation means. Stretch: Cosign signing plus a Kyverno policy that rejects unsigned images.',
    estimatedHours: 12,
    difficulty: 'intermediate',
    objectives: [
      { id: 'obj-9-1', text: 'Wire GitHub Actions OIDC to GCP with no stored secrets.' },
      { id: 'obj-9-2', text: 'Run build, vet, race detector, and kind integration tests in CI.' },
      { id: 'obj-9-3', text: 'Push images to Artifact Registry digest-pinned.' },
      { id: 'obj-9-4', text: 'Reconcile cluster state with ArgoCD from the repo and watch drift revert.' },
    ],
    resources: [
      { id: 'res-9-1', title: 'GitHub Actions OIDC', kind: 'documentation', source: 'docs.github.com', url: 'https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect', description: 'Token federation — no long-lived secrets.', difficulty: 'intermediate', estimatedMinutes: 40, priority: 'high' },
      { id: 'res-9-2', title: 'ArgoCD docs', kind: 'documentation', source: 'argo-cd.readthedocs.io', url: 'https://argo-cd.readthedocs.io/en/stable/', description: 'App of apps, sync policy, drift detection.', difficulty: 'intermediate', estimatedMinutes: 45, priority: 'high' },
      { id: 'res-9-3', title: 'Cosign (sigstore)', kind: 'documentation', source: 'docs.sigstore.dev', url: 'https://docs.sigstore.dev/cosign/overview/', description: 'Signing images, verify policies.', difficulty: 'intermediate', estimatedMinutes: 30, priority: 'low' },
      { id: 'res-9-4', title: 'Kyverno docs', kind: 'documentation', source: 'kyverno.io', url: 'https://kyverno.io/docs/', description: 'Admission policies — reject unsigned images.', difficulty: 'intermediate', estimatedMinutes: 30, priority: 'low' },
    ],
    labs: [
      {
        id: 'lab-9-1',
        title: 'OIDC pipeline, zero secrets',
        problem: 'Wire GitHub Actions to GCP via OIDC with no stored secrets, pushing digest-pinned images to Artifact Registry.',
        whyItMatters: 'Every secret you never create is a secret you cannot leak.',
        prerequisites: ['GitHub repo', 'GCP project'],
        requirements: [
          { id: 'req-9-1', text: 'OIDC federated pool + workload identity provider for GitHub.' },
          { id: 'req-9-2', text: 'CI runs go vet and the race detector on tests.' },
          { id: 'req-9-3', text: 'Images pushed by digest and referenced by digest.' },
        ],
        hints: 'The race detector will find something in collector concurrent scrapes — that is the point of the test.',
        expectedOutput: 'A green pipeline that never touches a stored secret and pushes by digest.',
        acceptanceCriteria: [
          { id: 'ac-9-1', text: 'CI passes vet + race detector on the three binaries.' },
          { id: 'ac-9-2', text: 'artifact references are by digest, not mutable tag.' },
        ],
        skillsPracticed: ['github-actions', 'gke', 'workload-identity'],
        estimatedMinutes: 150,
        difficulty: 'intermediate',
      },
      {
        id: 'lab-9-2',
        title: 'ArgoCD reconciliation',
        problem: 'Deploy Cairn via ArgoCD from the repo, then kubectl-edit a Deployment and watch Argo revert it.',
        whyItMatters: 'You must feel level-triggered reconciliation: Argo is not watching for changes, it converges always.',
        prerequisites: ['lab-9-1', 'A cluster with ArgoCD'],
        requirements: [
          { id: 'req-9-4', text: 'ArgoCD Application pointing at the repo path.' },
          { id: 'req-9-5', text: 'kubectl edit a manifest field, then observe revert.' },
        ],
        hints: 'GitOps means the repo is the source of truth. Drift is an anomaly, not "state".',
        expectedOutput: 'A reverted Deployment and a written paragraph on what you observed.',
        acceptanceCriteria: [{ id: 'ac-9-3', text: 'Edited field returns to repo state within the sync interval.' }],
        skillsPracticed: ['argocd', 'gitops', 'kustomize'],
        estimatedMinutes: 120,
        difficulty: 'intermediate',
      },
      {
        id: 'lab-9-3',
        title: 'Stretch: sign and enforce',
        problem: 'Sign images with Cosign and add a Kyverno policy that rejects unsigned images.',
        whyItMatters: 'Supply chain: admission is the enforcement point that makes signing matter.',
        prerequisites: ['lab-9-2'],
        requirements: [
          { id: 'req-9-6', text: 'CI signs images with Cosign (keyless).' },
          { id: 'req-9-7', text: 'Kyverno ClusterPolicy verifies signature on admission.' },
        ],
        hints: 'Mark this as stretch. The verify happens on admission, so a signed-then-tampered digest is what the policy catches.',
        expectedOutput: 'An unsigned image is rejected at admission.',
        acceptanceCriteria: [{ id: 'ac-9-4', text: 'Deploying an unsigned image returns a policy error.' }],
        skillsPracticed: ['cosign', 'gitops', 'github-actions'],
        estimatedMinutes: 120,
        difficulty: 'advanced',
      },
    ],
    miniProject: {
      id: 'mp-9',
      title: 'GitOps pipeline',
      problem: 'A merge that builds, signs, pushes by digest, and ArgoCD deploys — end to end, no console clicks.',
      requirements: [
        { id: 'mpr-9-1', text: 'Pipeline is fully automated via GitHub Actions + OIDC.' },
        { id: 'mpr-9-2', text: 'Cluster state comes from the repo via ArgoCD.' },
      ],
      acceptanceCriteria: [
        { id: 'mpa-9-1', text: 'Merging to main ships to the cluster.' },
        { id: 'mpa-9-2', text: 'A deliberate kubectl edit gets reverted.' },
      ],
      skillsPracticed: ['github-actions', 'argocd', 'gitops'],
      estimatedHours: 7,
    },
    repositories: [
      {
        id: 'repo-argocd-example',
        name: 'ArgoCD (docs examples)',
        url: 'https://github.com/argoproj/argo-cd',
        whyStudy: 'The canonical GitOps controller you are now running.',
        whatToLookFor: 'Reconciliation model, sync hooks, health checks.',
        importantFiles: ['docs/operator-manual/'],
        concepts: ['reconciliation', 'sync', 'health'],
        guidedSteps: [
          { id: 'rs-arg-1', text: 'Read how the controller loop models drift.' },
          { id: 'rs-arg-2', text: 'Note the difference between sync hooks and the level trigger.' },
        ],
      },
    ],
    assessment: [
      { id: 'as-9-1', type: 'mcq', question: 'In GitHub Actions, how does Cairn authenticate to GCP in a world of zero long-lived secrets?', options: ['Store a service account key as a secret', 'OIDC federation: the Actions token maps to a GCP identity', 'SSH keys', 'The kubeconfig it is given'], correctOption: 1 },
      { id: 'as-9-2', type: 'mcq', question: 'ArgoCD reverting your kubectl edit demonstrates:', options: ['A bug in kubectl', 'Level-triggered reconciliation: the controller converges to the repo state', 'A misconfigured webhook', 'Git hooks'], correctOption: 1 },
      { id: 'as-9-3', type: 'short_answer', question: 'Why reference images by digest rather than by tag in production?', idealAnswer: 'Tags are mutable and can be re-pointed after the promoting scan or build; a digest is the immutable content hash. If admission-resolved images are referenced by digest, a tampered or swapped image cannot quietly ship.' },
      { id: 'as-9-4', type: 'architecture', question: 'Your pipeline pushes to Artifact Registry but never signs. What is the supply-chain gap, and where does enforcement belong?', idealAnswer: 'Anyone who can write to the registry can ship; without provenance and verification at admission you cannot tell a real publish from a malicious one. Enforcement belongs at admission (Kyverno verifying the signature chain), not in the build, because enforcement near the consumer is what closes the loop.' },
    ],
    interviewQuestions: [
      { id: 'iq-9-1', question: 'What does "zero long-lived secrets" buy you, concretely, over storing a service account key?', idealAnswer: 'The OIDC token is short-lived and scoped per workflow run; there is no rotating key to leak, revoke, or rotate, and a compromised CI log cannot exfiltrate a reusable credential. Cost: you must configure the federation and keep trust domain tight.' },
      { id: 'iq-9-2', question: 'What did deliberately kubectl-editing a Deployment teach you?', idealAnswer: 'That ArgoCD does not watch for change and react — it continuously converges cluster state to the repo. The edit is drift, and drift is always reconciled, which is exactly what level-triggered reconciliation means versus a webhook reacting to an event.' },
    ],
  },

  // =====================================================================
  // Phase 9: Observability, Recursively
  // =====================================================================
  'rm-10': {
    topicId: 'rm-10',
    introduction:
      'Cairn is a monitoring system, so you must monitor the monitor — and that makes this phase unusually good. Instrument scrape lag, ring rebalance count, shard balance, dropped samples, partial-sample rate, query latency, standing-query lag. Learn the cardinality lesson the hard way: your data can be high-cardinality (it is the product), but your metrics about your data cannot. Then deploy Prometheus and cAdvisor alongside Cairn and diff container by container — where you disagree, one of you is wrong.',
    estimatedHours: 18,
    difficulty: 'advanced',
    objectives: [
      { id: 'obj-10-1', text: 'Instrument the platform: scrape lag, ring churn, shard skew, dropped samples, query latency, standing-query lag.' },
      { id: '10-2', text: 'Learn the cardinality rule by breaking it (label a metric with container_id, watch it hurt).' },
      { id: 'obj-10-3', text: 'Define SLOs with meaningful targets and burn-rate alerts.' },
      { id: 'obj-10-4', text: 'Diff Cairn against Prometheus+cAdvisor container-by-container and chase discrepancies.' },
      { id: 'obj-10-5', text: 'Write the runbook for "Cairn says 12 nodes are stale."' },
    ],
    resources: [
      { id: 'res-10-1', title: 'Prometheus best practices (cardinality)', kind: 'documentation', source: 'prometheus.io', url: 'https://prometheus.io/docs/practices/naming/', description: 'The naming and cardinality rules that matter.', difficulty: 'intermediate', estimatedMinutes: 25, priority: 'high' },
      { id: 'res-10-2', title: 'Google SRE Workbook: implementing SLOs', kind: 'article', source: 'sre.google', url: 'https://sre.google/workbook/implementing-slos/', description: 'SLIs, targets, error budgets, burn rates.', difficulty: 'intermediate', estimatedMinutes: 45, priority: 'high' },
      { id: 'res-10-3', title: 'cAdvisor metrics reference', kind: 'documentation', source: 'github.com/google', url: 'https://github.com/google/cadvisor/blob/master/docs/storage/prometheus.md', description: 'The exact metric names to diff against.', difficulty: 'intermediate', estimatedMinutes: 20, priority: 'high' },
    ],
    labs: [
      {
        id: 'lab-10-1',
        title: 'Instrument yourself',
        problem: 'Expose /metrics for the collector: scrape lag per node, ring rebalance count, nodes-per-collector skew, dropped samples, partial-sample rate, query latency by tier, standing-query evaluation lag.',
        whyItMatters: 'The recursion: a monitoring system you cannot introspect is papering over its own blind spots.',
        prerequisites: ['Phase 4 collector', 'Phase 6 API'],
        requirements: [
          { id: 'req-10-1', text: 'A /metrics endpoint in the Prometheus format.' },
          { id: 'req-10-2', text: 'At least one gauge per item in the list above.' },
          { id: 'req-10-3', text: 'Shard skew measurable: nodes per collector.' },
        ],
        hints: 'The interesting one is skew: balanced shards are not automatic. Count them.',
        expectedOutput: 'Prometheus can scrape Cairn and render its own health.',
        acceptanceCriteria: [{ id: 'ac-10-1', text: 'Scraping /metrics yields every listed instrument.' }],
        skillsPracticed: ['monitoring', 'logging', 'go'],
        estimatedMinutes: 150,
        difficulty: 'advanced',
      },
      {
        id: 'lab-10-2',
        title: 'The cardinality lesson',
        problem: 'Label your metrics with container_id. Watch Prometheus suffer. Then work out the rule and fix it.',
        whyItMatters: 'Cardinality is literally your product — but your metrics about your data cannot be high-cardinality.',
        prerequisites: ['lab-10-1'],
        requirements: [
          { id: 'req-10-4', text: 'Add a container_id label to one Cairn metric and observe the cost.' },
          { id: 'req-10-5', text: 'Document the rule: data can be high-cardinality, metrics about data cannot.' },
        ],
        hints: 'Series cardinality grows as metrics × label values. 4,000 containers × one metric = 4,000 series — fine; × dimensions you do not control, not fine.',
        expectedOutput: 'A written lesson and a metric scheme that respects the rule.',
        acceptanceCriteria: [{ id: 'ac-10-2', text: 'No Cairn operational metric carries a container_id label.' }],
        skillsPracticed: ['monitoring', 'slos'],
        estimatedMinutes: 90,
        difficulty: 'intermediate',
      },
      {
        id: 'lab-10-3',
        title: 'SLOs, burn rates, runbook',
        problem: 'Define and alert on three SLOs: query latency p99 < 500ms for the memory tier, 95% of nodes reporting within 30s, standing-query detection lag < 90s. Then write the runbook for stale nodes.',
        whyItMatters: 'Every SLO is a promise with a cost; burn-rate alerts fire before the budget is gone, not after.',
        prerequisites: ['lab-10-2'],
        requirements: [
          { id: 'req-10-6', text: 'Three SLOs with SLI definitions and targets.' },
          { id: 'req-10-7', text: 'Burn-rate alerting on each (fast + slow window).' },
          { id: 'req-10-8', text: 'runbook.md: "Cairn says 12 nodes are stale. What do you check, in what order?"' },
        ],
        hints: 'Runbooks are ordered checklists built from your own failure modes. Stale → check time source, ring membership, network, disk on agent, in that order? Write what YOU would check.',
        expectedOutput: 'Alerts that can fire before the error budget burns, and a runbook a newcomer can follow.',
        acceptanceCriteria: [
          { id: 'ac-10-3', text: 'Each SLO has an SLI definition, target, and burn-rate alert.' },
          { id: 'ac-10-4', text: 'The runbook has an explicit ordered checklist.' },
        ],
        skillsPracticed: ['slos', 'alerting', 'monitoring'],
        estimatedMinutes: 120,
        difficulty: 'advanced',
      },
    ],
    miniProject: {
      id: 'mp-10',
      title: 'Diff against ground truth',
      problem: 'Deploy Prometheus and cAdvisor alongside Cairn scraping the same nodes. Diff your fleet numbers container-by-container and write up every discrepancy with its root cause.',
      requirements: [
        { id: 'mpr-10-1', text: 'Prometheus + cAdvisor deployed in the cluster.' },
        { id: 'mpr-10-2', text: 'A comparison report with per-metric root causes.' },
      ],
      acceptanceCriteria: [
        { id: 'mpa-10-1', text: 'The report identifies at least one real discrepancy you fixed.' },
        { id: 'mpa-10-2', text: 'Where you disagree, you know which tool is right and why.' },
      ],
      skillsPracticed: ['monitoring', 'slos', 'go'],
      estimatedHours: 9,
    },
    repositories: [
      {
        id: 'repo-prometheus-self',
        name: 'Prometheus (again, in anger)',
        url: 'https://github.com/prometheus/prometheus',
        whyStudy: 'Now you read its internals as a subject, not a reference.',
        whatToLookFor: 'How it models scrape success/failure and staleness marker emission.',
        importantFiles: ['scrape/', 'storage/'],
        concepts: ['scrape lifecycle', 'staleness markers'],
        guidedSteps: [
          { id: 'rs-p-7', text: 'Skin the scrape loop and where failures are recorded.' },
          { id: 'rs-p-8', text: 'Read how a disappearing target becomes a stale marker.' },
        ],
      },
    ],
    assessment: [
      { id: 'as-10-1', type: 'mcq', question: 'Why must your operational metrics NOT be labeled with container_id?', options: ['Because containers are transient when you restart them', 'Because operational metric cardinality explodes with the fleet', 'Because container_id is sensitive', 'Because Prometheus cannot store strings'], correctOption: 1 },
      { id: 'as-10-2', type: 'mcq', question: 'A burn-rate alert fires when:', options: ['Any single error is detected', 'The rate of budget consumption over a window predicts budget exhaustion', 'A node goes down', 'The dashboard turns red'], correctOption: 1 },
      { id: 'as-10-3', type: 'short_answer', question: 'Cairn says 12 nodes are stale. What do you check, in what order, and why that order?', idealAnswer: 'Ordered by likeliest first plus cheap first: (1) time source / NTP drift, (2) ring membership — did a collector rebalance drop those nodes?, (3) network between those nodes and their collectors, (4) agent process/disk on affected nodes, (5) end with the data: are the stale nodes real or a counting bug in Cairn. The order minimizes time-to-triage while favoring the failures you have seen before.' },
      { id: 'as-10-4', type: 'architecture', question: 'Design a single SLO for "the answers are timely". What is the SLI, target, and why is 100% the wrong target?', idealAnswer: 'SLI: fraction of node-scrapes completing within 30s over the window. Target 95%, burn-rate alerts. 100% is the wrong target because the long tail of mandatory maintenance, GC pauses, and churn makes an absolute promise unachievable and turns every SLO tap into an exhausted budget — error budgets exist precisely to fund risk.' },
    ],
    interviewQuestions: [
      { id: 'iq-10-1', question: 'What is the cardinality rule, and does it contradict your product being high-cardinality data?', idealAnswer: 'No contradiction. The product (per-container series) is meant to be high-cardinality — that is the point. The operational metrics about that product must stay bounded: no container_id labels, no unbounded dimensions. Two very different metric families with two very different rules.' },
      { id: 'iq-10-2', question: 'How do you run a discrepancy between your tool and cAdvisor when both are right?', idealAnswer: 'Find the modelling difference: working set vs raw charge, sample window alignment, identity drift (which container "this" is), or clock. The resolution is almost never a math bug — it is two tools modelling the same thing differently, and the lesson is which model answers the question you asked.' },
    ],
  },

  // =====================================================================
  // Phase 10: Hardening & Stretch
  // =====================================================================
  'rm-11': {
    topicId: 'rm-11',
    introduction:
      'NetworkPolicies so the agent talks to exactly one thing. Load-test with synthetic agents reporting 4,000 containers and find where it breaks first (my bet: the query engine\'s fleet scan, not ingest). Chaos: kill collectors mid-rebalance, partition a node, step clocks, fill a disk. Then a cost report — what does Cairn cost per node per month — and the stretch goals, in order: MCP server, right-sizing, BQML forecasting.',
    estimatedHours: 20,
    difficulty: 'advanced',
    objectives: [
      { id: 'obj-11-1', text: 'Make the agent talk to exactly one thing via NetworkPolicies.' },
      { id: 'obj-11-2', text: 'Load-test with 4,000 synthetic containers and identify the first bottleneck.' },
      { id: 'obj-11-3', text: 'Run the chaos drills and document behavior.' },
      { id: 'obj-11-4', text: 'Write the per-node-per-month cost report.' },
      { id: 'obj-11-5', text: 'Build at least one stretch goal: MCP server, right-sizing, or BQML forecasting.' },
    ],
    resources: [
      { id: 'res-11-1', title: 'Kubernetes Network Policies', kind: 'documentation', source: 'kubernetes.io', url: 'https://kubernetes.io/docs/concepts/services-networking/network-policies/', description: 'Default-deny and the agent\'s single egress.', difficulty: 'intermediate', estimatedMinutes: 35, priority: 'high' },
      { id: 'res-11-2', title: 'Chaos Mesh', kind: 'documentation', source: 'chaos-mesh.org', url: 'https://chaos-mesh.org/docs/', description: 'Kill pods, partition networks, inject IO faults.', difficulty: 'intermediate', estimatedMinutes: 30, priority: 'medium' },
      { id: 'res-11-3', title: 'BQML introduction', kind: 'documentation', source: 'cloud.google.com', url: 'https://cloud.google.com/bigquery/docs/bqml-introduction', description: 'ML.FORECAST with ARIMA_PLUS in four lines of SQL.', difficulty: 'intermediate', estimatedMinutes: 30, priority: 'low' },
      { id: 'res-11-4', title: 'VPA recommender source', kind: 'repository', source: 'kubernetes/autoscaler', url: 'https://github.com/kubernetes/autoscaler/tree/master/vertical-pod-autoscaler', description: 'For the right-sizing stretch: how the real thing reasons about percentiles.', difficulty: 'advanced', estimatedMinutes: 60, priority: 'low' },
    ],
    labs: [
      {
        id: 'lab-11-1',
        title: 'NetworkPolicy: one thing',
        problem: 'Lock the agent down so it talks to exactly one thing (the collector), and document the reasoning.',
        whyItMatters: 'Hardening is where "it works" stops being enough.',
        prerequisites: ['Phase 5 deploy'],
        requirements: [
          { id: 'req-11-1', text: 'Default-deny namespace policy.' },
          { id: 'req-11-2', text: 'Agent egress to collector\'s scrape port only.' },
          { id: 'req-11-3', text: 'A label scheme (app=cairn-agent etc.) policy can target.' },
        ],
        hints: 'Egress on a DaemonSet = allow pod selector to collector service. Prove it with a blocked path test.',
        expectedOutput: 'An agent that cannot reach anything but its one peer.',
        acceptanceCriteria: [{ id: 'ac-11-1', text: 'Egress to anything other than the collector returns a failure.' }],
        skillsPracticed: ['network-policy', 'daemonset'],
        estimatedMinutes: 120,
        difficulty: 'advanced',
      },
      {
        id: 'lab-11-2',
        title: 'Load test 4,000 containers',
        problem: 'Run synthetic agents reporting 4,000 containers and find where it breaks first.',
        whyItMatters: 'The bet: the query engine\'s fleet scan, not the ingest. Test your bet.',
        prerequisites: ['Phase 4 collector'],
        requirements: [
          { id: 'req-11-4', text: 'Synthetic agent generator reporting thousands of containers.' },
          { id: 'req-11-5', text: 'Measure ingest rate and query p99 as load rises.' },
          { id: 'req-11-6', text: 'Record the first bottleneck with evidence.' },
        ],
        hints: 'If ingest saturates first, the ring or scrape pool breaks. If queries blow up first, the scan is not bounded.',
        expectedOutput: 'A load report with a primary bottleneck identified and fixed or acknowledged.',
        acceptanceCriteria: [{ id: 'ac-11-2', text: 'The report names the breaking point and the evidence for it.' }],
        skillsPracticed: ['load-testing', 'monitoring', 'go'],
        estimatedMinutes: 150,
        difficulty: 'advanced',
      },
      {
        id: 'lab-11-3',
        title: 'Chaos drills',
        problem: 'Kill a collector mid-rebalance, partition a node, step a node\'s clock forward 5 minutes, fill a node\'s disk. One at a time, then write the behavior notes.',
        whyItMatters: 'Reliability is what survives the drills you actually run.',
        prerequisites: ['Phase 4 collector exec'],
        requirements: [
          { id: 'req-11-7', text: 'Kill a collector mid-rebalance and observe the ring.' },
          { id: 'req-11-8', text: 'Partition one node and confirm stale-handling honesty.' },
          { id: 'req-11-9', text: 'Step a clock forward and confirm rate behavior.' },
        ],
        hints: 'Fill the disk last — it teaches you which metrics disappear first.',
        expectedOutput: 'One paragraph per drill: what happened, what broke, what you fixed.',
        acceptanceCriteria: [{ id: 'ac-11-3', text: 'Every drill has an outcome note and at least one surviving system.' }],
        skillsPracticed: ['chaos', 'staleness', 'clock-skew'],
        estimatedMinutes: 150,
        difficulty: 'advanced',
      },
      {
        id: 'lab-11-4',
        title: 'Stretch: MCP server',
        problem: 'Expose the Cairn query API through a Model Context Protocol server so an agent can ask the cluster questions in English.',
        whyItMatters: 'If the query surface from Phase 3 is well-shaped, this is ~50 lines. If it is bad, this is impossible. The test is whether the API design was right.',
        prerequisites: ['Phase 3 query API'],
        requirements: [
          { id: 'req-11-10', text: 'An MCP server wrapping /fleet/* as tools.' },
          { id: 'req-11-11', text: 'Natural questions map to named queries with parameters.' },
        ],
        hints: 'You already did the hard part (Phase 3). This is validation, not invention.',
        expectedOutput: 'An agent asks "which containers are about to hit their memory limit" and gets the fleet answer.',
        acceptanceCriteria: [{ id: 'ac-11-4', text: 'One English question resolves to a correct /fleet query result.' }],
        skillsPracticed: ['mcp', 'rest-apis', 'query-engines'],
        estimatedMinutes: 120,
        difficulty: 'advanced',
      },
    ],
    miniProject: {
      id: 'mp-11',
      title: 'Hardened, load-tested, and costed',
      problem: 'Cairn ships hardened (policies, load report, chaos notes) with a per-node-per-month cost report and at least one stretch goal working.',
      requirements: [
        { id: 'mpr-11-1', text: 'NetworkPolicies, load report, chaos notes are committed.' },
        { id: 'mpr-11-2', text: 'cost report: GCS storage + BigQuery scan + GKE DaemonSet overhead.' },
        { id: 'mpr-11-3', text: 'At least one stretch goal demonstrated.' },
      ],
      acceptanceCriteria: [
        { id: 'mpa-11-1', text: 'The cost report answers "is Cairn worth it?" with numbers.' },
        { id: 'mpa-11-2', text: 'Stretch goal demo is reproducible from the repo.' },
      ],
      skillsPracticed: ['network-policy', 'chaos', 'load-testing', 'cost-telemetry'],
      estimatedHours: 10,
    },
    repositories: [
      {
        id: 'repo-vpa',
        name: 'VPA recommender',
        url: 'https://github.com/kubernetes/autoscaler/tree/master/vertical-pod-autoscaler',
        whyStudy: 'The real right-sizing engine; percentiles, confidence, and recommendation semantics.',
        whatToLookFor: 'How it derives requests from usage percentiles and what confidence justifies it.',
        importantFiles: ['pkg/recommender/'],
        concepts: ['percentile reference', 'recommendation smoothing'],
        guidedSteps: [
          { id: 'rs-v-1', text: 'Find where the p50/p90/p95 usage reference is built.' },
          { id: 'rs-v-2', text: 'Note how recommendations handle cold starts.' },
        ],
      },
      {
        id: 'repo-cadvisor-final',
        name: 'cAdvisor (final pass)',
        url: 'https://github.com/google/cadvisor',
        whyStudy: 'After 10 weeks, one more read to confirm your mental model converged with theirs.',
        whatToLookFor: 'Anything that still surprises you — that is untested knowledge.',
        importantFiles: ['container/libcontainer/handler.go'],
        concepts: ['working-set', 'container identity', 'rate handling'],
        guidedSteps: [
          { id: 'rs-c-7', text: 'Re-read handler.go and confirm your working-set understanding.' },
          { id: 'rs-c-8', text: 'List anything you got wrong along the way.' },
        ],
      },
    ],
    assessment: [
      { id: 'as-11-1', type: 'mcq', question: 'The load test bet in the spec is that which system breaks first at 4,000 containers?', options: ['Ingest', 'The query engine\'s fleet scan', 'The storage layer', 'The ring'], correctOption: 1 },
      { id: 'as-11-2', type: 'mcq', question: 'A NetworkPolicy for the agent should:', options: ['Allow all egress, deny ingress', 'Default-deny and allow exactly one egress destination', 'Allow egress to every pod', 'Block everything including DNS'], correctOption: 1 },
      { id: 'as-11-3', type: 'short_answer', question: 'What does Cairn cost per node per month, and is it worth it? Build the cost model.', idealAnswer: 'Model: GCS storage (rollup bytes × tier prices), BigQuery scan (bytes scanned on historical queries), and GKE overhead (agent pod CPU/memory × node count). Answer with real prices, a per-node monthly figure, and a policy judgment: the cost buys you early detection of throttling/OOM across the fleet — quantify the counterfactual of not having it before declaring worth.' },
      { id: 'as-11-4', type: 'architecture', question: 'The MCP server is "about 50 lines if the API is well-shaped". What does that reveal about your Phase 3 work?', idealAnswer: 'It is the test: if a 50-line wrapper can map English questions to named queries with parameters, the query surface was the right layer. If it balloons, the API did not carry the product and you find out at the cheapest possible moment.' },
    ],
    interviewQuestions: [
      { id: 'iq-11-1', question: 'An attacker compromises cairn-agent. Exactly what can they now do, and is that acceptable?', idealAnswer: 'They read every container\'s resource profile on that node (reconnaissance) and can forge vitals for it. They cannot reach the API server beyond nodes/proxy, have no writable host mounts, and get no other nodes\' data. Acceptable if this blast radius is documented and the agent has no escalation path.' },
      { id: 'iq-11-2', question: 'Right-sizing says "2 cores requested, p99 usage 0.12 for 30 days". What confidence interval justifies a recommendation, and what does VPA actually do?', idealAnswer: 'VPA derives a reference of usage (e.g. p90 of resource usage over a window), extrapolates to a safety margin, and recommends requests. The interesting decision is which percentile to recommend at — that is a product choice about the acceptable recomm infection: low percentile = cost savings and risk of OOM, high percentile = safety and waste. Confidence comes from observation window length and traffic stability.' },
      { id: 'iq-11-3', question: 'BQML says "this container hits its memory limit in about 4 hours". Would you page someone on a prediction? What is your false-positive budget?', idealAnswer: 'Paging on forecasts is wrong until you have measured the model\'s precision against the cost of a false page, which for 3am attention is high. The right pattern: use the forecast as a standing query over future data with a lower severity channel first (e.g. scheduled view, not page), then promote to paging only with measured precision above your explicit false-positive budget.' },
    ],
  },
};

export function getCurriculum(topicId: string): TopicCurriculum | undefined {
  return curricula[topicId];
}