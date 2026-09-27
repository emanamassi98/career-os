Foundational Computer Science concepts (covered in the attached 0-computer-science.pdf roadmap).

Systems engineering fundamentals, operating systems, and system design concepts.

Systems programming with Go (instead of C++), given its prevalence in modern infrastructure and distributed systems.

Assignment Guidelines:
Workflow: Work phase-by-phase and submit each stage as a separate Pull Request on a private GitHub repository: https://github.com/emanamassi/career-os-eman



Assignment
Cairn: a query-shaped fleet introspection plane
What you're building
An API that answers the question every on-call engineer asks at 3am and no tool answers well: which containers on my fleet are about to fall over, and why?
GET /fleet/pressure?over=memory&threshold=0.9
GET /fleet/throttled?since=5m
GET /fleet/query?p=memory.working_set/memory.limit>0.85 AND cpu.throttled_pct>0.1

The data comes from reading cgroup v2 files on each node. The product is the query layer on top of it, the fleet-wide fan-in behind it, and everything needed to run the whole thing for real.
By the end you'll have htop for the cluster. One page, live numbers, every container. You'll be able to point at a container and say that one is being throttled to death and nobody noticed.

Read this first
This is a cAdvisor clone. cAdvisor already exists, it's good, and it already does the hard parts.
That's on purpose. Rebuilding a system you already depend on, with the original sitting right there, is one of the few ways to find out whether you actually understand it. You can diff your numbers against kubectl top and against cAdvisor's own output, and when you disagree, one of you is wrong. You get to find out which. Most side projects can't give you that.
The part that isn't a clone is the query layer. cAdvisor and Prometheus hand you counters and make you assemble the question yourself. Cairn answers questions directly. That's the piece you design rather than transcribe, and it's where the interesting decisions are.
The Go is not the assignment. Reading /sys/fs/cgroup/.../memory.current and parsing an integer is a first-day task. If Cairn were a cgroup file parser it would take a week. It takes ten weeks because the numbers in those files don't mean what you think they mean, because containers move underneath you while you read them, and because doing this across forty nodes is a distributed systems problem wearing a monitoring costume.

