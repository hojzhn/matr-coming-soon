# Project conventions

## Code style
- Do not add comments. Write code without explanatory comments unless explicitly asked for them.
- All text must be rendered with the `Heading` component, configured only through its props (`level`/`tag`/`size`/`sizeMd`/`weight`/`tracking`/`leading`/`align`/`tone`) — never with raw utility classes or inline styles for typography. If a needed option is missing, add a prop to `Heading` rather than reaching for a class.
- Use `Section` for page sections (`contained={false}` for full-bleed) and `Container` for width.
- Only use Tailwind classes that exist in `src/routes/layout.css`/`palette.css` — arbitrary values (`z-[90]`) are fine, bare unregistered scale values silently compile to nothing.
- No dark mode. There is a single fixed aesthetic; the Hero section is intentionally dark via `Section tone="ink"`.
