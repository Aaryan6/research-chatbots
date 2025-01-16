import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="container relative pt-32 pb-20">
        <div className="text-center">
          <Badge className="mb-6 rounded-full bg-blue-50 px-4 py-1 text-blue-600 hover:bg-blue-50">
            INTRODUCING A NEW INSURANCE EXPERIENCE
          </Badge>
          <h1 className="mb-6 text-center text-5xl font-medium tracking-tight md:text-6xl lg:text-7xl">
            Your Trusted{" "}
            <span className="font-serif italic text-blue-600">
              Insurance Partner
            </span>
            <br />
            Secure{" "}
            <span className="font-serif italic text-blue-600">
              Peace of Mind
            </span>
          </h1>
          <p className="mx-auto mb-12 max-w-[600px] text-lg text-muted-foreground">
            Experience the next generation of insurance protection. Our secure
            and intuitive platform makes protecting your assets simple and
            stress-free.
          </p>
          <div className="flex justify-center gap-4">
            <Button
              size="lg"
              className="rounded-full bg-gray-900 px-8 hover:bg-gray-800"
            >
              START PROTECTING
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8">
              LEARN MORE
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
