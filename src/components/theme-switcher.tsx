"use client";

import * as React from "react";
import { Moon, Sun, Palette, Eye, Type } from "lucide-react";
import { useTheme } from "next-themes";
import { useThemeSettings } from "./theme-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { colorTheme, setColorTheme, dyslexiaMode, setDyslexiaMode } =
    useThemeSettings();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="relative">
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative transition-all duration-300 hover:scale-110 hover:rotate-12"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Appearance Settings
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Light/Dark Mode */}
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Mode
        </DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="cursor-pointer"
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
          {theme === "light" && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="cursor-pointer"
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
          {theme === "dark" && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="cursor-pointer"
        >
          <Sun className="mr-2 h-4 w-4 dark:hidden" />
          <Moon className="mr-2 h-4 w-4 hidden dark:block" />
          <span>System</span>
          {theme === "system" && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Color Theme */}
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Color Theme
        </DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => setColorTheme("default")}
          className="cursor-pointer"
        >
          <div className="mr-2 h-4 w-4 rounded-full bg-gradient-to-r from-gray-500 to-gray-700" />
          <span>Default</span>
          {colorTheme === "default" && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setColorTheme("professional-blue")}
          className="cursor-pointer"
        >
          <div className="mr-2 h-4 w-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600" />
          <span>Professional Blue</span>
          {colorTheme === "professional-blue" && (
            <span className="ml-auto">✓</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setColorTheme("classic-brown")}
          className="cursor-pointer"
        >
          <div className="mr-2 h-4 w-4 rounded-full bg-gradient-to-r from-amber-600 to-orange-700" />
          <span>Classic Brown</span>
          {colorTheme === "classic-brown" && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setColorTheme("high-contrast")}
          className="cursor-pointer"
        >
          <div className="mr-2 h-4 w-4 rounded-full bg-gradient-to-r from-black to-white" />
          <span>High Contrast</span>
          {colorTheme === "high-contrast" && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Accessibility */}
        <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center gap-1">
          <Eye className="h-3 w-3" />
          Accessibility
        </DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={dyslexiaMode}
          onCheckedChange={setDyslexiaMode}
          className="cursor-pointer"
        >
          <Type className="mr-2 h-4 w-4" />
          <span>Dyslexia-Friendly Font</span>
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
