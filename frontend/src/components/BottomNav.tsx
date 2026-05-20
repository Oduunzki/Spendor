import { NavLink } from 'react-router-dom';
import { Home, Camera, ShieldCheck, Clock, BarChart2, User } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Hjem' },
  { to: '/scan', icon: Camera, label: 'Skann' },
  { to: '/resisted', icon: ShieldCheck, label: 'Motstod' },
  { to: '/waiting', icon: Clock, label: 'Venteliste' },
  { to: '/insights', icon: BarChart2, label: 'Innsikt' },
  { to: '/profile', icon: User, label: 'Profil' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 cursor-pointer min-w-[44px] min-h-[44px] justify-center px-2 rounded-xl transition-all duration-200
              ${isActive
                ? 'text-purple bg-purple/10'
                : 'text-[#6B7280] hover:text-[#F9FAFB]'
              }`
            }
          >
            <Icon size={20} strokeWidth={1.5} />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
