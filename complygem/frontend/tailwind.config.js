/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Public Sans'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
      },
      colors: {
        bg: "#F5F8FA",
        surface: "#FFFFFF",
        ink: {
          900: "#0B1F33",
          700: "#243B53",
          500: "#52708A",
          300: "#8FA6B8",
        },
        navy: {
          950: "#081B2E",
          900: "#0B2A4A",
          800: "#123A63",
          700: "#194B7D",
          100: "#E7EEF5",
        },
        teal: {
          600: "#0A7C86",
          500: "#0C97A3",
          400: "#22B4BE",
          100: "#DFF4F3",
        },
        success: {
          700: "#146C43",
          500: "#1E9159",
          100: "#E2F5EA",
        },
        warning: {
          700: "#92590A",
          500: "#C1770B",
          100: "#FCF0DA",
        },
        critical: {
          700: "#9A2A2A",
          500: "#C13636",
          100: "#FBE7E7",
        },
        line: "#DFE7ED",
      },
      boxShadow: {
        card: "0 1px 2px rgba(11, 31, 51, 0.06), 0 1px 1px rgba(11, 31, 51, 0.04)",
        popover: "0 8px 24px rgba(11, 31, 51, 0.12)",
      },
      borderRadius: {
        md: "8px",
        lg: "10px",
        xl: "14px",
      },
    },
  },
  plugins: [],
};
