// ── Environment Variables ─────────────────────────────────────────────────────
//
// Centralized env-var access. Every module that needs an env var should import
// from here instead of reading import.meta.env directly.
//
// Required vars cause a hard build-time or runtime error when missing.
// Optional vars degrade gracefully with a console warning.
// ──────────────────────────────────────────────────────────────────────────────

const isDev = import.meta.env.DEV;

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Read a Vite env var. Vite inlines these at build time.
 */
function readEnv(key) {
  return import.meta.env[key] || "";
}

/**
 * Validate a required variable. Throws during development and build.
 */
function requireEnv(key, { fallback = "", hint = "" } = {}) {
  const value = readEnv(key);

  if (!value) {
    const message = [
      `[env] Missing required environment variable: ${key}`,
      hint ? `  Hint: ${hint}` : "",
      "  Copy .env.example to .env.local and set the value.",
      "  See .env.example for details.",
    ]
      .filter(Boolean)
      .join("\n");

    if (isDev) {
      console.error(message);
    }

    // In production, throw to prevent silent failures.
    if (!isDev && !fallback) {
      throw new Error(message);
    }

    return fallback;
  }

  return value;
}

/**
 * Validate an optional variable. Returns the value or fallback with a warning.
 */
function optionalEnv(key, fallback = "") {
  const value = readEnv(key);

  if (!value && fallback && isDev) {
    console.info(
      `[env] ${key} is not set — using fallback: ${fallback ? `"${fallback}"` : "(empty)"}`,
    );
  }

  return value || fallback;
}

// ── Validation ───────────────────────────────────────────────────────────────

const env = Object.freeze({
  // ── Required ────────────────────────────────────────────────────────────
  API_URL: (() => {
    const url = requireEnv("VITE_API_URL", {
      hint: "The Django backend URL, e.g. http://127.0.0.1:8000 (no trailing slash).",
    });
    // In production, reject localhost/127.0.0.1 URLs — they won't work on Vercel/Render.
    if (!isDev && url && /^(https?:\/\/)(localhost|127\.0\.0\.1)/.test(url)) {
      const msg = [
        "[env] VITE_API_URL points to localhost in production!",
        `  Current value: ${url}`,
        "  Set VITE_API_URL to your deployed backend URL in the Vercel dashboard.",
        "  Example: https://your-app.onrender.com",
      ].join("\n");
      console.error(msg);
      throw new Error(msg);
    }
    return url;
  })(),

  // ── Optional — Supabase ────────────────────────────────────────────────
  SUPABASE_URL: optionalEnv("VITE_SUPABASE_URL"),
  SUPABASE_ANON_KEY: optionalEnv("VITE_SUPABASE_ANON_KEY"),

  // ── Derived flags ───────────────────────────────────────────────────────
  SUPABASE_ENABLED: Boolean(optionalEnv("VITE_SUPABASE_URL") && optionalEnv("VITE_SUPABASE_ANON_KEY")),
});

export default env;
