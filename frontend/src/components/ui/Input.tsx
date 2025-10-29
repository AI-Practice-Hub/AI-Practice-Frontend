import React from 'react';

interface InputProps {
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  error?: string;
  className?: string;
}

export function Input({
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  error,
  className = '',
}: InputProps) {
  return (
    <div className="w-full">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`
          w-full px-4 py-3 rounded-md border 
          bg-zinc-100 dark:bg-zinc-800 
          text-zinc-900 dark:text-zinc-100
          focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500
          transition-all
          ${error 
            ? 'border-red-500 dark:border-red-400' 
            : 'border-zinc-300 dark:border-zinc-700'
          }
          ${className}
        `}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
