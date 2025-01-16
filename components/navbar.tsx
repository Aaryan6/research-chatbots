import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="absolute top-0 left-0 right-0 z-50 px-4">
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold">
            Bony Insurance
          </Link>
          <div className="hidden gap-8 md:flex">
            <Link href="/" className="text-sm font-medium hover:text-primary">
              Home
            </Link>
            <Link
              href="/coverage"
              className="text-sm font-medium hover:text-primary"
            >
              Coverage
            </Link>
            <Link
              href="/claims"
              className="text-sm font-medium hover:text-primary"
            >
              Claims
            </Link>
            <Link
              href="/resources"
              className="text-sm font-medium hover:text-primary"
            >
              Resources
            </Link>
          </div>
        </div>
        <Button variant="outline" className="rounded-full px-6">
          Book A Call
        </Button>
      </div>
    </nav>
  );
}
