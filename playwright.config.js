import { defineConfig } from "@playwright/test";

// I test girano sul file costruito (dist/index.html) aperto da disco, come in sala: niente server.
// Usano Edge già installato sul PC, così non serve scaricare browser.
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 120_000,
  fullyParallel: false,
  reporter: [["list"]],
  use: { channel: "msedge", headless: true },
  projects: [
    { name: "desktop", use: { viewport: { width: 1920, height: 1080 } } },
    { name: "mobile", use: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: false, reducedMotion: "reduce" } }
  ]
});
