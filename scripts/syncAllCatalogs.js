// All categories use the same reviewed source and observation contract.
require('./observeStoreOffers.cjs').main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
