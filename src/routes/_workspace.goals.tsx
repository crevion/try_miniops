import { createFileRoute } from "@tanstack/react-router";
import { GoalsPage } from "@/features/preview/goals";
export const Route = createFileRoute("/_workspace/goals")({
  head: () => ({ meta: [{ title: "Goals — MiniOps" }] }),
  component: GoalsPage,
});
