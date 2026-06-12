/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui", "@workspace/copilot"],
  experimental: {
    optimizePackageImports: ["@workspace/copilot", "lucide-react", "recharts"],
  },
}

export default nextConfig
