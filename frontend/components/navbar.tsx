'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, LogOut, UserPlus, User, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '@/lib/auth-context';
import { useState, useRef, useEffect } from 'react';

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    router.push('/login');
    setShowDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl leading-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  AI Vision
                </span>
                <span className="text-xs text-muted-foreground">共创无限宇宙</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            <Link href="/novels">
              <Button variant="ghost" className="gap-2 font-medium">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="hidden sm:inline">探索宇宙</span>
              </Button>
            </Link>

            {user ? (
              <>
                <Link href="/novels/new">
                  <Button className="gap-2 shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="hidden sm:inline">创造宇宙</span>
                  </Button>
                </Link>

                {/* User dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <Button
                    variant="ghost"
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 px-3"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="hidden md:inline font-medium">{user.username}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                  </Button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-background border-2 rounded-lg shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-medium">{user.username}</p>
                        <p className="text-xs text-muted-foreground">创世者</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 hover:bg-muted flex items-center gap-3 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>登出</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="gap-2 font-medium">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span className="hidden sm:inline">登录</span>
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="gap-2 shadow-md hover:shadow-lg transition-all">
                    <UserPlus className="h-4 w-4" />
                    <span className="hidden sm:inline">成为创世者</span>
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
