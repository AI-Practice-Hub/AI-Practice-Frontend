import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function HeroSection() {
  return (
    <section className="container mx-auto px-6 py-20 text-center">
      <div className="max-w-4xl mx-auto">
        <h1
          className="text-5xl md:text-6xl font-bold mb-6"
          style={{
            background: 'linear-gradient(135deg, hsl(211 100% 43%), hsl(199 89% 48%))',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent'
          }}
        >
          Test Your Web Apps Automatically,
          <br />
          In Your Own Language
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Chat2Text uses AI to understand your testing requirements in natural language
          and automatically generates comprehensive test suites for your web applications.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/chat">
              Start Testing Now
            </Link>
          </Button>
          <Button variant="outline" size="lg">
            Watch Demo
          </Button>
        </div>
      </div>
    </section>
  );
}