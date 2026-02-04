'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && menuRef.current && !menuRef.current.contains(e.target as Node) && 
          buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const navLinks = [
    { href: '/news', label: 'News' },
    { href: '/teams', label: 'Teams' },
    { href: '/matches', label: 'Matches' },
    { href: '/competitions', label: 'Competitions' },
    { href: '/admin', label: 'Admin' },
    { href: '/referee', label: 'Referee' },
    { href: '/secretariat', label: 'Secretariat' },
    { href: '/public', label: 'Public' }
  ];

  const authLinks = [
    { href: '/login', label: 'Login' },
    { href: '/signup', label: 'Sign Up' }
  ];

  const isActiveLink = (href: string) => pathname === href;

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-blue-600">
                BIFA
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className={`px-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActiveLink(link.href)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Links */}
          <div className="hidden md:flex md:items-center md:space-x-2">
            {authLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  link.href === '/signup'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile: Auth Links + Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Auth Links - Always Visible */}
            <div className="flex items-center space-x-1">
              {authLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    link.href === '/signup'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            
            {/* Hamburger Menu Button */}
            <button 
              ref={buttonRef}
              onClick={() => setIsOpen(!isOpen)} 
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              <div className="w-5 h-5 flex flex-col justify-center items-center">
                <span className={`block h-0.5 w-5 bg-current transition-all duration-300 ${
                  isOpen ? 'rotate-45 translate-y-0.5' : '-translate-y-1'
                }`} />
                <span className={`block h-0.5 w-5 bg-current transition-all duration-300 ${
                  isOpen ? 'opacity-0' : 'opacity-100'
                }`} />
                <span className={`block h-0.5 w-5 bg-current transition-all duration-300 ${
                  isOpen ? '-rotate-45 -translate-y-0.5' : 'translate-y-1'
                }`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="border-t border-gray-200 bg-white shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className={`block px-4 py-3 rounded-md text-base font-medium transition-colors ${
                    isActiveLink(link.href)
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Mobile backdrop */}
      <div className={`fixed inset-0 bg-black/20 z-40 md:hidden transition-opacity duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`} onClick={() => setIsOpen(false)} />
    </header>
  );
}