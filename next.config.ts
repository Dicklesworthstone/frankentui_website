import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/webp"],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/web",
          destination: "/web/index.html",
        },
      ],
    };
  },

  async headers() {
    return [
      {
        source: "/web/pkg/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Must come after the rule above so it wins for this one path. The
      // manifest is what makes the immutable caching above safe: both the
      // standalone demo and the React loader read it first, then request each
      // package file with its SHA-256 as a query. Caching the manifest itself
      // would pin a visitor to a stale set of hashes.
      {
        source: "/web/pkg/manifest.json",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/web/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/web/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
