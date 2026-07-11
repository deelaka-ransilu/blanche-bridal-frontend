import { PublicNav } from "@/components/public-nav";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <main className="mx-auto max-w-3xl px-6 pb-24 pt-32 text-center">
        <h1 className="font-heading text-3xl font-medium leading-tight text-foreground sm:text-4xl">
          Our story
        </h1>
        <p className="mt-5 text-base text-muted-foreground sm:text-lg">
          Blanche Bridal was founded on a simple belief: every bride deserves
          a gown made just for her. Not altered to fit — designed and
          crafted from the first measurement to the final stitch, around
          your body, your style, and your day.
        </p>

        <div className="mt-16 grid grid-cols-1 gap-8 text-left sm:grid-cols-4">
          <div>
            <p className="font-heading mb-2 text-sm font-medium text-primary">01</p>
            <p className="text-sm font-medium text-foreground">Consultation</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Share your vision, we help shape it into a design.
            </p>
          </div>
          <div>
            <p className="font-heading mb-2 text-sm font-medium text-primary">02</p>
            <p className="text-sm font-medium text-foreground">Measurements</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Precise fitting details taken to build your pattern.
            </p>
          </div>
          <div>
            <p className="font-heading mb-2 text-sm font-medium text-primary">03</p>
            <p className="text-sm font-medium text-foreground">Craftsmanship</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Your gown is made by hand, stage by stage.
            </p>
          </div>
          <div>
            <p className="font-heading mb-2 text-sm font-medium text-primary">04</p>
            <p className="text-sm font-medium text-foreground">Fitting day</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Final adjustments, then it's ready for your day.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}