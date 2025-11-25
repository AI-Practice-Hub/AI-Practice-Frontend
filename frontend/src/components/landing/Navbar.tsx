import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function Navbar() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <span className="text-white font-bold text-xl">C2T</span>
          </div>
          <span className="text-foreground font-bold text-2xl">TestSamurAI</span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-smooth">Features</a>
          <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-smooth">How It Works</a>
          <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-smooth">Pricing</a>
        </nav>

        <div className="flex gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}