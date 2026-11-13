import { createFileRoute } from "@tanstack/react-router";
import { SubscriptionsPage } from "@/features/preview/subscriptions";
export const Route = createFileRoute("/_workspace/subscriptions")({
  head: () => ({ meta: [{ title: "Subscriptions & bills — MiniOps" }] }),
  component: SubscriptionsPage,
});
