/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Produces .next/standalone: a self-contained server + traced node_modules
  // that scripts/build-package.ts archives into a platform-agnostic deployable.
  output: "standalone",
};

export default nextConfig;
