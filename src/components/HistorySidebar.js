import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Copy, Check, Clock, Loader2, ChevronLeft, 
  Terminal, Sparkles, Calendar, ArrowRight, Trash2
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// --- UTILITY ---
function cn(...inputs) { return twMerge(clsx(inputs)); }

// --- SUB-COMPONENTS ---

// 1. Copy Button with Tooltip feel
const ActionButton = ({ icon: Icon, label, onClick, active }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onClick(e); }}
    className={cn(
      "group flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-3 py-1.5 text-xs font-medium transition-all hover:bg-white/10 active:scale-95",
      active ? "text-green-400 border-green-500/20 bg-green-500/10" : "text-neutral-400 hover:text-white"
    )}
  >
    <Icon size={14} className={active ? "text-green-400" : "text-neutral-500 group-hover:text-white"} />
    <span>{label}</span>
  </button>
);

// 2. The Model Badge
const ModelBadge = ({ model }) => {
  const styles = {
    midjourney: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    dalle: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    gpt: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    default: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20"
  };
  const activeStyle = styles[model?.toLowerCase()] || styles.default;

  return (
    <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", activeStyle)}>
      {model || "General"}
    </span>
  );
};

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0 }
};

// --- MAIN COMPONENT ---
const HistorySidebar = ({ isOpen, onClose }) => {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // The "Popup" State
  const [copiedId, setCopiedId] = useState(null);

  // Fetch Logic
  useEffect(() => {
    if (isOpen && isLoaded && isSignedIn) fetchHistory();
  }, [isOpen]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await axios.get("/api/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(res.data);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          {/* Sidebar Container */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 z-[70] h-full w-full max-w-md border-l border-white/10 bg-[#0A0A0A] shadow-2xl md:w-[480px]"
          >
            
            {/* --- NAVIGATION HEADER --- */}
            <div className="flex h-16 items-center justify-between border-b border-white/5 px-6 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                {selectedItem ? (
                  <button 
                    onClick={() => setSelectedItem(null)}
                    className="group flex items-center gap-1 text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                    Back
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                      <Clock size={16} />
                    </div>
                    <h2 className="text-sm font-semibold text-white tracking-wide">Archives</h2>
                  </div>
                )}
              </div>
              
              <button 
                onClick={onClose}
                className="rounded-full p-2 text-neutral-500 hover:bg-white/5 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* --- CONTENT AREA (Switch between List & Detail) --- */}
            <div className="relative h-[calc(100vh-64px)] overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                
                {/* VIEW 1: THE LIST */}
                {!selectedItem ? (
                  <motion.div
                    key="list"
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -50, opacity: 0 }}
                    className="h-full overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10"
                  >
                    {loading ? (
                      <div className="flex h-full flex-col items-center justify-center gap-4 text-neutral-500">
                        <Loader2 size={32} className="animate-spin text-blue-500" />
                        <span className="text-xs font-mono uppercase tracking-widest">Loading Archives...</span>
                      </div>
                    ) : history.length === 0 ? (
                      <div className="flex h-full flex-col items-center justify-center text-center opacity-50">
                        <Terminal size={48} className="mb-4 text-neutral-600" />
                        <p className="text-neutral-400">No prompts generated yet.</p>
                      </div>
                    ) : (
                      <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="space-y-3"
                      >
                        {history.map((item) => (
                          <motion.div
                            key={item._id}
                            variants={itemVariants}
                            onClick={() => setSelectedItem(item)}
                            className="group cursor-pointer rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:border-blue-500/30 hover:bg-white/[0.05] hover:shadow-[0_0_20px_-10px_rgba(59,130,246,0.2)]"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <ModelBadge model={item.modelUsed} />
                              <span className="text-[10px] text-neutral-600 font-mono">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            
                            <h3 className="mb-1 text-sm font-medium text-neutral-300 line-clamp-1 group-hover:text-white transition-colors">
                              {item.originalPrompt}
                            </h3>
                            <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                              {item.enhancedPrompt}
                            </p>
                            
                            <div className="mt-3 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                              <span className="text-[10px] text-blue-400 font-medium flex items-center gap-1">
                                View Details <ArrowRight size={10} />
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  
                  /* VIEW 2: THE DETAIL POPUP (INSPECTOR) */
                  <motion.div
                    key="detail"
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 50, opacity: 0 }}
                    className="flex h-full flex-col"
                  >
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10">
                      
                      {/* Meta Info */}
                      <div className="mb-6 flex items-center justify-between">
                         <ModelBadge model={selectedItem.modelUsed} />
                         <div className="flex items-center gap-2 text-xs text-neutral-500">
                           <Calendar size={12} />
                           {new Date(selectedItem.createdAt).toLocaleString()}
                         </div>
                      </div>

                      {/* Original Input Section */}
                      <div className="mb-8">
                        <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-500">
                          Original Input
                        </h3>
                        <div className="rounded-xl border border-white/5 bg-neutral-900/50 p-4 text-sm text-neutral-300">
                          {selectedItem.originalPrompt}
                        </div>
                      </div>

                      {/* Enhanced Output Section (Hero) */}
                      <div className="relative">
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400">
                            Enhanced Result
                          </h3>
                          <Sparkles size={12} className="text-blue-400 animate-pulse" />
                        </div>
                        
                        <div className="relative overflow-hidden rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
                          {/* Code-like display */}
                          <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-blue-100/90">
                            {selectedItem.enhancedPrompt}
                          </pre>
                          
                          {/* Corner Glow */}
                          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
                        </div>
                      </div>

                    </div>

                    {/* Bottom Action Bar */}
                    <div className="border-t border-white/10 bg-black/40 p-6 backdrop-blur-md">
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <ActionButton 
                            icon={copiedId === "full" ? Check : Copy}
                            label={copiedId === "full" ? "Copied to Clipboard" : "Copy Enhanced Prompt"}
                            active={copiedId === "full"}
                            onClick={() => handleCopy(selectedItem.enhancedPrompt, "full")}
                          />
                        </div>
                        <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/5 text-red-500 transition-colors hover:bg-red-500/10">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default HistorySidebar;