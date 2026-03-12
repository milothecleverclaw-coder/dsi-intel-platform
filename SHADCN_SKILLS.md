# shadcn/ui Skills Reference

**Source:** https://skills.sh

## Quick Reference for Jack

### Project Context
Run `npx shadcn info --json` to get:
- Framework (Next.js, Remix, etc.)
- Tailwind version (v3 or v4)
- Aliases (@/components, etc.)
- Base library (radix or base)
- Icon library
- Installed components list

### CLI Commands
```bash
npx shadcn add <component>      # Add component
npx shadcn search <query>       # Search components
npx shadcn docs <component>     # View docs
npx shadcn info --json          # Project info
```

### Theming
- CSS variables for colors
- OKLCH color format support
- Dark mode via `dark` class
- Component variants via className

### Composition Patterns
- Use `FieldGroup` for forms
- Use `ToggleGroup` for option sets
- Use semantic colors (destructive, muted, etc.)
- Follow base-specific APIs (radix vs base)

### For DSI Project
- Check components.json for installed components
- Use correct import aliases (@/components/ui/*)
- Override with Tailwind classes for dark theme
