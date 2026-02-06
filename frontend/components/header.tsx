"use client";

import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useSupabase } from "../app/app/providers";
import { User, LogOut, History, Settings, ChevronDown } from "lucide-react";

interface HeaderProps {
  onLoginClick: () => void;
}

export function Header({ onLoginClick }: HeaderProps) {
  const { user, supabase } = useSupabase();

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex h-14 items-center justify-between px-4 lg:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center">
            <span className="text-white text-lg font-bold">◆</span>
          </div>
          <span className="text-lg font-semibold text-slate-900">SlideTheory</span>
          <span className="hidden sm:inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
            Beta
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                    {user.email?.[0].toUpperCase() || "U"}
                  </div>
                  <span className="hidden sm:inline max-w-[120px] truncate">
                    {user.email?.split("@")[0]}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white border-slate-200">
                <div className="px-2 py-1.5 text-sm text-slate-500">
                  {user.email}
                </div>
                <DropdownMenuSeparator className="bg-slate-200" />
                <DropdownMenuItem className="text-slate-900 focus:bg-slate-100 cursor-pointer">
                  <History className="mr-2 h-4 w-4" />
                  My Slides
                </DropdownMenuItem>
                <DropdownMenuItem className="text-slate-900 focus:bg-slate-100 cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-200" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 focus:bg-slate-100 focus:text-red-600 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              onClick={onLoginClick}
              className="text-slate-700 hover:text-slate-900 hover:bg-slate-100"
            >
              <User className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
