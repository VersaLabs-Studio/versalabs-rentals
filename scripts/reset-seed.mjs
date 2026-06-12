/**
 * Reset seed data from the command line.
 * Run: npm run reset-seed
 * Opens the app in a browser — to actually clear localStorage, use the
 * Settings → Reset to seed data button or the browser console:
 *   Object.keys(localStorage).filter(k => k.startsWith('rentflow:')).forEach(k => localStorage.removeItem(k))
 *   location.reload()
 */
console.log("To reset RentFlow seed data:");
console.log("");
console.log("Option 1: Use the app at /settings → Danger Zone → Reset to seed data");
console.log("");
console.log("Option 2: In the browser DevTools console:");
console.log("  Object.keys(localStorage).filter(k => k.startsWith('rentflow:')).forEach(k => localStorage.removeItem(k))");
console.log("  location.reload()");
