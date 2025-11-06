import React from 'react';

interface AuthFormProps {
  title: string;
  onSubmit: (e: React.FormEvent) => void;
  error?: string;
  loading?: boolean;
  children: React.ReactNode;
  footerText: string;
  footerLink: {
    text: string;
    href: string;
  };
}

export function AuthForm({
  title,
  onSubmit,
  error,
  loading,
  children,
  footerText,
  footerLink,
}: AuthFormProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-card rounded-xl shadow-card p-8 flex flex-col gap-6 border"
      >
        <h2 className="text-2xl font-bold text-center text-primary">
          {title}
        </h2>
        
        {children}
        
        {error && (
          <div className="text-destructive text-sm text-center bg-destructive/10 p-3 rounded-md border border-destructive/20">
            {error}
          </div>
        )}
        
        <div className="text-center text-sm text-muted-foreground">
          {footerText}{' '}
          <a
            href={footerLink.href}
            className="text-primary hover:underline font-medium"
          >
            {footerLink.text}
          </a>
        </div>
      </form>
    </div>
  );
}
