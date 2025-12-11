import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Plus, LayoutTemplate, Image as ImageIcon, 
  Code, PenTool, Briefcase, Heart, Share2, Copy, Loader2, X 
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// --- UTILS ---
function cn(...inputs) { return twMerge(clsx(inputs)); }

const CATEGORIES = [
  { id: "all", label: "All Templates", icon: LayoutTemplate },
  { id: "image", label: "Visuals", icon: ImageIcon },
  { id: "code", label: "Engineering", icon: Code },
  { id: "writing", label: "Content", icon: PenTool },
  { id: "business", label: "Business", icon: Briefcase },
];

// --- ANIMATION CONFIG ---
// Elite "Apple-style" physics
const springTransition = { type: "spring", stiffness: 350, damping: 30 };
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08 // Fast, rhythmic cascade
    }
  }
};
const cardVariant = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 200, damping: 20 }
  }
};

// --- SUB-COMPONENTS ---

const TemplateCard = ({ template, onRemix }) => {
  const isImage = template.category === "image";

  return (
    <motion.div
      variants={cardVariant}
      className="group relative mb-6 break-inside-avoid overflow-hidden rounded-2xl border border-white/5 bg-neutral-900/50 hover:border-white/10 hover:shadow-[0_0_30px_-15px_rgba(255,255,255,0.1)] transition-all"
    >
      {/* Visual Hero (Only for Image Templates) */}
      {isImage && template.previewImage && (
        <div className="relative h-56 w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent z-10" />
          <img 
            src={template.previewImage} 
            alt={template.title} 
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
          <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
             <button className="rounded-full bg-black/60 p-2 text-white backdrop-blur-md hover:bg-white hover:text-black transition-colors">
                <Share2 size={14} />
             </button>
          </div>
          <div className="absolute bottom-3 left-3 z-20">
            <span className="rounded-full bg-black/60 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md border border-white/10 shadow-lg">
              {template.modelConfig || "Midjourney"}
            </span>
          </div>
        </div>
      )}

      {/* Content Body */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className={cn(
            "rounded-lg p-2 transition-colors", 
            isImage ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"
          )}>
            {isImage ? <ImageIcon size={16} /> : <LayoutTemplate size={16} />}
          </div>
          {/* Subtle Tags */}
          <div className="flex gap-1">
             {template.tags?.slice(0, 2).map((tag, i) => (
                <span key={i} className="text-[10px] text-neutral-600 font-medium uppercase tracking-wider bg-white/5 px-1.5 py-0.5 rounded-md">
                   {tag}
                </span>
             ))}
          </div>
        </div>

        <h3 className="mb-2 text-lg font-bold text-white group-hover:text-blue-400 transition-colors duration-300">
          {template.title}
        </h3>
        
        <p className="mb-6 line-clamp-3 text-xs leading-relaxed text-neutral-400 font-mono opacity-80 group-hover:opacity-100 transition-opacity">
          {template.promptContent}
        </p>

        <button
          onClick={() => onRemix(template)}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-white hover:text-black hover:scale-[1.02] active:scale-95"
        >
          <Copy size={14} />
          Remix Template
        </button>
      </div>
    </motion.div>
  );
};

const CreateModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({ title: "", category: "image", promptContent: "", tags: "" });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" 
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0A0A0A] shadow-2xl"
      >
        <div className="border-b border-white/5 p-6 flex items-center justify-between bg-white/[0.02]">
           <h2 className="text-xl font-bold text-white">New Template</h2>
           <button onClick={onClose} className="rounded-full p-1 hover:bg-white/10 transition-colors"><X size={20} className="text-neutral-500" /></button>
        </div>

        <div className="p-6 space-y-5">
            <div>
               <label className="text-xs font-medium text-neutral-500 ml-1 mb-1.5 block">TITLE</label>
               <input 
                  placeholder="e.g. Neon Cyberpunk City"
                  className="w-full rounded-xl bg-neutral-900 border border-white/10 p-3 text-white focus:border-blue-500/50 focus:bg-blue-500/5 outline-none transition-all"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
               />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-xs font-medium text-neutral-500 ml-1 mb-1.5 block">CATEGORY</label>
                  <div className="relative">
                    <select 
                        className="w-full appearance-none rounded-xl bg-neutral-900 border border-white/10 p-3 text-white outline-none focus:border-blue-500/50"
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                        <option value="image">Visual Prompt</option>
                        <option value="code">Code Snippet</option>
                        <option value="writing">Writing Assistant</option>
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500">▼</div>
                  </div>
               </div>
               <div>
                  <label className="text-xs font-medium text-neutral-500 ml-1 mb-1.5 block">TAGS</label>
                  <input 
                    placeholder="scifi, neon, 4k"
                    className="w-full rounded-xl bg-neutral-900 border border-white/10 p-3 text-sm text-white focus:border-blue-500/50 outline-none"
                    value={formData.tags}
                    onChange={e => setFormData({...formData, tags: e.target.value})}
                  />
               </div>
            </div>

            <div>
               <label className="text-xs font-medium text-neutral-500 ml-1 mb-1.5 block">PROMPT CONTENT</label>
               <textarea 
                  placeholder="Paste your engineered prompt here..."
                  className="w-full h-32 rounded-xl bg-neutral-900 border border-white/10 p-3 text-white focus:border-blue-500/50 focus:bg-blue-500/5 outline-none resize-none font-mono text-sm leading-relaxed"
                  value={formData.promptContent}
                  onChange={e => setFormData({...formData, promptContent: e.target.value})}
               />
            </div>

            <button 
              onClick={() => onSubmit(formData)}
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-3.5 font-bold text-white hover:bg-blue-500 active:scale-95 transition-all flex justify-center gap-2 mt-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Publish to Gallery"}
            </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const TemplatesGallery = ({ onRemix }) => {
  const { getToken } = useAuth();
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Initial Fetch
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await axios.get("/api/templates");
      setTemplates(res.data);
    } catch (err) {
      console.error("Failed to load templates");
      // Mock data
      setTemplates([
        { _id: 1, title: "Cyberpunk City", category: "image", promptContent: "A futuristic city with neon lights, rain, and flying cars, cinematic lighting --v 6.0", tags: ["scifi", "neon"], modelConfig: "midjourney", previewImage: "https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?q=80&w=1000&auto=format&fit=crop" },
        { _id: 2, title: "React Component Generator", category: "code", promptContent: "Act as a Senior React Developer. Build a responsive Navbar component...", tags: ["react", "frontend"] },
        { _id: 3, title: "SEO Blog Post", category: "writing", promptContent: "Write a 1500 word blog post about AI trends optimized for SEO...", tags: ["marketing", "seo"] },
        { _id: 4, title: "Portrait Photography", category: "image", promptContent: "Portrait of an old man, highly detailed, 85mm lens...", tags: ["photo", "realism"], previewImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop" },
        { _id: 5, title: "Python API Route", category: "code", promptContent: "Create a FastAPI endpoint that accepts JSON...", tags: ["python", "backend"] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    if(!data.title || !data.promptContent) return;
    setCreating(true);
    try {
      const token = await getToken();
      await axios.post("/api/templates", {
        ...data,
        tags: data.tags.split(",").map(t => t.trim())
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsModalOpen(false);
      fetchTemplates(); 
    } catch (err) {
      alert("Failed to create template");
    } finally {
      setCreating(false);
    }
  };

  // Memoize Filter Logic to prevent stutter
  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      const matchesCategory = activeCategory === "all" || t.category === activeCategory;
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                            t.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search, templates]);

  return (
    <div className="min-h-screen px-4 md:px-6 pb-20 pt-24 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <motion.div initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0}}>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
            Discovery <span className="text-neutral-500">Lab</span>
          </h1>
          <p className="text-neutral-400 max-w-md">
            Explore and remix engineered prompts from the community.
          </p>
        </motion.div>
        
        <motion.div 
            initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}}
            className="flex items-center gap-3"
        >
          <div className="relative group w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 transition-colors group-focus-within:text-blue-400" size={16} />
            <input 
              placeholder="Search..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-64 rounded-full bg-[#0A0A0A] border border-white/10 py-2.5 pl-10 pr-4 text-sm text-white focus:border-blue-500/50 focus:bg-white/[0.02] outline-none transition-all"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black hover:bg-neutral-200 transition-colors active:scale-95"
          >
            <Plus size={16} />
            <span className="hidden md:inline">Create</span>
          </button>
        </motion.div>
      </div>

      {/* SMOOTH TABS */}
      <div className="sticky top-20 z-40 bg-black/80 backdrop-blur-xl py-4 -mx-4 px-4 mb-6 border-b border-white/5 md:static md:bg-transparent md:border-0 md:p-0 md:mb-8">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors outline-none",
                  isActive ? "text-white" : "text-neutral-500 hover:text-neutral-300"
                )}
              >
                {/* Background Pill Animation */}
                {isActive && (
                  <motion.div
                    layoutId="activeCategory"
                    className="absolute inset-0 bg-white/10 rounded-full"
                    transition={springTransition}
                  />
                )}
                <cat.icon size={14} className="relative z-10" />
                <span className="relative z-10">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* OPTIMIZED MASONRY GRID */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={40} /></div>
      ) : filteredTemplates.length === 0 ? (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-neutral-500"
        >
            <Search size={48} className="mb-4 opacity-20" />
            <p>No templates found for this category.</p>
        </motion.div>
      ) : (
        // KEY CHANGE: We use a key on the container to force a remount when category changes. 
        // This ensures the stagger animation runs cleanly every time without column reflow jank.
        <motion.div 
            key={activeCategory} 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 pb-20"
        >
            {filteredTemplates.map((template) => (
              <TemplateCard key={template._id} template={template} onRemix={onRemix} />
            ))}
        </motion.div>
      )}

      {/* CREATE MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <CreateModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onSubmit={handleCreate}
            loading={creating}
          />
        )}
      </AnimatePresence>

    </div>
  );
};

export default TemplatesGallery;