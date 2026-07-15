export function ComingSoon({ title }: { title: string }) {
  return (
    <div>
      <h1 className="font-heading mb-2 text-xl font-medium text-foreground">{title}</h1>
      <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-dashed border-border">
        <p className="text-sm text-muted-foreground">Coming soon</p>
      </div>
    </div>
  );
}