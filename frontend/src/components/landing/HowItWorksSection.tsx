export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-card border-y border-border py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-12">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full gradient-primary text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="text-xl font-semibold mb-2">Describe Your Test</h3>
            <p className="text-muted-foreground">
              Tell us what you want to test in natural language
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full gradient-primary text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Generates Tests</h3>
            <p className="text-muted-foreground">
              Our AI creates comprehensive test scenarios automatically
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full gradient-primary text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="text-xl font-semibold mb-2">Review Results</h3>
            <p className="text-muted-foreground">
              Get detailed reports with screenshots and logs
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}