import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme()
    const isDark = resolvedTheme === "dark"

    return (
        <Button
            variant="ghost"
            size="icon"
            className="size-11 rounded-x1"
            aria-label={isDark ? "Switch to light mode": "Switch to dark mode"}
            onClick={() => setTheme(isDark ? "light": "dark")}
        >
            {isDark ? <Sun /> : <Moon />}
        </Button>
    )
}