import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@repo/ui";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-2xl font-semibold tracking-tight text-primary">Page not found</h1>
      <p className="text-sm text-secondary">
        The front group or ad you requested does not exist in the current dataset.
      </p>
      <Button asChild variant="outline" size="sm">
        <Link href="/">
          <ArrowLeft className="h-3.5 w-3.5" />
          Return home
        </Link>
      </Button>
    </main>
  );
}
