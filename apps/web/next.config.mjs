function trimEnvValue(value) {
  if (!value) return undefined
  const trimmed = value.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim()
  }
  return trimmed
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui", "@workspace/copilot"],
  experimental: {
    optimizePackageImports: ["@workspace/copilot", "lucide-react", "recharts"],
  },
  async rewrites() {
    const apiOrigin =
      trimEnvValue(process.env.INTERNAL_API_URL)?.replace(/\/$/, "") ??
      "http://127.0.0.1:3001"
    return [
      {
        source: "/api/:path*",
        destination: `${apiOrigin}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
