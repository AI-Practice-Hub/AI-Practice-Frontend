import Link from "next/link";

export function CTASection() {
  return (
    <section className="container mx-auto px-6 py-20 text-center">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl font-bold mb-6">
          Ready to Automate Your Testing?
        </h2>
        <p className="text-xl text-muted-foreground mb-8">
          Join thousands of developers who trust TestSamurAI for their testing needs.
        </p>
        <Link
          href="/signup"
          className="gradient-primary text-white px-8 py-4 rounded-lg shadow-elegant hover:shadow-glow transition-smooth text-lg"
        >
          Get Started for Free
        </Link>
      </div>
    </section>
  );
}