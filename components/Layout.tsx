import React, { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div>
      <header>
        <nav>
          <Link href="/">
            <Image src="/logo.png" alt="Logo" width={50} height={50} />
          </Link>
          <Link href="/reports">Reports</Link>
          <Link href="/events">Events</Link>
        </nav>
      </header>
      <main>{children}</main>
      <footer>
        <p>&copy; {new Date().getFullYear()} Graston Dashboard</p>
      </footer>
    </div>
  );
}