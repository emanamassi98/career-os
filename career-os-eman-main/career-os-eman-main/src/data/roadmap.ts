import type { RoadmapItem } from '@/types';

export const roadmapItems: RoadmapItem[] = [
  // Phase 0: The naive agent, and the lie
  {
    id: 'rm-1',
    phase: 0,
    phaseName: 'The Naive Agent',
    title: 'The Naive Agent',
    slug: 'the-naive-agent',
    description: 'Read cgroup v2 files directly, return JSON on /vitals. Confront the gap between "it works locally" and "it works fleet-wide."',
    status: 'not_started',
    skillIds: ['go', 'cgroup-v2', 'syscalls'],
    resources: [
      { title: 'cgroup v2 Kernel Docs', url: 'https://docs.admin-guide/admin-guide/cgroup-v2.rst', type: 'docs' },
      { title: 'Go net/http Server Tutorial', url: 'https://go.dev/doc/articles/wiki/', type: 'docs' },
      { title: 'Red Hat: Introduction to cgroups', url: 'https://www.redhat.com/en/blog/linux-cgroups-part-1', type: 'article' },
    ],
    evidenceIds: [],
    notes: '',
    order: 0,
  },

  // Phase 1: The mapping problem
  {
    id: 'rm-2',
    phase: 1,
    phaseName: 'Container Discovery',
    title: 'Container Discovery',
    slug: 'container-discovery',
    description: 'Map cgroup filesystem paths to Kubernetes identities (pod, namespace, container) via the kubelet.',
    status: 'not_started',
    skillIds: ['cgroup-v2', 'containerd', 'k8s-api'],
    resources: [
      { title: 'containerd Runtime Docs', url: 'https://containerd.io/', type: 'docs' },
      { title: 'Kubernetes Pod Lifecycle', url: 'https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/', type: 'docs' },
    ],
    evidenceIds: [],
    notes: '',
    order: 1,
  },

  // Phase 2: Counters, rates, and things that vanish
  {
    id: 'rm-3',
    phase: 2,
    phaseName: 'Counter Rates & Reset Detection',
    title: 'Counter Rates & Reset Detection',
    slug: 'counter-rates-reset-detection',
    description: 'Compute rates from monotonically increasing counters, detect resets and wraps, and apply Prometheus-style extrapolation at boundaries.',
    status: 'not_started',
    skillIds: ['rate-computation', 'concurrency', 'go'],
    resources: [
      { title: 'Prometheus: How NOT to Instrument', url: 'https://prometheus.io/docs/practices/instrumentation/#counter-vs-gauge-vs-histogram', type: 'article' },
      { title: 'Google SRE Book: Monitoring', url: 'https://sre.google/sre-book/monitoring-distributed-systems/', type: 'article' },
    ],
    evidenceIds: [],
    notes: '',
    order: 2,
  },

  // Phase 3: The query engine
  {
    id: 'rm-4',
    phase: 3,
    phaseName: 'Query Engine',
    title: 'Query Engine',
    slug: 'query-engine',
    description: 'Design and implement the /fleet/pressure, /fleet/throttled, and /fleet/query API surfaces for fleet-wide resource pressure queries.',
    status: 'not_started',
    skillIds: ['go', 'rest-apis', 'rate-computation'],
    resources: [
      { title: 'Go net/http/json Guide', url: 'https://go.dev/doc/articles/wiki/', type: 'docs' },
      { title: 'Google SRE Book: Monitoring', url: 'https://sre.google/sre-book/monitoring-distributed-systems/', type: 'article' },
    ],
    evidenceIds: [],
    notes: '',
    order: 3,
  },

  // Phase 4: Fan-in
  {
    id: 'rm-5',
    phase: 4,
    phaseName: 'Fleet Fan-In',
    title: 'Fleet Fan-In',
    slug: 'fleet-fan-in',
    description: 'Collect metrics from multiple nodes using a consistent hashing ring. Handle sharding, staleness, and clock skew across the fleet.',
    status: 'not_started',
    skillIds: ['consistent-hashing', 'clock-skew', 'staleness', 'concurrency'],
    resources: [
      { title: 'Consistent Hashing - Akamai', url: 'https://www.akamai.com/blog/generative-ai/consistent-hashing-algorithm', type: 'article' },
      { title: 'Kubernetes: Time Skew', url: 'https://kubernetes.io/docs/concepts/workloads/pods/pod-qos/', type: 'docs' },
    ],
    evidenceIds: [],
    notes: '',
    order: 4,
  },

  // Phase 5: Kubernetes
  {
    id: 'rm-6',
    phase: 5,
    phaseName: 'Kubernetes Deployment',
    title: 'Kubernetes Deployment',
    slug: 'kubernetes-deployment',
    description: 'Deploy Cairn as a DaemonSet with hostPath mounts, RBAC, PodSecurity policies, PDBs, and Kustomize overlays.',
    status: 'not_started',
    skillIds: ['daemonset', 'rbac', 'pod-security', 'pdb', 'kustomize'],
    resources: [
      { title: 'Kubernetes DaemonSet Docs', url: 'https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/', type: 'docs' },
      { title: 'Kustomize Docs', url: 'https://kustomize.io/', type: 'docs' },
      { title: 'Pod Security Standards', url: 'https://kubernetes.io/docs/concepts/security/pod-security-standards/', type: 'docs' },
    ],
    evidenceIds: [],
    notes: '',
    order: 5,
  },

  // Phase 6: GCP and the two-tier read path
  {
    id: 'rm-7',
    phase: 6,
    phaseName: 'GCP & Two-Tier Reads',
    title: 'GCP & Two-Tier Reads',
    slug: 'gcp-two-tier-reads',
    description: 'Terraform a GKE cluster, export cgroup snapshots to GCS as Parquet, and expose a BigQuery external table for the cold read path.',
    status: 'not_started',
    skillIds: ['terraform', 'gke', 'gcs', 'bigquery', 'workload-identity'],
    resources: [
      { title: 'Terraform GKE Docs', url: 'https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/container_cluster', type: 'docs' },
      { title: 'BigQuery External Tables', url: 'https://cloud.google.com/bigquery/docs/external-data-sources', type: 'docs' },
      { title: 'GCS Parquet', url: 'https://cloud.google.com/storage/docs/parquet', type: 'docs' },
    ],
    evidenceIds: [],
    notes: '',
    order: 6,
  },

  // Phase 7: Standing queries and Pub/Sub
  {
    id: 'rm-8',
    phase: 7,
    phaseName: 'Standing Queries & Pub/Sub',
    title: 'Standing Queries & Pub/Sub',
    slug: 'standing-queries-pubsub',
    description: 'Implement standing queries with edge vs level triggers, handle flapping and hysteresis, and dead-letter queues for alerting reliability.',
    status: 'not_started',
    skillIds: ['pubsub', 'go', 'concurrency'],
    resources: [
      { title: 'Google Pub/Sub Docs', url: 'https://cloud.google.com/pubsub/docs', type: 'docs' },
      { title: 'Edge vs Level Triggered - IT Next', url: 'https://www.itnext.io/kubernetes-level-trigger-vs-edge-trigger-cd33e5e98ee', type: 'article' },
    ],
    evidenceIds: [],
    notes: '',
    order: 7,
  },

  // Phase 8: CI/CD and GitOps
  {
    id: 'rm-9',
    phase: 8,
    phaseName: 'CI/CD & GitOps',
    title: 'CI/CD & GitOps',
    slug: 'cicd-gitops',
    description: 'GitHub Actions with OIDC, ArgoCD for GitOps delivery, Cosign for image signing, and Kyverno for admission control.',
    status: 'not_started',
    skillIds: ['github-actions', 'argocd', 'cosign', 'gitops'],
    resources: [
      { title: 'GitHub Actions OIDC', url: 'https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect', type: 'docs' },
      { title: 'ArgoCD Docs', url: 'https://argo-cd.readthedocs.io/en/stable/', type: 'docs' },
      { title: 'Cosign Docs', url: 'https://docs.sigstore.dev/cosign/overview/', type: 'docs' },
      { title: 'Kyverno Docs', url: 'https://kyverno.io/docs/', type: 'docs' },
    ],
    evidenceIds: [],
    notes: '',
    order: 8,
  },

  // Phase 9: Observability, recursively
  {
    id: 'rm-10',
    phase: 9,
    phaseName: 'Recursive Observability',
    title: 'Recursive Observability',
    slug: 'recursive-observability',
    description: 'Instrument Cairn itself: expose /metrics, define SLOs with burn-rate alerts, and write a runbook for on-call.',
    status: 'not_started',
    skillIds: ['monitoring', 'slos', 'alerting', 'logging'],
    resources: [
      { title: 'Prometheus Best Practices', url: 'https://prometheus.io/docs/practices/', type: 'docs' },
      { title: 'Google SRE Workbook: SLOs', url: 'https://sre.google/workbook/implementing-slos/', type: 'article' },
    ],
    evidenceIds: [],
    notes: '',
    order: 9,
  },

  // Phase 10: Hardening and stretch
  {
    id: 'rm-11',
    phase: 10,
    phaseName: 'Hardening & Stretch Goals',
    title: 'Hardening & Stretch Goals',
    slug: 'hardening-stretch-goals',
    description: 'NetworkPolicies, load testing, chaos experiments, cost reporting, an MCP server for Cairn data, right-sizing, and BQML forecasting.',
    status: 'not_started',
    skillIds: ['network-policy', 'load-testing', 'chaos', 'mcp', 'bqml'],
    resources: [
      { title: 'Kubernetes Network Policies', url: 'https://kubernetes.io/docs/concepts/services-networking/network-policies/', type: 'docs' },
      { title: 'Chaos Mesh Docs', url: 'https://chaos-mesh.org/docs/', type: 'docs' },
      { title: 'BQML Guide', url: 'https://cloud.google.com/bigquery/docs/bqml-introduction', type: 'docs' },
    ],
    evidenceIds: [],
    notes: '',
    order: 10,
  },
];

export function getRoadmapByPhase(phase: number): RoadmapItem[] {
  return roadmapItems.filter(item => item.phase === phase).sort((a, b) => a.order - b.order);
}

export function getPhaseName(phase: number): string {
  const item = roadmapItems.find(i => i.phase === phase);
  return item?.phaseName ?? `Phase ${phase}`;
}
