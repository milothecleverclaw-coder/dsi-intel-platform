# API Testing Framework Setup

Champ wants automated tests for Next.js API endpoints (specifically starting with `/api/evidence/preview`) so we can verify they work *before* asking him to test on the UI.

## What Jack needs to do:

1. **Install Testing Tools**:
   ```bash
   cd /tmp/dsi/app
   npm install -D vitest @testing-library/react @testing-library/dom node-mocks-http
   ```

2. **Setup Vitest**:
   Create `vitest.config.ts` in `/tmp/dsi/app`:
   ```typescript
   import { defineConfig } from 'vitest/config'
   import react from '@vitejs/plugin-react'
   import path from 'path'

   export default defineConfig({
     plugins: [react()],
     test: {
       environment: 'node',
       globals: true,
       setupFiles: ['./setupTests.ts'],
       alias: {
         '@': path.resolve(__dirname, './')
       }
     }
   })
   ```
   Create `setupTests.ts`:
   ```typescript
   import { config } from 'dotenv';
   // Load .env.local for tests
   config({ path: '.env.local' });
   ```

3. **Write the Test**:
   Create `/tmp/dsi/app/__tests__/api/evidence/preview.test.ts`.
   This test should:
   - Construct a mock `Request` object with `FormData` containing a small dummy text file.
   - Call the `POST` function from `/app/api/evidence/preview/route.ts`.
   - Assert that the response is `200 OK` and contains the extracted text.

   *Note: Since we are using real Azure credentials from `.env.local`, this will be an integration test hitting the real Azure endpoint. Make sure the dummy file is tiny (e.g., a 1-line text file).*

4. **Add to package.json**:
   ```json
   "scripts": {
     "test": "vitest run"
   }
   ```

5. **Run the test**:
   ```bash
   npm run test
   ```

6. **Commit and Push**:
   ```bash
   git add -A
   git commit -m "test: add vitest and integration test for document preview endpoint"
   ```

## Rules for Jack going forward:
Whenever you build or modify an API endpoint, you MUST write a test for it and ensure `npm run test` passes before completing your task. This stops the back-and-forth debugging with Champ.