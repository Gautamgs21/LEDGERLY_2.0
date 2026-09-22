export interface FontOption {
  id: string;
  name: string;
  fontFamily: string;
  category: 'Sans-Serif' | 'Serif' | 'Display';
  description: string;
  previewText: string;
}

export interface ColorThemeOption {
  id: string;
  name: string;
  primary: string;
  primaryHover: string;
  light: string;
  border: string;
  text: string;
  ring: string;
  badgeBg: string;
}

export const FONT_OPTIONS: FontOption[] = [
  {
    id: 'sf-pro',
    name: 'SF Pro',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "SF Pro", "Helvetica Neue", system-ui, sans-serif',
    category: 'Sans-Serif',
    description: 'Apple modern UI font, ultra-clean and balanced',
    previewText: '₹1,450 • Apple Clean UI',
  },
  {
    id: 'roboto',
    name: 'Roboto',
    fontFamily: '"Roboto", -apple-system, BlinkMacSystemFont, sans-serif',
    category: 'Sans-Serif',
    description: 'Google signature geometric-neo-grotesque font',
    previewText: '₹1,450 • Google Neo Grotesque',
  },
  {
    id: 'inter',
    name: 'Inter',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    category: 'Sans-Serif',
    description: 'Carefully crafted for computer screens & dense data',
    previewText: '₹1,450 • Screen Optimized',
  },
  {
    id: 'open-sans',
    name: 'Open Sans',
    fontFamily: '"Open Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    category: 'Sans-Serif',
    description: 'Humanist sans-serif with friendly open letterforms',
    previewText: '₹1,450 • Friendly Humanist',
  },
  {
    id: 'poppins',
    name: 'Poppins',
    fontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, sans-serif',
    category: 'Display',
    description: 'Geometric sans-serif with circular, modern curves',
    previewText: '₹1,450 • Geometric & Modern',
  },
  {
    id: 'aptos-serif',
    name: 'Aptos Serif',
    fontFamily: '"Aptos Serif", "Lora", Cambria, "Times New Roman", Georgia, serif',
    category: 'Serif',
    description: 'Microsoft modern editorial serif, elegant and refined',
    previewText: '₹1,450 • Editorial Classic',
  },
  {
    id: 'aptos-display',
    name: 'Aptos Display',
    fontFamily: '"Aptos Display", "Aptos", "Plus Jakarta Sans", "Segoe UI", system-ui, sans-serif',
    category: 'Display',
    description: 'Microsoft contemporary default display sans',
    previewText: '₹1,450 • Contemporary Display',
  },
];

