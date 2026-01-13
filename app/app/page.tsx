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
            <Link href="https://github.com" target="_blank">
              <Github className="mr-2 h-4 w-4" /> View Source
            </Link>
          </Button>
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

      {/* Architecture Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold tracking-tight">
          System Architecture
        </h2>
        <p className="mt-2 text-muted-foreground">
          An overview of how the different components work together
        </p>

        {/* Image Placeholder */}
        <div className="mt-8 max-w-4xl">
          <div className="flex aspect-video items-center justify-center rounded-lg border border-dashed border-muted-foreground/25 bg-muted/30">
            <div className="text-center px-4">
              <Server className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-4 text-sm text-muted-foreground">
                Architecture diagram placeholder
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Add your system architecture image here
              </p>
            </div>
          </div>
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
