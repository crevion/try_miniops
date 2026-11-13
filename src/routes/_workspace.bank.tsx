import { createFileRoute } from "@tanstack/react-router";
import { BankPage } from "@/features/preview/bank";
export const Route = createFileRoute("/_workspace/bank")({
  head: () => ({ meta: [{ title: "Bank & statements — MiniOps" }] }),
  component: BankPage,
});