Architecture
                   ┌──────────────────┐
                    │   Query API      │  ad-hoc queries (pull)
                    │  /fleet/*        │  standing queries (push)
                    └────────┬─────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
     ┌────────▼────────┐          ┌─────────▼────────┐
     │   Collector     │          │  BigQuery /      │   historical tier
     │  (sharded)      │          │  GCS parquet     │   (?since= > window)
     │  recent window  │          └──────────────────┘
     └────────┬────────┘
              │ scrape
    ┌─────────┼─────────┬─────────┐
    │         │         │         │
┌───▼───┐ ┌───▼───┐ ┌───▼───┐ ┌───▼───┐
│ agent │ │ agent │ │ agent │ │ agent │   DaemonSet, one per node
│(node) │ │(node) │ │(node) │ │(node) │   reads cgroup v2 + kubelet
└───────┘ └───────┘ └───────┘ └───────┘

Standing query fires ──▶ Pub/Sub topic ──▶ subscriber (Slack / annotations)
                                       └─▶ DLQ

Three binaries. cairn-agent (DaemonSet), cairn-collector (sharded Deployment), cairn-api (Deployment). The agent is deliberately dumb. The collector and API are where the product lives.

Phase 0: the naive agent, and the lie (week 1)
Write the dumbest possible thing. Walk /sys/fs/cgroup, read the files, return JSON on GET /vitals. No Kubernetes awareness yet, just here are the cgroups on this machine and their numbers.
Files that matter:
File
What it holds
memory.current
current memory charge, including page cache
memory.max
the limit, or max
memory.stat
the breakdown: anon, file, inactive_file, slab
memory.events
oom, oom_kill counters
cpu.stat
usage_usec, nr_throttled, throttled_usec
cpu.max
quota and period, e.g. 50000 100000
pids.current / pids.max
process count and cap
io.stat
per-device read/write bytes

Stdlib only. log/slog from line one.
Then do the thing that makes this project work. Run a pod with a known memory limit. Have it read a large file. Compare three numbers:
What your agent reports from memory.current
What kubectl top pod reports
What cAdvisor's container_memory_working_set_bytes reports
They won't agree. Yours will be higher.
Don't move on until you can explain why in writing. The short version is that memory.current includes page cache, and page cache is reclaimable, so it isn't "memory in use" in any sense a human means. What everyone actually reports is working set, roughly memory.current - inactive_file. cAdvisor computes it, kubectl top displays it, the OOM killer approximates it, and the raw file doesn't give it to you.
That's the thesis of this assignment. Monitoring is a modelling problem, not a reading problem. The kernel gives you counters. Deciding what those counters mean is where the engineering is. You just found the first place where the obvious reading is wrong. There are four more.
Deliverable: agent runs, returns JSON, plus docs/adr/001-working-set.md explaining the discrepancy with numbers from your own cluster.

Phase 1: the mapping problem (week 2)
Your agent reports cgroup paths. Nobody wants cgroup paths. Turn this:
/sys/fs/cgroup/kubepods.slice/kubepods-burstable.slice/
  kubepods-burstable-pod3f2a8b1c_4d5e_11ee_9f2a_0242ac110002.slice/
  cri-containerd-9ab4c7e2f1d8...scope

into default/checkout-7d9f4-x2klm/checkout.
This is the hardest week and the least glamorous. There's no clean API for it. You have two routes:
Kubelet /pods. https://<node>:10250/pods returns the full PodList for the node, including containerStatuses[].containerID. Needs a token with nodes/proxy RBAC. Easier, slightly indirect.
CRI over the containerd socket. unix:///run/containerd/containerd.sock, gRPC, ListContainers plus ContainerStatus. More direct, more setup, ties you to containerd.
Do the kubelet route first. Treat CRI as a stretch.
Things that will bite you, roughly in the order they'll bite you:
The cgroup driver matters. The systemd driver gives you kubepods-burstable-pod<uid>.slice with underscores instead of dashes in the UID. The cgroupfs driver gives you kubepods/burstable/pod<uid>/. Same concept, different string. Handle both or document loudly that you don't.
QoS classes nest differently. Guaranteed pods sit directly under kubepods.slice. Burstable and BestEffort get their own slice level. Your path parser has to cope with a variable-depth hierarchy.
The pause container is in there. Every pod has one. It uses about zero CPU and 500KB. If you report it, every pod looks like it has a mystery sidecar. Filter it, and know how you're identifying it.
The UID in the cgroup path is the container ID, not the pod UID. Both show up. Don't mix them.
The cri-containerd- prefix is runtime-specific. CRI-O uses crio-. Docker used docker-.
Deliverable: GET /vitals returns real names, plus docs/adr/002-container-discovery.md on which route you picked and why.
Worth thinking about when you're done: you just spent a week on string parsing to work around the absence of a stable interface. Is that a failure of the ecosystem, or is it load-bearing that this stays unstable? There's no right answer. cAdvisor has carried this exact burden for a decade.

Phase 2: counters, rates, and things that vanish (week 3)
cpu.stat gives you usage_usec, a monotonically increasing cumulative counter. Nobody wants cumulative nanoseconds. They want "43% CPU."
That conversion needs two samples and a time delta, and the moment you have two samples you have a distributed systems problem on a single machine.
Build it, then break it:
Compute a rate from consecutive samples. Simple.
Now the container restarts. The counter resets to zero. Your rate is a large negative number. If current < previous you can't know how much you missed. Prometheus assumes the counter reset to 0 and treats the new value as the delta. That assumption is wrong sometimes. Work out why it's still the right call.
Now your scrape interval jitters. 10s, then 12s, then 9s. Do you divide by the nominal interval or the observed one? (Observed. You'll still get this wrong once.)
Go read how Prometheus rate() actually works. Extrapolation to window boundaries, why irate() exists, why the two disagree on the same data. Reinvent it badly first, then read it. The reading only lands after you've felt the problem.
Then the lifecycle races, which are where this stops being a parser:
You open the cgroup directory, read cpu.stat fine, then get ENOENT on memory.current because the container died between the two reads. Half your sample is real. Emit a partial? Drop it? Retry? Pick one and write down why.
A container starts and exits inside one scrape interval. You never see it. Your fleet view is a lie by omission. Is that acceptable? (Mostly yes, but say so explicitly rather than not noticing.)
A pod is restarted by the kubelet. Same pod name, new container ID, counters back to zero. Is that the same container with a reset, or a new container? Your identity model has to answer this, and the answer decides whether your rate graph has a hole or a spike.
Deliverable: GET /vitals returns rates, not counters. throttled_pct is real. Reset detection is tested. Plus docs/adr/003-sample-identity.md on what makes two samples "the same container."
Compare against ground truth again here. Your CPU number against kubectl top. If they agree, be suspicious and check under load rather than at idle.

Phase 3: the query engine (weeks 3 to 4)
This is the part you design. Everything so far has been rebuilding a known system. Now build the bit that isn't in the box.
Prometheus gives you counters and makes you write PromQL to ask a question. Cairn answers questions. The surface looks like:
GET /fleet/pressure?over=memory&threshold=0.9
    → containers whose working_set/limit exceeds 0.9, right now

GET /fleet/throttled?min_pct=0.05&since=5m
    → containers throttled more than 5% of the time in the last 5 minutes

GET /fleet/query?p=memory.working_set/memory.limit>0.85 AND cpu.throttled_pct>0.1
    → the general form

GET /nodes/{node}/containers
GET /containers/{namespace}/{pod}/{container}?since=15m

Decisions you have to make and defend:
How expressive is the predicate language? A fixed set of named queries (/pressure, /throttled) is honest and limited. A general expression parser is powerful, and now you own a language. There's a real middle ground: named queries with parameters, plus one escape hatch. Pick.
What's the unit of the answer? A list of containers? Or a list of containers with the specific values that triggered the match? The second is more useful and more work. Do the second. "This matched" without "here's why" is useless at 3am.
Stable ordering and pagination. A fleet query over 4,000 containers returns what, in what order? Worst-first needs a scoring function, and now you're making a product decision about whether 95% memory is worse than 80% throttling.
What does the response say about confidence? If 3 of 40 nodes haven't reported in 90 seconds, your answer to "which containers are under pressure" is incomplete, and quietly returning a shorter list is a lie. This is the hardest question in the phase and you'll come back to it in Phase 4.
Write docs/adr/004-query-surface.md before you write the code. This is the one place where design-first is right, because the query surface is the product. Everything downstream (Pub/Sub predicates, the BigQuery tier, the MCP server) is shaped by it.
Deliverable: query API over a single node's data. It isn't distributed yet. That's next.

Phase 4: fan-in (weeks 4 to 6)
One node was easy. Forty nodes is the job. Introduce the collector tier.
Push or pull
Write the ADR first.
Pull (collector scrapes agents) means the collector needs discovery, and the failure mode is that you can't distinguish node down from node unreachable from agent crashed. That's Prometheus's model.
Push (agents report to collectors) needs no discovery, but backpressure lands on the agent, so the agent needs a buffer and a drop policy.
Pick one, build it, and be able to argue the other side. Pull is probably right here, for the same reason it's right for Prometheus: the failure of a scrape is itself signal.
Sharding
N collectors, M nodes. Each node's data belongs to exactly one collector.
Consistent hashing ring over collector identities, node maps to collector via the ring. Then a collector dies and the ring rebalances. During the rebalance window some nodes get scraped by two collectors and some by none. Double-scraping gives you duplicate samples with the same timestamp. No-scraping gives you a gap.
Which is worse? Neither is avoidable. Choose your failure mode deliberately: bias toward gaps (safe, visible) or toward duplicates (complete, needs dedup). Write it down.
This is the good distributed systems content and it's read-only, so when you get it wrong the consequence is a hole in a graph. That's the right stakes for learning this. In a job-runner version of the same bug, someone's job runs twice.
Staleness
Go finish the Phase 3 question. GET /fleet/pressure, and 3 of 40 nodes are silent. Your options:
Return the 37 nodes' worth of answers. Silent lie. Never do this.
Return the answer plus "incomplete": true, "missing_nodes": [...]. Honest, and now every client has to handle it.
Return 503. Honest and useless. One flaky node breaks the whole API.
Return the answer plus last-known values for the silent nodes, marked stale with a last_seen.
There's no right answer, which is why it's worth two hours of arguing about. But option 1 is wrong, and the reason it's wrong is that a monitoring system which under-reports during a partial outage fails exactly when it matters.
Clock skew
The agent stamps the sample. The collector stamps the receipt. They disagree, sometimes by seconds if NTP is unhappy.
Which timestamp goes into the timeseries? What happens to your rate calculation when a node's clock steps backward? Go's time.Time carries a monotonic reading alongside the wall clock: find out when it gets stripped (hint: serialisation) and what that costs you.
Watermarks
When is a 10-second window closed and safe to roll up? What do you do with a sample that arrives after you've closed it? Drop it and count the drops. Amending is a distributed transaction you don't want.
Deliverable: fleet query across N nodes, sharded collectors, honest staleness semantics, chaos-tested by deleting a collector pod mid-query.

Phase 5: Kubernetes (week 6)
cairn-agent as a DaemonSet. hostPath mount of /sys/fs/cgroup, read-only. That's it. No privileged, no hostPID, no capabilities.
This is the good version of the security conversation. Most "we need node access" projects end in a scramble to justify privilege. Cairn needs almost nothing: a read-only bind mount and a token that can get nodes/proxy. Write the threat model and enjoy how short it is. Then work out what an attacker gets if they compromise the agent. It isn't nothing (you can see every container's resource profile across the fleet, which is reconnaissance), but it's a very different conversation from hostPID: true.
The rest:
PodSecurity admission at restricted where you can. Find out exactly which constraint the hostPath mount violates and whether you can live in baseline.
RBAC: nodes/proxy for the kubelet API. Nothing else. Justify each verb.
Downward API for node identity. The agent needs to know which node it's on, and spec.nodeName via fieldRef is the clean way.
Collector: Deployment or StatefulSet? The ring needs stable identities. A StatefulSet gives you ordinal names for free. A Deployment plus a lease-based membership protocol is more work and more correct under scaling. Argue it.
PDBs, resource requests and limits. Your own agent has a memory limit. What happens when your fleet grows to 4,000 containers?
Readiness gates that actually mean "my shard is scraping."
Kustomize overlays for dev and prod.

Phase 6: GCP and the two-tier read path (weeks 6 to 7)
Everything in Terraform. No console clicks, ever.
GKE with Workload Identity. No key files at any point in this project.
GCS for rollups. 10-second samples aggregated to 1-minute parquet, written hourly. Lifecycle rules: Standard, Nearline at 30d, Coldline at 90d, delete at 1y. Watch the cost graph.
BigQuery external tables over the GCS parquet, partitioned by date, clustered by node.
The two-tier read path is the interesting part. ?since=15m is served from the collector's in-memory window. ?since=7d is served from BigQuery. The API decides which tier based on the time range.
Where's the boundary? If the memory window is 30 minutes and rollups land hourly, there's a gap where data has aged out of memory but hasn't reached GCS. Or there's an overlap where it's in both and they disagree, because one is raw samples and the other is a 1-minute rollup. Find your seam and handle it explicitly. A query that straddles the boundary has to union two sources at different resolutions. Does the response admit that?
Cost telemetry: track BigQuery bytes scanned per query. A ?since=90d fleet-wide query is expensive. Do you cap it, bill it, or just log it? Log it first. You can't make policy about a number you've never seen.

Phase 7: standing queries and Pub/Sub (weeks 7 to 8)
This is where the query framing earns its keep.
A standing query is the same predicate you already built, registered once and evaluated continuously. When the answer changes, emit an event. Same engine, two delivery modes: pull for humans, push for machines.
POST /standing
{
  "name": "memory-pressure",
  "predicate": "memory.working_set/memory.limit > 0.9",
  "dwell": "60s"
}

Every transition publishes to a Pub/Sub topic. Problems it brings with it:
Edge-triggered or level-triggered? Emit once when a container crosses 90%, or on every evaluation while it's above? Both are defensible, and they're different products. Edge is an alerting system. Level is a state stream. Pick, and know which one your subscriber wants.
Flapping. A container oscillating at 89.8 / 90.1 emits 400 events a minute and your topic becomes a fire hose. Fix it with hysteresis (separate high and low thresholds) or dwell time (must hold for 60s before firing). Implement it only after you've spammed the topic, because that's the only way the design pressure is real.
Dedup. At-least-once means the same crossing lands twice. Your natural idempotency key is (container_uid, predicate_id, transition_ts), which immediately raises the question of what a transition timestamp even is when your scrape interval is 10 seconds. You didn't observe the crossing. You observed one sample below and one above. The transition is an inference.
DLQ. A malformed event or a wedged subscriber must not block the topic. Configure it, then deliberately poison it.
A subscriber that does something visible. Post to Slack, write a Kubernetes Event, annotate a Grafana dashboard. The pipeline isn't done until a human sees output without reading logs.

Phase 8: CI/CD and GitOps (week 8)
GitHub Actions with OIDC to GCP. Zero long-lived secrets.
Build, go vet, race detector. Your collector has concurrent scrapes and a shared ring, so the race detector will find something. Integration tests against a kind cluster.
Push to Artifact Registry, digest-pinned.
ArgoCD reconciling from the repo. Then deliberately kubectl edit a Deployment in the cluster and watch Argo revert it. Do this once so you feel what level-triggered reconciliation means.
Stretch: Cosign signing plus a Kyverno policy that rejects unsigned images.

Phase 9: observability, recursively (weeks 9 to 10)
Cairn is a monitoring system, so you have to monitor the monitor. That makes this phase unusually good.
Instrument yourself: scrape lag per node, ring rebalance count, nodes-per-collector skew (are your shards balanced?), dropped samples, partial-sample rate, query latency by tier, standing-query evaluation lag.
The cardinality lesson is unavoidable here, because cardinality is literally your product. You'll want to label metrics with container_id. Do it. Watch Prometheus die. Then work out the rule: your data can be high-cardinality, that's the whole point, but your metrics about your data cannot.
Then the recursive one. Deploy Prometheus and cAdvisor alongside Cairn, scraping the same nodes. Compare your fleet numbers to theirs, container by container. Where you disagree, one of you is wrong. Finding out which is the best week of this assignment. Write up every discrepancy and its root cause.
SLOs: query latency p99 under 500ms for the memory tier, 95% of nodes reporting within 30s, standing-query detection lag under 90s from crossing to event. Burn-rate alerts on each.
Runbook: "Cairn says 12 nodes are stale." What do you check, in what order?

Phase 10: hardening and stretch (weeks 10 to 12)
Hardening:
NetworkPolicies. The agent talks to exactly one thing.
Load test with synthetic agents reporting 4,000 containers. Where does it break first? My bet is the query engine's fleet scan, not the ingest.
Chaos: kill collectors mid-rebalance, partition a node, step a node's clock forward 5 minutes, fill a node's disk.
Cost report: GCS storage, BigQuery scan, and the GKE overhead of the DaemonSet itself. What does Cairn cost per node per month? Is it worth it?
Stretch goals, in the order I'd recommend them:
MCP server over the query API. About 50 lines if the API is well-shaped. An agent can now ask your cluster things in English. It's defensible precisely because the work is API design, not prompting. The AI part is downstream of Phase 3 being right. If your query surface is good, this is trivial. If it's bad, this is impossible. Useful test.
Right-sizing recommendations. "This container requests 2 cores and has used p99 = 0.12 for 30 days." Probably the most valuable feature on the list, and it isn't AI, it's percentiles. Call it what it is. VPA does exactly this, so read its source. The interesting question is what confidence interval justifies a recommendation.
BQML forecasting. ML.FORECAST with ARIMA_PLUS over your rollup table is about four lines of SQL, with no model to build or serve. "This container hits its memory limit in about 4 hours." It's another predicate, evaluated over the future, so it fits the query framing. The interesting question isn't the model, it's whether you page someone on a prediction. What's your false-positive budget?
CRI socket instead of the kubelet API. More direct, runtime-coupled.
eBPF for per-container network stats. Big scope, arguably a different assignment.
Natural language to query DSL via an LLM. Demos well, teaches you nothing but prompt plumbing. Every platform team has built this and quietly deleted it. Do it in an afternoon in week 12 as a toy, and know that it's a toy.

Repo layout
cmd/
  cairn-agent/          # DaemonSet: reads cgroups, serves /vitals
  cairn-collector/      # sharded: scrapes agents, holds window
  cairn-api/            # query surface
internal/
  cgroup/               # v2 file reading + parsing
  discovery/            # cgroup path → k8s identity
  sample/               # identity, rates, reset detection
  query/                # predicate engine (the product)
  ring/                 # consistent hashing, membership
  window/               # in-memory recent store
  archive/              # GCS parquet + BigQuery reads
  standing/             # standing queries + Pub/Sub emit
  telemetry/            # metrics, traces
deploy/
  base/
  overlays/{dev,prod}/
terraform/
docs/
  adr/
  runbook.md

cgroup, discovery, and sample are the three packages we'll review line by line. Everything else is normal Go.

Questions to sit with
Not a quiz. These are the things that should make you stop.
Your container's memory.current is at 95% of memory.max. Is it about to be OOM-killed? How do you know? What does kubectl top say, and which of you is lying?
A container's CPU usage reads 12% and its p99 latency is 800ms. Explain how both are true.
Two collectors both scraped node-7 during a rebalance and produced samples with the same timestamp and different values. Which one is right?
GET /fleet/pressure returns 4 containers. Three nodes are silent. Is the answer 4, or is the answer wrong?
A pod restarts. Same name, new container ID, counters reset to zero. Is your rate graph showing a hole or a spike? Which did you choose, and why is the other one defensible?
A node's clock steps forward 5 minutes during an NTP correction. What happens to every rate you computed in that window?
Your standing query fires at 09:00:00 for a container that crossed 90% "at" 08:59:55. You never observed the crossing. You saw 88% at 08:59:50 and 92% at 09:00:00. What time goes in the event, and what does the subscriber assume it means?
Your agent has a 128Mi memory limit. Your fleet grows from 400 to 4,000 containers. What breaks first, and did you find out from your own monitoring or from a page?
Someone asks ?since=90d across the whole fleet. What does that cost, and who pays?
An attacker compromises cairn-agent. Walk me through exactly what they can do now. Is that acceptable?

Reading
cgroup v2 kernel docs, Documentation/admin-guide/cgroup-v2.rst. Dry and authoritative. The memory section is worth reading end to end.
cAdvisor source, specifically container/libcontainer/handler.go for the working-set computation and container/common/helpers.go. Read it after Phase 0, not before.
Prometheus rate(), the extrapolation logic in promql/functions.go. Read after Phase 2.
Kleppmann, "How to do distributed locking." For the Phase 4 ring, even though Cairn is read-only.
VPA recommender source. Before attempting stretch goal 2.





this is for next 10 weeks