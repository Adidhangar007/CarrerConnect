# Design Brief: CareerConnect

## Direction
Professional job portal with warm, approachable corporate aesthetic. Teal primary (trust/stability) paired with warm orange accents (opportunity). Modern sans-serif typography with clean card-based layouts. Light mode default with intentional dark mode support.

## Color Palette
| Token | Light L | Light C | Light H | Dark L | Dark C | Dark H | Usage |
|-------|---------|---------|---------|--------|--------|--------|-------|
| Primary | 0.55 | 0.15 | 245 | 0.70 | 0.14 | 245 | Primary buttons, active states, links |
| Accent | 0.72 | 0.14 | 55 | 0.75 | 0.14 | 55 | Highlights, badges, warnings |
| Success | 0.68 | 0.18 | 142 | 0.72 | 0.15 | 142 | Confirmation, positive status |
| Foreground | 0.15 | 0.01 | 240 | 0.93 | 0.01 | 240 | Body text |
| Muted | 0.92 | 0.01 | 240 | 0.20 | 0.01 | 245 | Disabled, secondary text |

## Typography
| Role | Font | Weight | Size |
|------|------|--------|------|
| Display | Space Grotesk | 600–700 | 32px, 28px, 24px |
| Body | DM Sans | 400–500 | 16px, 14px |
| Mono | Geist Mono | 400–500 | 12px, 13px |

## Structural Zones
| Zone | Light Background | Dark Background | Treatment |
|------|------------------|-----------------|-----------|
| Header | Primary (0.55 0.15 245) | Primary (0.70 0.14 245) | Solid bar, white text, logo + nav |
| Main Content | Background (0.985 0.002 234) | Background (0.12 0.01 240) | Clean, light surface |
| Cards | Card (1.0 0.001 260) | Card (0.16 0.01 245) | Rounded corners, shadow-card |
| Sidebar (Admin) | Sidebar (0.96 0.01 240) | Sidebar (0.16 0.01 245) | Secondary background, border-right |
| Footer | Muted (0.92 0.01 240) | Muted (0.20 0.01 245) | Subtle background, border-top |

## Spacing & Rhythm
- Grid: 4px / 0.25rem base unit
- Padding: 8px, 12px, 16px, 24px, 32px (sm, base, md, lg, xl)
- Gap: 12px (between cards), 16px (between sections), 24px (major sections)
- Border-radius: 10px (0.625rem) — consistent rounded corners for approachability

## Component Patterns
- **Buttons**: Primary (teal), Secondary (minimal), Destructive (red). All use rounded corners.
- **Cards**: Job listings, company profiles, user applications. Consistent shadow-card treatment.
- **Forms**: Input fields use primary focus ring, muted placeholders.
- **Navigation**: Top header with logo/brand, side navigation for authenticated users.
- **Status Badges**: Success (green), pending (orange accent), rejected (red).

## Motion & Animation
- Smooth transitions: 0.3s cubic-bezier(0.4, 0, 0.2, 1) on hover/focus
- Fade in: new cards on load
- Slide: sidebar navigation, modals

## Constraints
- No gradients or decorative backgrounds on main content areas
- High contrast for text (AA+ standard)
- Clear visual hierarchy through elevation (shadows) and background colors
- Intentional color usage: primary for actions, accent for highlights only

## Signature Detail
Warm orange accent paired with professional teal creates a distinct, memorable identity. Unlike generic blue-only corporate UIs, this palette signals both professionalism and human-centered opportunity.
