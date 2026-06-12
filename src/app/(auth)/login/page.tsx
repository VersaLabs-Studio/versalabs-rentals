"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Building2, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth-provider";
import { toast } from "@/components/ui/toast";
import { COPY } from "@/config/copy";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, user, loading } = useAuth();
  const [email, setEmail] = React.useState("admin@rentflow.et");
  const [password, setPassword] = React.useState("demo-password");
  const [submitting, setSubmitting] = React.useState(false);

  // If already signed in, send to dashboard
  React.useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signIn(email, password);
      toast.success(COPY.login.welcomeBack);
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-premium-gradient">
      {/* Left: brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-10 relative overflow-hidden bg-mesh">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Logo size="lg" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-6 max-w-md relative z-10"
        >
          <h1 className="text-4xl xl:text-5xl font-bold tracking-tight leading-tight">
            {COPY.login.headline}
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            {COPY.login.subheadline}
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { label: "Buildings", value: "12" },
              { label: "Offices", value: "240" },
              { label: "Tenants", value: "40" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-lg border border-border/60 bg-card/50 backdrop-blur-sm p-3"
              >
                <p className="text-2xl font-bold tabular-nums">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xs text-muted-foreground relative z-10"
        >
          © {new Date().getFullYear()} {COPY.login.copyright}
        </motion.p>
      </div>

      {/* Right: form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden flex justify-center mb-8">
            <Logo size="lg" />
          </div>

          <div className="space-y-2 mb-8 text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight">{COPY.login.welcomeTitle}</h2>
            <p className="text-sm text-muted-foreground">{COPY.login.welcomeSubtitle}</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{COPY.login.email}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@rentflow.et"
                  className="pl-9"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{COPY.login.password}</Label>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={(e) => e.preventDefault()}
                >
                  {COPY.login.forgotPassword}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {COPY.login.signingIn}
                </>
              ) : (
                <>
                  {COPY.login.signIn}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            <div className="rounded-lg border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground mb-0.5">{COPY.login.demoTitle}</p>
              <p>{COPY.login.demoHint}</p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
