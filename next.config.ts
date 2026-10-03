import type { NextConfig } from 'next';

const config: NextConfig = {
  output: 'export',
  trailingSlash: true,
  productionBrowserSourceMaps: false,
};

export default config;
