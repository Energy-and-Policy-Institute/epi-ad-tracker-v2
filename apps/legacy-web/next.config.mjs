await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  eslint: {
    ignoreDuringBuilds: true
  },
  i18n: {
    locales: ["en"],
    defaultLocale: "en"
  },
  images: {
    remotePatterns: [
      {
        hostname: "epi-ad-screenshots.s3.us-east-2.amazonaws.com",
        protocol: "https"
      },
      {
        hostname: "epi-ad-screenshot.s3.us-east-2.amazonaws.com",
        protocol: "https"
      },
      {
        hostname: "i5.walmartimages.com",
        protocol: "https"
      }
    ]
  },
  reactStrictMode: true,
  transpilePackages: ["@repo/api", "@repo/db"]
};

export default config;
