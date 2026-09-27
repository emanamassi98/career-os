import { GitBranch, Mail } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div className="space-y-3">
        <div className="font-mono text-sm text-muted-foreground">// get in touch</div>
        <h1 className="text-2xl font-bold">Contact</h1>
        <p className="text-sm text-muted-foreground">
          The fastest ways to reach Eman — for the Cairn project, the career-os-eman repo, or opportunities in software infrastructure.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <a
          href="mailto:wamda1998a@gmail.com"
          className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-accent"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" /> Email
          </div>
          <div className="mt-2 font-mono text-sm text-primary">wamda1998a@gmail.com</div>
          <div className="mt-1 text-xs text-muted-foreground">Best for direct, specific questions.</div>
        </a>

        <a
          href="https://github.com/emanamassi"
          target="_blank"
          rel="noopener noreferrer"
          className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-accent"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <GitBranch className="h-4 w-4" /> GitHub
          </div>
          <div className="mt-2 font-mono text-sm text-primary">github.com/emanamassi</div>
          <div className="mt-1 text-xs text-muted-foreground">Work, ADRs, and the Cairn project behind this site.</div>
        </a>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-sm font-medium">What the GitHub repo contains</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
          <li>The <span className="font-mono text-foreground">career-os-eman</span> site (this source) — React + TypeScript + Vite.</li>
          <li>The <span className="font-mono text-foreground">Cairn</span> assignment repo — cairn-agent, cairn-collector, cairn-api, ADRs, and deploy manifests.</li>
          <li>Every phase submitted as a separate pull request, per the assignment guidelines.</li>
        </ul>
        <a
          href="https://github.com/emanamassi/career-os-eman"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
        >
          <GitBranch className="h-4 w-4" /> Open the repository
        </a>
      </div>
    </div>
  );
}