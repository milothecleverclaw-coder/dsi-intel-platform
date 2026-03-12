import type { NextConfig } from "next";
import * as fs from 'fs';
import * as path from 'path';

// Read VERSION from VERSION file
const versionFilePath = path.join(process.cwd(), 'VERSION');
const version = fs.readFileSync(versionFilePath, 'utf-8').trim();

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    // Inject app version at build time
    NEXT_PUBLIC_APP_VERSION: version,
  },
};

export default nextConfig;
