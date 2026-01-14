import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Server, Terminal, Rocket, ArrowRight, Github } from "lucide-react"
import Image from "next/image"

const steps = [
  {
    step: 1,
    title: "Provision Instance",
    description:
      "Spin up a compute instance with your desired specs. The system handles all the infrastructure provisioning behind the scenes.",
    icon: Server
  },
  {
    step: 2,
    title: "SSH Access",
    description:
      "Get SSH access to your instance. Keys are generated and managed automatically for secure connections.",
    icon: Terminal
  },
  {
    step: 3,
    title: "Deploy",
    description:
      "Run your applications, containers, or any workload. Full root access means you're in complete control.",
    icon: Rocket
  }
]

function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <Badge variant="outline" className="mb-6">
          Personal Project
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          CaaS — Compute as a Service
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          A cloud platform I built to learn about infrastructure, container
          orchestration, and building developer tools. Users can provision
          compute instances, SSH in, and deploy their applications.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Button size="lg" asChild>
            <Link href="/auth/login">
              Try the Demo <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link
              href="https://github.com/anisharaz/centralresume"
              target="_blank"
            >
              <Github className="mr-2 h-4 w-4" /> View Source
            </Link>
          </Button>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold tracking-tight">
          System Architecture
        </h2>
        <p className="mt-2 text-muted-foreground">
          An overview of how the different components work together
        </p>

        {/* Architecture Image */}
        <div className="mt-8 w-full max-w-6xl mx-auto">
          <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-b from-muted/50 to-muted/20 p-2 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:border-border">
            <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden">
              <Image
                src={"/arch.png"}
                alt="System Architecture Diagram"
                fill
                className="object-contain"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1152px"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold tracking-tight">How It Works</h2>
        <p className="mt-2 text-muted-foreground">
          The platform follows a simple three-step workflow
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {steps.map((item) => (
            <Card key={item.step} className="relative border-muted">
              <CardHeader className="pb-2">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                  <item.icon className="h-5 w-5 text-foreground" />
                </div>
                <CardTitle className="text-lg font-medium">
                  <span className="text-muted-foreground mr-2">
                    {item.step}.
                  </span>
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{item.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Tech Stack / About Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold tracking-tight">Built With</h2>
        <p className="mt-2 text-muted-foreground">
          Technologies and services powering this project
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {[
            "Next.js",
            "AWS Lambda",
            "AWS SQS",
            "TypeScript",
            "Prisma",
            "Incus",
            "Tailwind CSS"
          ].map((tech) => (
            <Badge key={tech} variant="secondary" className="text-sm">
              {tech}
            </Badge>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-8">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>Built by Anish</p>
          <div className="flex gap-4">
            <Link
              href="https://github.com"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </Link>
          </div>
        </div>
      </footer>
    </main>
  )
}

export default Home