export const COLOR_THEMES: ColorThemeOption[] = [
  {
    id: 'indigo',
    name: 'Indigo Classic',
    primary: '#4f46e5',
    primaryHover: '#4338ca',
    light: '#eef2ff',
    border: '#c7d2fe',
    text: '#3730a3',
    ring: '#818cf8',
    badgeBg: '#e0e7ff',
  },
  {
    id: 'violet',
    name: 'Electric Violet',
    primary: '#7c3aed',
    primaryHover: '#6d28d9',
    light: '#f5f3ff',
    border: '#ddd6fe',
    text: '#5b21b6',
    ring: '#a78bfa',
    badgeBg: '#ede9fe',
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    light: '#eff6ff',
    border: '#bfdbfe',
    text: '#1e40af',
    ring: '#60a5fa',
    badgeBg: '#dbeafe',
  },
  {
    id: 'cyan',
    name: 'Sky Cyan',
    primary: '#0284c7',
    primaryHover: '#0369a1',
    light: '#f0f9ff',
    border: '#bae6fd',
    text: '#075985',
    ring: '#38bdf8',
    badgeBg: '#e0f2fe',
  },
  {
    id: 'teal',
    name: 'Teal Oasis',
    primary: '#0d9488',
    primaryHover: '#0f766e',
    light: '#f0fdfa',
    border: '#99f6e4',
    text: '#115e59',
    ring: '#2dd4bf',
    badgeBg: '#ccfbf1',
  },
  {
    id: 'emerald',
    name: 'Emerald Mint',
    primary: '#059669',
    primaryHover: '#047857',
    light: '#ecfdf5',
    border: '#a7f3d0',
    text: '#065f46',
    ring: '#34d399',
    badgeBg: '#d1fae5',
  },
  {
    id: 'forest',
    name: 'Forest Pine',
    primary: '#15803d',
    primaryHover: '#166534',
    light: '#f0fdf4',
    border: '#bbf7d0',
    text: '#14532d',
    ring: '#4ade80',
    badgeBg: '#dcfce7',
  },
  {
    id: 'olive',
    name: 'Olive Sage',
    primary: '#65a30d',
    primaryHover: '#4d7c0f',
    light: '#f7fee7',
    border: '#d9f99d',
    text: '#3f6212',
    ring: '#a3e635',
    badgeBg: '#ecfccb',
  },
  {
    id: 'amber',
    name: 'Amber Gold',
    primary: '#d97706',
    primaryHover: '#b45309',
    light: '#fffbeb',
    border: '#fde68a',
    text: '#92400e',
    ring: '#fbbf24',
    badgeBg: '#fef3c7',
  },
  {
    id: 'orange',
    name: 'Sunset Orange',
    primary: '#ea580c',
    primaryHover: '#c2410c',
    light: '#fff7ed',
    border: '#fed7aa',
    text: '#9a3412',
    ring: '#fb923c',
    badgeBg: '#ffedd5',
  },
  {
    id: 'coral',
    name: 'Coral Rose',
    primary: '#f43f5e',
    primaryHover: '#e11d48',
    light: '#fff1f2',
    border: '#fecdd3',
    text: '#9f1239',
    ring: '#fb7185',
    badgeBg: '#ffe4e6',
  },
  {
    id: 'ruby',
    name: 'Crimson Ruby',
    primary: '#dc2626',
    primaryHover: '#b91c1c',
    light: '#fef2f2',
    border: '#fecaca',
    text: '#991b1b',
    ring: '#f87171',
    badgeBg: '#fee2e2',
  },
  {
    id: 'pink',
    name: 'Berry Pink',
    primary: '#db2777',
    primaryHover: '#be185d',
    light: '#fdf2f8',
    border: '#fbcfe8',
    text: '#9d174d',
    ring: '#f472b6',
    badgeBg: '#fce7f3',
  },
  {
    id: 'magenta',
    name: 'Magenta Fuchsia',
    primary: '#c026d3',
    primaryHover: '#a21caf',
    light: '#fdf4ff',
    border: '#f5d0fe',
    text: '#86198f',
    ring: '#e879f9',
    badgeBg: '#fae8ff',
  },
  {
    id: 'purple',
    name: 'Royal Purple',
    primary: '#9333ea',
    primaryHover: '#7e22ce',
    light: '#faf5ff',
    border: '#e9d5ff',
    text: '#6b21a8',
    ring: '#c084fc',
    badgeBg: '#f3e8ff',
  },
  {
    id: 'lavender',
    name: 'Lavender Mist',
    primary: '#8b5cf6',
    primaryHover: '#7c3aed',
    light: '#f5f3ff',
    border: '#ddd6fe',
    text: '#5b21b6',
    ring: '#a78bfa',
    badgeBg: '#ede9fe',
  },
  {
    id: 'navy',
    name: 'Midnight Navy',
    primary: '#1e293b',
    primaryHover: '#0f172a',
    light: '#f1f5f9',
    border: '#cbd5e1',
    text: '#0f172a',
    ring: '#64748b',
    badgeBg: '#e2e8f0',
  },
  {
    id: 'slate',
    name: 'Slate Charcoal',
    primary: '#475569',
    primaryHover: '#334155',
    light: '#f8fafc',
    border: '#e2e8f0',
    text: '#1e293b',
    ring: '#94a3b8',
    badgeBg: '#f1f5f9',
  },
  {
    id: 'copper',
    name: 'Bronze Copper',
    primary: '#b45309',
    primaryHover: '#92400e',
    light: '#fffbeb',
    border: '#fde68a',
    text: '#78350f',
    ring: '#d97706',
    badgeBg: '#fef3c7',
  },
  {
    id: 'plum',
    name: 'Wine Plum',
    primary: '#831843',
    primaryHover: '#701a75',
    light: '#fdf2f8',
    border: '#fbcfe8',
    text: '#500724',
    ring: '#db2777',
    badgeBg: '#fce7f3',
  },
];

export function applyThemeAndFont(fontName: string, themeId: string) {
  const font =
    FONT_OPTIONS.find(
      (f) =>
        f.name.toLowerCase() === fontName.toLowerCase() ||
        f.id === fontName.toLowerCase()
    ) || FONT_OPTIONS[3];
  const theme = COLOR_THEMES.find((t) => t.id === themeId) || COLOR_THEMES[0];

  const root = document.documentElement;
  root.style.setProperty('--app-font', font.fontFamily);
  root.style.setProperty('--font-sans', font.fontFamily);
  root.style.setProperty('--font-serif', font.fontFamily);
  root.style.setProperty('--font-mono', font.fontFamily);
  root.style.setProperty('--color-primary', theme.primary);
  root.style.setProperty('--color-primary-hover', theme.primaryHover);
  root.style.setProperty('--color-primary-light', theme.light);
  root.style.setProperty('--color-primary-border', theme.border);
  root.style.setProperty('--color-primary-text', theme.text);
  root.style.setProperty('--color-primary-ring', theme.ring);
  root.style.setProperty('--color-primary-badge', theme.badgeBg);
  root.style.setProperty('--color-brand-purple', theme.primary);
  root.style.setProperty('--color-brand-dark-purple', theme.primaryHover);

  if (document.body) {
    document.body.style.fontFamily = font.fontFamily;
  }

  // Inject or update a dedicated high-specificity global style tag
  // to ensure 100% of all text on every page strictly renders in the selected font
  let styleEl = document.getElementById('ledgerly-dynamic-font-override') as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'ledgerly-dynamic-font-override';
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = `
    *, *::before, *::after,
    html, body, #root, #root *,
    h1, h2, h3, h4, h5, h6,
    p, span, div, a, label, strong, b, em, i,
    button, input, select, textarea, option, optgroup,
    table, thead, tbody, tfoot, tr, th, td,
    ul, ol, li,
    .font-sans, .font-serif, .font-mono, [class*="font-mono"],
    .font-headline, .font-\\[\\'Cinzel\\'\\,serif\\] {
      font-family: ${font.fontFamily} !important;
    }

    .font-preview-specimen, [data-font-preview="true"] {
      font-family: var(--preview-font) !important;
    }
  `;
}
