import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@repo/ui";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-4">
      <Card className="w-full border-none bg-white/95 shadow-sm">
        <CardHeader>
          <CardTitle>That page could not be found.</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4 pt-0">
          <p className="text-sm text-secondary">
            The front group or ad you requested does not exist in the current dataset.
          </p>
          <Button asChild>
            <Link href="/">Return home</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
