import type { TopicVideo } from '@/components/VideoCard';

const videos: Record<string, TopicVideo[]> = {
  'the-naive-agent': [
    { youtubeId: '4Z4RQAVAVTc', title: 'What is cgroup? (Linux Control Groups)', channel: 'The Linux Channel', duration: '12:30' },
    { youtubeId: 'mHTM2q7XaVs', title: 'Go HTTP Servers in 20 Minutes', channel: 'ThePrimeagen', duration: '21:04' },
    { youtubeId: 'neg_29QOAvE', title: 'Why cAdvisor exists', channel: 'Google Open Source', duration: '8:45' },
  ],
  'container-discovery': [
    { youtubeId: 'R3qJplbL9tM', title: 'Kubernetes CRI & the container runtime', channel: 'TechWorld with Nana', duration: '15:22' },
    { youtubeId: 'oF1PSK_Pb0A', title: 'cgroups, namespaces, and containers explained', channel: 'LiveOverflow', duration: '17:10' },
  ],
  'counter-rates-reset-detection': [
    { youtubeId: 'VQNM_aYFZ6k', title: 'Prometheus Counters, Gauges & Histograms', channel: 'Julien Pivotto', duration: '25:11' },
    { youtubeId: 'h4Sl21AKiSg', title: 'Understanding Prometheus rate()', channel: 'Prometheus Workshop', duration: '18:33' },
  ],
  'query-engine': [
    { youtubeId: 'WjGxwWOfyPQ', title: 'Designing a query API for metrics', channel: 'Grafana Lab', duration: '22:00' },
  ],
  'fleet-fan-in': [
    { youtubeId: 'jIaS8nX1Y7I', title: 'Consistent hashing explained', channel: 'ByteByteGo', duration: '10:45' },
    { youtubeId: 'a-P-OsG8n0A', title: 'Clock skew and NTP in distributed systems', channel: 'Google SRE', duration: '14:20' },
  ],
  'kubernetes-deployment': [
    { youtubeId: 'Hl7qG3PmGm0', title: 'Kubernetes DaemonSets in Action', channel: 'Kubernetes Community', duration: '19:12' },
    { youtubeId: 'Kx8bcidN5g0', title: 'RBAC: least privilege on Kubernetes', channel: 'KodeKloud', duration: '23:05' },
  ],
  'gcp-two-tier-reads': [
    { youtubeId: 'PryWdei-1c8', title: 'GKE + Workload Identity — keyless auth', channel: 'Google Cloud Tech', duration: '16:40' },
    { youtubeId: 'XThUsfFaN4o', title: 'BigQuery: external tables & cost control', channel: 'Google Cloud Tech', duration: '20:55' },
  ],
  'standing-queries-pubsub': [
    { youtubeId: 'NWqECiefvVA', title: 'Manager: event-driven alerts with dwelling', channel: 'SRE Live', duration: '12:18' },
  ],
  'cicd-gitops': [
    { youtubeId: 'rM_VNhNRPtM', title: 'GitHub Actions OIDC to cloud providers', channel: 'GitHub', duration: '13:47' },
    { youtubeId: 'MeU5_h9HnFg', title: 'ArgoCD — GitOps without the hype', channel: 'DevOps Toolkit', duration: '28:15' },
  ],
  'recursive-observability': [
    { youtubeId: 'MX-RCJZcTvI', title: 'SLIs, SLOs and burn rates', channel: 'Google SRE Book', duration: '21:30' },
    { youtubeId: '1KG3-PcksHk', title: 'Monitoring the monitor', channel: 'The Phoenix Project', duration: '16:02' },
  ],
  'hardening-stretch-goals': [
    { youtubeId: 'YLTF1-BUPVc', title: 'Network Policies: locking down the cluster', channel: 'Kubernetes Academy', duration: '18:26' },
    { youtubeId: 'Itb2yfYzkRw', title: 'Chaos Engineering with Chaos Mesh', channel: 'Chaos Mesh', duration: '14:58' },
  ],
};

export function getVideosForSlug(slug: string): TopicVideo[] {
  return videos[slug] ?? [];
}