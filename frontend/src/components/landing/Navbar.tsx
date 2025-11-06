import Link from "next/link";

export function Navbar() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <span className="text-white font-bold text-xl">C2T</span>
          </div>
          <span className="text-foreground font-bold text-2xl">Chat2Text</span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-smooth">Features</a>
          <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-smooth">How It Works</a>
          <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-smooth">Pricing</a>
        </nav>

        <div className="flex gap-4">
          <Link href="/login" className="text-muted-foreground hover:text-foreground transition-smooth">
            Login
          </Link>
          <Link
            href="/signup"
            className="gradient-primary text-white px-4 py-2 rounded-md shadow-elegant hover:shadow-glow transition-smooth"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}