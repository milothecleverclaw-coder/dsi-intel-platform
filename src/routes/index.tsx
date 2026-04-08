import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-3xl space-y-6 text-center">
        <h1 className="text-4xl font-bold text-foreground">ประจักษ์ AI</h1>
        <p className="text-lg text-muted-foreground">Department of Special Investigation</p>
        <p className="mx-auto max-w-xl text-muted-foreground">
          AI-powered case management, report generation, and intelligence analysis.
        </p>
      </div>

      <div className="mt-12 grid w-full max-w-3xl grid-cols-1 gap-6 md:grid-cols-3">
        {[
          {
            emoji: "💬",
            title: "AI Chat",
            desc: "Interact with case data using natural language queries",
          },
          {
            emoji: "📁",
            title: "Case Management",
            desc: "Track and manage investigation cases end-to-end",
          },
          {
            emoji: "📋",
            title: "Report Builder",
            desc: "Auto-generate Thai police report forms (ตร.1, ตร.2, ส.ป.อ.)",
          },
        ].map((card) => (
          <div key={card.title} className="space-y-3 rounded-lg border bg-card p-6 text-center">
            <div className="text-3xl">{card.emoji}</div>
            <h3 className="font-semibold text-foreground">{card.title}</h3>
            <p className="text-sm text-muted-foreground">{card.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <Link
          to="/app"
          className="inline-block rounded-lg bg-primary px-6 py-2 text-primary-foreground transition-colors hover:bg-primary/80"
        >
          Go to App
        </Link>
      </div>
    </div>
  );
}
