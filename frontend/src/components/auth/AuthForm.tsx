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
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-8 flex flex-col gap-6"
      >
        <h2 className="text-2xl font-bold text-center text-blue-700 dark:text-purple-300">
          {title}
        </h2>
        
        {children}
        
        {error && (
          <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}
        
        <div className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          {footerText}{' '}
          <a
            href={footerLink.href}
            className="text-blue-700 dark:text-purple-300 hover:underline font-medium"
          >
            {footerLink.text}
          </a>
        </div>
      </form>
    </div>
  );
}
