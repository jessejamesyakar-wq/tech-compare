// Compatibility entry point: reviewed observations replace the old search/regex writer.
// Default is report-only. Legacy --push is rejected before catalog or network access.
require('./observeStoreOffers.cjs').main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
