import { config } from 'dotenv';
import path from 'path';

// Load .env.local for tests using absolute path
config({ path: path.resolve(__dirname, '.env.local') });

console.log('Setup - ENV check:', {
  hasEndpoint: !!process.env.AZURE_DI_ENDPOINT,
  hasApiKey: !!process.env.AZURE_DI_API_KEY,
  hasConnString: !!process.env.AZURE_STORAGE_CONNECTION_STRING,
});
