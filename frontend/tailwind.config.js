/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- Backgrounds ---
        "background":                "#0d1a0d",
        "surface":                   "#0d1a0d",
        "surface-dim":               "#0a150a",
        "surface-bright":            "#243324",

        // --- Surface Containers ---
        "surface-container-lowest":  "#080f08",
        "surface-container-low":     "#111e11",
        "surface-container":         "#162216",
        "surface-container-high":    "#1c2b1c",
        "surface-container-highest": "#233023",

        // --- Primary (Olive Green) ---
        "primary":                   "#a8c87a",
        "primary-fixed":             "#c2e090",
        "primary-fixed-dim":         "#8baa5c",
        "on-primary":                "#0a1a0a",
        "on-primary-fixed":          "#0a1a0a",
        "on-primary-fixed-variant":  "#2a4a1a",
        "primary-container":         "#2e4a18",
        "on-primary-container":      "#8baa5c",
        "inverse-primary":           "#3a5a22",

        // --- Secondary (Muted Green-Grey) ---
        "secondary":                 "#8eaa80",
        "secondary-fixed":           "#b0c8a0",
        "secondary-fixed-dim":       "#7a9870",
        "on-secondary":              "#1a2a14",
        "on-secondary-fixed":        "#0e1e0e",
        "on-secondary-fixed-variant":"#2e3e28",
        "secondary-container":       "#243820",
        "on-secondary-container":    "#7a9870",

        // --- Tertiary (Golden/Amber) ---
        "tertiary":                  "#d4c070",
        "tertiary-fixed":            "#e8d898",
        "tertiary-fixed-dim":        "#c0ac5a",
        "on-tertiary":               "#1e1800",
        "on-tertiary-fixed":         "#1e1800",
        "on-tertiary-fixed-variant": "#3c3010",
        "tertiary-container":        "#3a3010",
        "on-tertiary-container":     "#c0ac5a",

        // --- Error ---
        "error":                     "#e07878",
        "error-container":           "#4a1818",
        "on-error":                  "#240000",
        "on-error-container":        "#e07878",

        // --- On Colors ---
        "on-background":             "#d0e8c8",
        "on-surface":                "#d0e8c8",
        "on-surface-variant":        "#7a9872",
        "inverse-on-surface":        "#162216",
        "inverse-surface":           "#c8e0c0",

        // --- Outline ---
        "outline":                   "#4a6040",
        "outline-variant":           "#283c20",

        // --- Surface Tint ---
        "surface-tint":              "#8baa5c",
        "surface-variant":           "#1c2b1c",
      },
      fontFamily: {
        "label-md": ["Inter", "system-ui", "sans-serif"],
        "headline-lg": ["Inter", "system-ui", "sans-serif"],
        "caption": ["Inter", "system-ui", "sans-serif"],
        "headline-md": ["Inter", "system-ui", "sans-serif"],
        "display-lg": ["Inter", "system-ui", "sans-serif"],
        "body-md": ["Inter", "system-ui", "sans-serif"],
        "body-lg": ["Inter", "system-ui", "sans-serif"],
        "body-sm": ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "label-md": ["14px", {"lineHeight": "1", "letterSpacing": "0.06em", "fontWeight": "500"}],
        "headline-lg": ["32px", {"lineHeight": "1.2", "letterSpacing": "-0.01em", "fontWeight": "600"}],
        "caption": ["12px", {"lineHeight": "1.4", "letterSpacing": "0.03em", "fontWeight": "400"}],
        "headline-md": ["22px", {"lineHeight": "1.3", "letterSpacing": "0em", "fontWeight": "600"}],
        "display-lg": ["48px", {"lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "700"}],
        "body-md": ["15px", {"lineHeight": "1.6", "letterSpacing": "0.01em", "fontWeight": "400"}],
        "body-lg": ["17px", {"lineHeight": "1.6", "letterSpacing": "0.01em", "fontWeight": "400"}],
        "body-sm": ["13px", {"lineHeight": "1.5", "letterSpacing": "0.01em", "fontWeight": "400"}],
      }
    },
  },
  plugins: [],
}
