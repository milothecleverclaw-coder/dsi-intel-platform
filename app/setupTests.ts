// Test environment check
console.log('Setup - ENV check:', {
  hasEndpoint: !!process.env.AZURE_DI_ENDPOINT,
  hasApiKey: !!process.env.AZURE_DI_API_KEY,
  hasConnString: !!process.env.AZURE_STORAGE_CONNECTION_STRING,
});
