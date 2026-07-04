import { createProductionAction } from "@/lib/actions/production";

export function CreateProductionButton({ orderId }: { orderId: string }) {
  const action = createProductionAction.bind(null, orderId);
  return (
    <form action={action}>
      <button
        type="submit"
        className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
      >
        Start production tracking
      </button>
    </form>
  );
}