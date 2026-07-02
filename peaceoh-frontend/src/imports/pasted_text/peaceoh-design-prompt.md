 Figma Design Prompt — PeaceOh

Project Overview
Design a full website for PeaceOh — a mindfulness and creative wellness platform for people seeking calm, self-expression, and gentle play. The site offers five core experiences: Pop Bubbles (game), Sand Drawing (game), Letter to Future Self, Letter to Themselves, and Mandala Coloring.
Audience: Teens to adults seeking stress relief, emotional expression, and mindful creativity.

Tone: Soft, welcoming, gently playful — like a cozy creative journal that breathes.

Color Palette (Pastel)
TokenHexUse--blush#F7C5C5CTAs, bubble accents--lavender#D8C9F0Mandala section, headers--mint#C3E8D8Sand drawing, success states--buttercup#FBF0C2Letters section, card backgrounds--sky#C5DFF7Pop Bubbles game, nav hover--cream#FAF7F2Page background--text-deep#3D3450All body text (deep muted purple)

Typography

Display / Headings: Playfair Display — italic weight for hero tagline, adds warmth and literary softness
Body / UI: DM Sans — clean, friendly, highly readable at small sizes
Accent / Labels: Caveat — handwritten feel for section labels like "your space", "begin here" — used sparingly

Type Scale:

H1: 56px / Playfair Display Italic
H2: 36px / Playfair Display
H3: 22px / DM Sans SemiBold
Body: 16px / DM Sans Regular
Label/Tag: 13px / Caveat


Layout Concept
Global feel: Rounded corners everywhere (16–32px radius). Soft drop shadows (0 4px 24px rgba(0,0,0,0.06)). No hard lines — everything floats.
┌──────────────────────────────────────────┐
│  Logo (left)      Nav: Games / Letters / Mandala  │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│                                          │
│   "Find your peace,                      │
│    one breath at a time."  (H1, italic)  │
│                                          │
│   Floating illustrated bubbles bg        │
│   [Begin →]  soft blush pill button      │
│                                          │
└──────────────────────────────────────────┘

┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ 🫧 Pop │ │ 🏖 Sand│ │ 💌 Future│ │ 📝 Self│ │ 🌸 Mandala│
│Bubbles │ │Drawing │ │  Letter │ │ Letter │ │Coloring│
└────────┘ └────────┘ └────────┘ └────────┘ └────────┘
  (5-card feature strip, horizontally scrollable on mobile)

┌──────────────────────────────────────────┐
│  "How are you feeling today?"            │
│  Mood check-in (emoji selector row)      │
│  → Routes user to the right activity     │
└──────────────────────────────────────────┘

Footer: soft lavender strip, minimal links

Component Specs
Navbar

Background: #FAF7F2 with 8px bottom blur
Logo: wordmark in Playfair Display, deep purple
Nav links: DM Sans, 15px, spaced; pill hover state in --sky

Hero Section

Full-width, --cream background
Animated floating pastel bubbles (CSS/Lottie) scattered in background
Tagline in Playfair Display Italic, 56px, --text-deep
Subtext: 18px DM Sans, muted (#8A7FA0)
CTA pill button: --blush fill, white text, 48px height, 24px radius

Feature Cards (5 Activities)

Card size: 220×280px
Unique pastel background per card (one per palette color)
Illustrated icon (soft line-art style, not flat emoji)
Card title: DM Sans SemiBold 18px
Hover: card lifts (translateY(-6px)), shadow deepens
"Try it →" text link in card footer

Mood Check-in Strip

Background: --lavender tinted panel
Row of 5 circular emoji/mood buttons (😌 😔 😤 😶 🥺)
Label above in Caveat font: "how are you feeling right now?"
On select: button fills with matching pastel, routes to activity

Letter Section (Future Self + To Themselves)

--buttercup background
Textarea styled like lined notebook paper (faint ruled lines via CSS)
Caveat font inside textarea for handwritten feel
"Seal & Save" button — envelope icon, --blush fill

Mandala Coloring

--lavender section
Canvas preview centered, surrounded by a soft circular glow
Color palette picker below: pastel swatches in a row
"Download" button: outlined, lavender border

Pop Bubbles Game

--sky background section
Bubbles rendered in canvas/SVG — translucent, soft
Score display: Caveat font, playful

Sand Drawing

--mint background
Dark sand-colored canvas (#7B6450)
Toolbar: stroke size, erase, reset — minimal pill controls


Signature Element
🫧 The Bubble Cursor — On the homepage hero, the user's cursor leaves a trail of tiny fading pastel bubbles as it moves. This single interactive flourish defines the brand personality: gentle, ephemeral, joyful. It costs nothing cognitively but is immediately memorable.

Figma File Structure
PeaceOh/
├── 🎨 Styles
│   ├── Color Styles (all 7 tokens)
│   ├── Text Styles (H1–Body–Label)
│   └── Effects (card shadow, glow)
├── 🧩 Components
│   ├── Navbar
│   ├── FeatureCard (5 variants)
│   ├── MoodButton
│   ├── PillButton (primary/secondary)
│   ├── NotebookTextarea
│   └── MandalaCanvas
├── 📄 Pages
│   ├── Home
│   ├── Pop Bubbles
│   ├── Sand Drawing
│   ├── Letter – Future Self
│   ├── Letter – To Myself
│   └── Mandala Coloring
└── 📱 Breakpoints
    ├── Desktop (1440px)
    ├── Tablet (768px)
    └── Mobile (390px)

Design Mood Reference Keywords (for Figma Moodboard / plugin searches)
soft watercolor, pastel journaling, mindfulness app, gentle illustration, cozy UI, rounded everything, studio ghibli palette, calm digital space
