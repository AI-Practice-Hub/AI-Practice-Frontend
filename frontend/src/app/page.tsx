
"use client";

import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import {
  Navbar,
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  CTASection,
  Footer
} from '@/components/landing';

export default function Home() {
  const { theme, setTheme, systemTheme } = useTheme();

  useEffect(() => {
    // Store the current theme
    const currentTheme = theme === 'system' ? systemTheme : theme;

    // Force light theme for landing page
    setTheme('light');

    // Restore the original theme when component unmounts
    return () => {
      setTheme(currentTheme || 'dark');
    };
  }, [theme, systemTheme, setTheme]);

  return (
    <div className="min-h-screen gradient-subtle">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </div>
  );
}
