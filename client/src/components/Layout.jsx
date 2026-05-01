import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="app-shell-bg min-h-screen">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="wellness-page-shell flex-1 lg:ml-64 min-h-screen pt-16">
          <div className="page-ambient-3d" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="relative z-10 p-4 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 18, scale: 0.985 }}
                animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.99 }}
                transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
