import { JobsMap } from "@/components/jobs-map/JobsMap";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-4 p-4 lg:h-screen">
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h1 className="font-heading text-2xl font-medium text-foreground">
          Carte des postes en France
        </h1>
        <div className="flex items-baseline gap-1.5">
          <span className="font-heading text-lg font-medium tracking-tight text-foreground">
            Diamond
          </span>
          <span className="font-heading text-lg font-light italic tracking-tight text-brand">
            Careers
          </span>
        </div>
      </header>
      <div className="min-h-0 flex-1">
        <JobsMap />
      </div>
    </main>
  );
}
