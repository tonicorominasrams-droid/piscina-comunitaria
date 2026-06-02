/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // recharts és un paquet ESM gran; transpilar-lo evita errors de chunks
  // durant el build de producció.
  transpilePackages: ["recharts"],
};

export default nextConfig;
