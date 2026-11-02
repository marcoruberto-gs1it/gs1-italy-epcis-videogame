import { defineConfig } from "@playwright/test";

// I test girano sul file costruito (dist/index.html) aperto da disco, come in sala: niente server.
// Usano Edge già installato sul PC, così non serve scaricare browser.
// metadata.render sceglie il renderer con ?render=3d o ?render=2d.
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 180_000,
  fullyParallel: false,
  workers: 2,
  reporter: [["list"]],
  use: { channel: "msedge", headless: true },
  projects: [
    { name: "desktop-3d", metadata: { render: "3d" }, use: { viewport: { width: 1920, height: 1080 } } },
    { name: "desktop-2d", metadata: { render: "2d" }, use: { viewport: { width: 1920, height: 1080 } }, testIgnore: /render\.spec/ },
    { name: "mobile", metadata: { render: "3d" }, use: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: false, reducedMotion: "reduce" }, testIgnore: /render\.spec/ }
  ]
});
