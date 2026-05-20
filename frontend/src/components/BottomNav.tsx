// Spendor — BottomNav
// Trimmed from 6 → 5 tabs. "Motstod" lives as a primary CTA on the dashboard
// instead of competing for a tab slot. Cleaner, larger touch targets, less
// visual noise. Active state uses mint accent (matches "saved money" semantic).

import { NavLink } from 'react-router-dom';
import { Home, Camera, Clock, BarChart2, User } from 'lucide-react';

const navItems = [
  { to: '/',         icon: Home,      label: 'Hjem' },
  { to: '/scan',     icon: Camera,    label: 'Skann' },
  { to: '/waiting',  icon: Clock,     label: 'Venteliste' },
  { to: '/insights', icon: BarChart2, label: 'Innsikt' },
  { to: '/profile',  icon: User,      label: 'Profil' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      {/* gradient fade so content scrolling under the nav doesn't bleed against it */}
      <div className="absolute inset-x-0 bottom-0 h-32 pointer-events-none"
           style={{ background: 'linear-gradient(180deg, rgba(14,13,23,0) 0%, rgba(14,13,23,.9) 40%, #0E0D17 100%)' }} />
      <div className="relative pointer-events-auto px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-2">
        <div className="bg-card/90 backdrop-blur-xl border border-border rounded-3xl px-1 py-1.5 flex items-center justify-around">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 cursor-pointer min-w-[52px] min-h-[48px] justify-center px-2 rounded-2xl transition-colors duration-200
                ${isActive
                  ? 'text-green'
                  : 'text-[#6E6889] hover:text-[#B8B2D1]'
                }`
              }
            >
              <Icon size={20} strokeWidth={2} />
              <span className="text-[10px] font-bold tracking-wide">{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
