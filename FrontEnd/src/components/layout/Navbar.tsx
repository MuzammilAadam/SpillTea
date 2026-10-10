import React, { useState } from 'react';
import { Feather, Menu, X, Compass, Mail, Bookmark, BookOpen, User, Sparkles } from 'lucide-react';
import { TeacupIcon, OliveBranch } from '../common/Botanicals';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  savedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, savedCount }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home', icon: BookOpen },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'write', label: 'Write', icon: Feather },
    { id: 'unsent-letters', label: 'Unsent Letters', icon: Mail },
    { id: 'saved', label: 'Saved', icon: Bookmark, badge: savedCount > 0 ? savedCount : null },
    { id: 'myspace', label: 'My Space', icon: User },
  ];

  const handleNavClick = (viewId: string) => {
    onNavigate(viewId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#B7B99A] text-[#FFFCF8] shadow-md border-b border-[#666747]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Area */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none"
            >
              <div className="p-1.5 rounded-full bg-[#FFFCF8]/20 group-hover:bg-[#FFFCF8]/30 transition-colors">
                <TeacupIcon className="w-5 h-5 text-[#FFFCF8]" />
              </div>
              <div className="flex flex-col">
                <span className="font-editorial text-2xl font-bold tracking-tight text-[#FFFCF8] leading-none">
                  SpillTea
                </span>
                <span className="font-note text-xs text-[#FFF8F0]/85 -mt-0.5 tracking-wider">
                  anonymous sanctuary
                </span>
              </div>
            </button>
            <div className="hidden lg:block ml-2 opacity-60">
              <OliveBranch className="w-10 h-4 text-[#FFF8F0]" />
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-3 text-sm font-sans-clean font-medium">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`relative px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-[#666747]/30 text-white font-semibold shadow-inner'
                      : 'text-[#FFF8F0]/90 hover:text-white hover:bg-[#666747]/20'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 opacity-90" />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-[#D8A0A5] text-[#44352F] font-bold">
                      {link.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#F7DDE1] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action CTA & Mobile Trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavClick('write')}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F7DDE1] text-[#44352F] hover:bg-[#FFFCF8] hover:text-[#44352F] transition-all text-xs sm:text-sm font-serif font-medium shadow-sm hover:shadow hover:scale-[1.02] cursor-pointer"
            >
              <Feather className="w-3.5 h-3.5 text-[#B98289]" />
              <span>Spill your tea</span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#FFFCF8] hover:bg-[#666747]/30 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#A7AA89] border-t border-[#666747]/30 px-4 pt-3 pb-5 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentView === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-[#666747]/40 text-white font-bold'
                    : 'text-[#FFF8F0] hover:bg-[#666747]/20'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 opacity-90" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-[#D8A0A5] text-[#44352F] font-bold">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
