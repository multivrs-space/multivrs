export default function NewProjectLoading() {
  return (
    <main className="min-h-svh bg-background pt-16 text-foreground" aria-busy>
      <div className="mx-auto max-w-5xl animate-pulse px-6 py-10">
        <div className="h-3 w-28 rounded-sm bg-purple-400/15" />
        <div className="mt-3 h-11 w-96 max-w-full rounded-xl bg-foreground/8" />
        <div className="mt-4 h-4 max-w-xl rounded-sm bg-foreground/4" />
        <section className="mt-8 rounded-2xl border border-border bg-foreground/2 p-6">
          <div className="flex gap-3">
            <div className="h-10 flex-1 rounded-lg bg-white/6" />
            <div className="h-10 w-28 rounded-lg bg-muted" />
          </div>
          <div className="my-6 h-px bg-foreground/8" />
          <div className="h-9 rounded-lg bg-foreground/5" />
          <div className="mt-4 space-y-px overflow-hidden rounded-xl border border-border">
            {["one", "two", "three", "four", "five"].map((item) => (
              <div className="h-16 bg-foreground/3" key={item} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
