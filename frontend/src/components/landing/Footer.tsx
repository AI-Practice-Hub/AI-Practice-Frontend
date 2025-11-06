   export function Footer() {
  return (
    <footer className="border-t border-border py-8">
      <div className="container mx-auto px-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Chat2Text. All rights reserved.</p>
      </div>
    </footer>
  );
}