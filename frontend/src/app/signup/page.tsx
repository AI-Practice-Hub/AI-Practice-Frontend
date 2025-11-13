"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/auth/AuthForm';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function SignupPage() {
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signup({ email, password });
      // Router navigation handled by AuthContext
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Sign Up"
      onSubmit={handleSubmit}
      error={error}
      loading={loading}
      footerText="Already have an account?"
      footerLink={{ text: "Login", href: "/login" }}
    >
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        type="password"
        placeholder="Password (min 6 characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Button type="submit" disabled={loading}>
        {loading ? "Signing up..." : "Sign Up"}
      </Button>
    </AuthForm>
  );
}
