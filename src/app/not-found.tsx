"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-premium-gradient p-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6 max-w-md"
      >
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>
        <div>
          <h1 className="text-7xl font-bold tracking-tight text-gradient">404</h1>
          <h2 className="text-2xl font-semibold mt-2">Page not found</h2>
          <p className="text-sm text-muted-foreground mt-2">
            We couldn't find what you were looking for. It may have been moved or deleted.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link href="/dashboard">
              <Home className="h-4 w-4" />
              Back to dashboard
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/tenants">
              <Search className="h-4 w-4" />
              Browse tenants
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
