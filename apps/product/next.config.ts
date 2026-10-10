import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ['@credport/ui', '@credport/sdk', '@credport/types', '@credport/credentials', '@credport/did-stellar'],
};

export default withNextIntl(nextConfig);
