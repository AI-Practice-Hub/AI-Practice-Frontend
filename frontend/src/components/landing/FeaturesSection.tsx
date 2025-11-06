import { MessageSquare, Zap, Globe, CheckCircle } from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Natural Language Testing",
    description: "Write test cases in plain English. No complex syntax or programming required."
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Automated test execution powered by AI. Get results in minutes, not hours."
  },
  {
    icon: Globe,
    title: "Multi-Language Support",
    description: "Test in any language. Our AI understands your instructions perfectly."
  },
  {
    icon: CheckCircle,
    title: "Detailed Reports",
    description: "Comprehensive test reports with screenshots, logs, and actionable insights."
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="container mx-auto px-6 py-20">
      <h2 className="text-4xl font-bold text-center mb-12">
        Why Choose Chat2Text?
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature) => (
          <div key={feature.title} className="p-6 shadow-card hover:shadow-elegant transition-smooth border border-border rounded-lg">
            <feature.icon className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}