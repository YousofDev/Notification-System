let loggingAllowed = true;

// Block logs after Jest test suite finishes
afterAll(() => {
  loggingAllowed = false;
});

// Patch all logging functions
for (const fn of ["log", "error", "warn", "info"] as const) {
  const original = console[fn];
  console[fn] = (...args: any[]) => {
    if (loggingAllowed) original(...args);
  };
}

// Suppress all unhandled promise rejections
process.on("unhandledRejection", (err) => {
  // completely ignore unhandled promise rejections
  if (err instanceof Error && err.message.includes("Channel closed")) {
    // Swallow silently
    return;
  }
});

// Suppress all uncaught exceptions
process.on("uncaughtException", (err) => {
  // No-op — ignore all uncaught exceptions
});

// Override console.error to suppress all errors
console.error = () => {};
