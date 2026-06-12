"use client";

import * as React from "react";
import { Search, Moon, Sun, Monitor, LogOut, Settings, User, Bell } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUnreadNotifications } from "@/hooks/use-notifications";
import { COPY } from "@/config/copy";

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { data: unreadCount = 0 } = useUnreadNotifications();

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-card/70 backdrop-blur-xl">
      <div className="h-full px-4 lg:px-6 flex items-center gap-3">
        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={COPY.topbar.search}
              className="pl-9 h-9 bg-muted/40 border-transparent focus-visible:bg-background"
            />
          </div>
        </div>

        <div className="flex-1 md:flex-none" />

        <Button
          variant="ghost"
          size="icon"
          onClick={cycleTheme}
          aria-label="Toggle theme"
        >
          {theme === "light" ? (
            <Sun className="h-4 w-4" />
          ) : theme === "dark" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Monitor className="h-4 w-4" />
          )}
        </Button>

        <Link href="/notifications" aria-label="Notifications">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
            )}
          </Button>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 px-2">
              <Avatar
                size="sm"
                name={user?.name}
                seed={user?.email}
              />
              <div className="hidden sm:flex flex-col items-start leading-tight">
                <span className="text-xs font-semibold">{user?.name}</span>
                <span className="text-[10px] text-muted-foreground">{user?.email}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{COPY.topbar.signedInAs}</DropdownMenuLabel>
            <DropdownMenuItem disabled className="text-xs text-muted-foreground">
              {user?.email}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <Settings className="h-4 w-4 mr-2" />
                {COPY.topbar.settings}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/notifications" className="cursor-pointer">
                <Bell className="h-4 w-4 mr-2" />
                {COPY.topbar.notifications}
                {unreadCount > 0 && (
                  <span className="ml-auto text-xs text-destructive font-semibold">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              {COPY.topbar.signOut}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
