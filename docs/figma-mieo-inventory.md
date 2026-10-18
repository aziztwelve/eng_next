# Mieo — Figma inventory

Source: https://www.figma.com/design/BBEZuLQ2VnZlfC6p65sYxN/Mieo---Language-Learning?node-id=364-14961

This is the first extraction pass. It preserves the selected Login frame (364:14961) and its local assets before implementation.

## Local extraction

- Asset directory: public/figma/mieo-login/
- Asset manifest: public/figma/mieo-login/manifest.json
- Downloaded assets: 128 unique Figma exports/SVGs
- Scope covered: Login frame, cloud decoration, form fields, CTA, social-login block, status bar, Google/Apple icons, divider lines, and child layers.
- Each asset filename includes the source node id and asset kind. The manifest records the local mapping; Figma asset URLs are temporary and are intentionally not used by the site.

## Selected frame structure

- 364:14961 — Login, 375 × 812
  - 364:14962 — Cloudes
  - 364:15069 — Container
    - 364:15101 — Heading
    - 364:15126 — Input Fields
    - 366:15166 — Bottom Action
    - 366:15191 — Social Login
  - 364:15104 — Status Bar - iPhone

## Extracted design tokens

- Font family: Nunito
- Heading: 32px / Black
- Body: 16px / Medium
- Label: 14px / SemiBold
- Primary: #59C8FF
- Sky top: #B3E6FF
- Background: #FAFAFA
- Text heading: #171A1C
- Body text: #5D686F
- Natural surface: #FFFFFF
- Extra-dim stroke: #E3E6E8
- Primary darker shadow: #3E8CB2
- Primary full shadow: #1AB3FF
- Spacing: 12 / 16 / 24px
- Border: 1.5px
- Hard shadow length: 4px

## Next implementation phases

1. Confirm the target route/screen in eng_next2.
2. Map the extracted primitives to the existing site tokens and components.
3. Implement the Login frame responsively, then verify against a Figma screenshot.
4. Continue screen-by-screen from additional node-specific Figma URLs.
