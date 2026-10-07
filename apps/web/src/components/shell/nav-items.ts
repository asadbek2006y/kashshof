import { BookOpen, Heart, Home, LifeBuoy, MessageCircle } from 'lucide-react';

/** Desktop header navigation — text only. */
export const HEADER_NAV = [
  { href: '/ask', key: 'findSupport' },
  { href: '/explore', key: 'browse' },
  { href: '/organizations', key: 'organizations' },
  { href: '/how-it-works', key: 'howItWorks' },
] as const;

/** Mobile bottom navigation — five items, labels always visible. */
export const BOTTOM_NAV = [
  { href: '/', key: 'home', icon: Home },
  { href: '/ask', key: 'findShort', icon: MessageCircle },
  { href: '/explore', key: 'browseShort', icon: BookOpen },
  { href: '/saved', key: 'savedShort', icon: Heart },
  { href: '/safety', key: 'urgentShort', icon: LifeBuoy },
] as const;

export function isActive(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}
