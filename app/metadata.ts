import type { Metadata } from 'next';

// Export metadata for the app
export const metadata: Metadata = {
  title: 'Designer Bag Store',
  description: 'Premium designer bags for every occasion',
  keywords: ['bags', 'designer', 'fashion', 'accessories', 'luxury'],
  authors: [{ name: 'Talysson Oliver' }],
  creator: 'Talysson Oliver',
  publisher: 'Designer Bag Store',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};
