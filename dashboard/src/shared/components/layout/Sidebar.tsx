// ============================================
// SIDEBAR - Navigation sidebar component
// ============================================
"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

// Navigation items for the sidebar
const navItems = [
  { nameKey: "nav.feed", href: "/", icon: "📰" },
  { nameKey: "nav.trending", href: "/trending", icon: "🔥" },
  { nameKey: "nav.favorites", href: "/favorites", icon: "⭐" },
  { nameKey: "nav.settings", href: "/settings", icon: "⚙️" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  // Track whether we are on a desktop-width screen (≥ 1024px)
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Sidebar content — shared between mobile and desktop renders
  const sidebarContent = (
    <aside
      className="h-full w-64 bg-white dark:bg-gray-800 flex flex-col shadow-lg border-r border-gray-200 dark:border-gray-700"
    >
      {/* Logo / Brand */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">
          📊 Dashboard
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
          {t("nav.personalizedFeed")}
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, type: "spring" }}
            >
              <Link
                href={item.href}
                onClick={onClose}
                className={
                  `relative flex items-center gap-3 px-4 py-3.5 rounded-xl
                  transition-all duration-300 overflow-hidden group
                  ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 font-bold"
                      : "text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 font-semibold"
                  }`
                }
              >
                {/* Animated background on hover */}
                {!isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 
                                  opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}
                <motion.span 
                  className="text-2xl relative z-10"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {item.icon}
                </motion.span>
                <span className="relative z-10">{t(item.nameKey)}</span>
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>
    </aside>
  );

  // ---- DESKTOP: always shown as a static sidebar (no animation) ----
  if (isDesktop) {
    return <div className="hidden lg:flex flex-shrink-0">{sidebarContent}</div>;
  }

  // ---- MOBILE: slide-in drawer with overlay ----
  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <motion.div
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-0 left-0 z-30 h-full lg:hidden"
      >
        {sidebarContent}
      </motion.div>
    </>
  );
}
