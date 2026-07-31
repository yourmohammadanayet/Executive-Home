import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, ShieldCheck } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [show, setShow] = useState(true);
  const { user, userAccess, role, isAdmin, isMember } = useAuth();

  useEffect(() => {
    // Start fading out the entire splash screen after 3 seconds
    const hideTimer = setTimeout(() => {
      setShow(false);
    }, 3000);

    // Call onComplete to unmount after fade out is done
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3600);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white dark:bg-dark-surface dark:bg-dark-canvas overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
        >
          {/* Subtle glowing background accent */}
          <motion.div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ duration: 2 }}
          >
            <div className="w-[500px] h-[500px] bg-emerald-50 dark:bg-dark-teal/10 dark:bg-emerald-900/10 rounded-full blur-[120px] opacity-60"></div>
          </motion.div>

          <div className="relative flex flex-col items-center justify-center flex-1 w-full max-w-md mx-auto p-6">
            
            {/* The revealed text */}
            <motion.div
              className="text-center flex flex-col items-center justify-center z-10 w-full mb-12"
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#173F3A] dark:text-dark-text-primary dark:text-[#E2EBE9] font-bold tracking-widest" style={{ fontFamily: 'Georgia, serif' }}>
                EXECUTIVE
              </h1>
              
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "100%" }}
                transition={{ delay: 1, duration: 0.8, ease: "easeInOut" }}
                className="h-[1px] bg-gradient-to-r from-transparent via-[#23796F] dark:via-emerald-500 to-transparent mt-4 mb-3 w-4/5"
              />

              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
              >
                <p className="text-gray-500 dark:text-dark-text-secondary text-xs md:text-sm tracking-[0.3em] uppercase font-medium">
                  Workspace
                </p>
              </motion.div>
            </motion.div>

            {/* User Profile Section (Only visible if user is logged in and data is ready) */}
            {user && userAccess && (
              <motion.div
                className="z-10 flex flex-col items-center mt-8 bg-white dark:bg-dark-surface/50 backdrop-blur-sm p-6 rounded-3xl border border-[#D5E2DF] dark:border-dark-border shadow-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.8, ease: "easeOut" }}
              >
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-[#173F3A] dark:bg-dark-surface text-white flex items-center justify-center font-bold text-3xl shrink-0 shadow-lg border-4 border-white dark:border-dark-border mb-4 z-10 relative">
                    {userAccess.full_name?.charAt(0) || (isAdmin ? 'A' : 'M')}
                  </div>
                  
                  {/* Ping animation around avatar */}
                  <div className="absolute inset-0 rounded-full border-2 border-[#23796F] dark:border-emerald-500 animate-ping opacity-20"></div>
                  
                  {/* Role badge attached to avatar */}
                  <div className="absolute -bottom-2 -right-2 bg-white dark:bg-dark-surface dark:bg-dark-canvas rounded-full p-1 shadow-md z-20">
                    <div className="bg-[#23796F] dark:bg-emerald-600 text-white p-1.5 rounded-full">
                      {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                  </div>
                </div>
                
                <h2 className="text-xl font-bold text-[#173F3A] dark:text-dark-text-primary mb-1">
                  Welcome back, {userAccess.full_name?.split(' ')[0] || 'User'}
                </h2>
                
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-dark-teal/10 dark:bg-dark-teal/20 text-[#23796F] dark:text-dark-teal rounded-full text-xs font-bold tracking-wider uppercase border border-emerald-100 dark:border-emerald-800/50 mt-1">
                  {role}
                </div>
              </motion.div>
            )}

            {/* Loading indicator if user is not resolved yet or not logged in */}
            {(!user || !userAccess) && (
              <motion.div
                className="z-10 mt-12 flex flex-col items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8, duration: 0.8 }}
              >
                <div className="w-6 h-6 border-2 border-t-transparent border-[#23796F] dark:border-emerald-500 rounded-full animate-spin"></div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
