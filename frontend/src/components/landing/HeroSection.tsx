import Link from "next/link";

export function HeroSection() {
  return (
    <section className="container mx-auto px-6 py-20 text-center">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Test Your Web Apps Automatically,
          <br />
          In Your Own Language
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Chat2Text uses AI to understand your testing requirements in natural language
          and automatically generates comprehensive test suites for your web applications.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/chat"
            className="gradient-primary text-white px-8 py-4 rounded-lg shadow-elegant hover:shadow-glow transition-smooth text-lg"
          >
            Start Testing Now
          </Link>
          <button className="text-lg px-8 py-4 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-smooth">
            Watch Demo
          </button>
        </div>
      </div>
    </section>
  );
}