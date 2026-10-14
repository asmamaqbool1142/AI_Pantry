import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PantryPilot AI',
  description: 'A household cooking and grocery planner for Pakistani families.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
