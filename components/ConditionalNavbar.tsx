'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();
  
  // Don't show navbar on landing page and login page
  if (pathname === '/' || pathname === '/login') {
    return null;
  }
  
  return <Navbar />;
}
