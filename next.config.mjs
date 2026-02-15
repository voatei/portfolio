/** @type {import('next').NextConfig} */
const repo = "portfolio";

const nextConfig = {
  output: "export",
  basePath: `/${repo}`,
  assetPrefix: `/${repo}/`,
  trailingSlash: true,

  images: {
    unoptimized: true,
  },
};

export default nextConfig;