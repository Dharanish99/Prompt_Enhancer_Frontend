import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Menu, X, Home, MessageSquare, Image as ImageIcon, Layers, Clock, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useClerk } from "@clerk/clerk-react";

const Navbar = ({ activeTab, onNavigate, onOpenHistory }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Clerk Hook for Sign Out
  const { signOut } = useClerk();

  // Detect scroll to adjust glass intensity
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { id: "home", label: "Home", icon: Home },
    { id: "chat", label: "Chat", icon: MessageSquare },
    { id: "image", label: "Visuals", icon: ImageIcon },
    { id: "templates", label: "Templates", icon: Layers },
  ];

  const handleLogout = () => {
    // Optional: Add any cleanup logic here (clearing local storage, etc.)
    signOut();
  };

  return (
    <>
      {/* --- DESKTOP FLOATING DOCK --- */}
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="fixed top-6 left-1/2 z-50 hidden -translate-x-1/2 transform md:block"
      >
        <div className={`flex items-center gap-1 rounded-full border border-white/10 bg-black/50 p-1.5 shadow-2xl backdrop-blur-xl transition-all duration-300 ${scrolled ? "bg-black/80 border-white/5" : ""}`}>
          
          {/* Logo Section */}
          <div 
            onClick={() => onNavigate("home")}
            className="mr-4 flex cursor-pointer items-center gap-2 pl-4"
          >
            <Sparkles size={16} className="text-blue-400" />
            <span className="font-semibold text-white tracking-wide text-sm">Prompt Studio</span>
          </div>

          {/* Navigation Pills */}
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className="relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-white/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                
                <span className={`relative z-10 flex items-center gap-2 ${isActive ? "text-white" : "text-neutral-400 hover:text-white"}`}>
                  <link.icon size={14} />
                  {link.label}
                </span>
              </button>
            );
          })}

          {/* --- RIGHT SIDE ACTIONS --- */}
          <div className="ml-2 flex items-center gap-2 border-l border-white/10 pl-2">
            {/* History Button */}
            <button 
                onClick={onOpenHistory}
                className="group relative rounded-full p-2 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
                title="View History"
            >
                <Clock size={16} />
            </button>
          
            {/* LOGOUT BUTTON (Replaces Pro) */}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-neutral-400 transition-all hover:bg-red-500/10 hover:text-red-400 active:scale-95"
              title="Sign Out"
            >
              <LogOut size={14} />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* --- MOBILE NAV (Standard Bar) --- */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-white/10 bg-black/80 px-6 py-4 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-blue-400" />
          <span className="font-bold text-white">Prompt Studio</span>
        </div>
        
        <div className="flex items-center gap-4">
            <button onClick={onOpenHistory} className="text-neutral-400 hover:text-white">
                <Clock size={20} />
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="text-white">
                {isOpen ? <X /> : <Menu />}
            </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-[60px] left-0 right-0 z-40 bg-neutral-900 border-b border-white/10 md:hidden overflow-hidden"
          >
            <div className="flex flex-col p-4">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    onNavigate(link.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-3 rounded-lg p-3 text-sm font-medium ${
                    activeTab === link.id ? "bg-white/10 text-white" : "text-neutral-400"
                  }`}
                >
                  <link.icon size={16} />
                  {link.label}
                </button>
              ))}

              {/* Mobile Logout */}
              <div className="mt-2 border-t border-white/10 pt-2">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg p-3 text-sm font-medium text-red-400 hover:bg-red-500/10"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;