import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ImageIcon, Sparkles, Loader2, ArrowRight, 
  MessageCircleQuestion, CheckCircle2, RefreshCcw, Copy, Check 
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// --- UTILS ---
function cn(...inputs) { return twMerge(clsx(inputs)); }

const GlassCard = ({ children, className }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className={cn(
      "relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/60 backdrop-blur-xl transition-all",
      "p-4 md:p-6", // Tighter padding on mobile
      "h-auto md:h-full", // Adaptive height
      className
    )}
  >
    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-500/5 blur-3xl pointer-events-none" />
    <div className="relative z-10 flex flex-1 flex-col overflow-hidden">{children}</div>
  </motion.div>
);

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="absolute right-2 top-2 rounded-lg bg-white/5 p-2 text-neutral-400 hover:bg-white/10 hover:text-white transition-colors">
      {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
    </button>
  );
};

// Refine Toggle
const RefineToggle = ({ enabled, setEnabled }) => (
  <div 
    onClick={() => setEnabled(!enabled)}
    className="flex cursor-pointer items-center gap-2 rounded-full border border-white/5 bg-black/40 px-3 py-1.5 transition-colors hover:bg-black/60"
  >
    <span className={cn("text-[10px] md:text-xs font-medium transition-colors", enabled ? "text-white" : "text-neutral-500")}>
      Refine
    </span>
    <div className={cn("relative h-4 w-7 md:h-5 md:w-9 rounded-full transition-colors duration-300", enabled ? "bg-purple-500" : "bg-neutral-700")}>
      <motion.div 
        className="absolute top-0.5 md:top-1 h-3 w-3 rounded-full bg-white shadow-sm"
        animate={{ x: enabled ? (window.innerWidth < 768 ? 14 : 18) : (window.innerWidth < 768 ? 2 : 4) }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </div>
  </div>
);

// --- MAIN COMPONENT ---
// Now accepts props for state control (Remix Feature Support)
const ImagePromptEnhancer = ({ prompt, setPrompt, model, setModel }) => {
  const [step, setStep] = useState("input"); // 'input' -> 'questions' -> 'result'
  
  // Internal State
  const [isRefineMode, setIsRefineMode] = useState(false);
  
  // API Response State
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [finalResult, setFinalResult] = useState("");
  
  const [loading, setLoading] = useState(false);
  const questionsEndRef = useRef(null);

  // Auto-scroll to bottom when new questions appear
  useEffect(() => {
    if (step === 'questions' && questionsEndRef.current) {
        questionsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [step]);

  // Reset logic if prompt is cleared externally
  useEffect(() => {
    if (!prompt) {
       setStep("input");
       setFinalResult("");
    }
  }, [prompt]);

  const handleInitialAction = async () => {
    if (!prompt.trim()) return;
    setLoading(true);

    try {
      if (isRefineMode) {
        // MOCK SIMULATION (Replace with API):
        setTimeout(() => {
          setGeneratedQuestions([
            "What is the artistic style? (e.g., Cyberpunk, Oil Painting)",
            "What is the lighting mood? (e.g., Cinematic, Neon)",
            "Any specific camera angle? (e.g., Wide shot, Macro)"
          ]);
          setStep("questions");
          setLoading(false);
        }, 1500);

      } else {
        const res = await axios.post("/api/image-enhance", { 
          prompt: prompt, 
          model: model 
        });
        setFinalResult(res.data.enhanced);
        setStep("result");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error:", err);
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    setLoading(true);
    try {
      // MOCK SIMULATION:
      setTimeout(() => {
        const style = userAnswers[0] || "Photorealistic";
        const light = userAnswers[1] || "Cinematic lighting";
        const angle = userAnswers[2] || "Wide angle";
        setFinalResult(`/imagine prompt: ${prompt}, ${style}, ${light}, ${angle} --v 6.0 --ar 16:9`);
        setStep("result");
        setLoading(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep("input");
    setFinalResult("");
    setGeneratedQuestions([]);
    setUserAnswers({});
    // Note: We don't clear 'prompt' here so users can refine the same idea again if they want
  };

  return (
    <GlassCard className="h-full">
      
      {/* Header - Stays fixed at top */}
      <div className="flex-none mb-4 md:mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
            <ImageIcon size={18} className="md:w-5 md:h-5" />
          </div>
          <h2 className="text-sm md:text-xl font-semibold text-white">Diffusion Enhancer</h2>
        </div>
        
        {step === "input" && (
          <RefineToggle enabled={isRefineMode} setEnabled={setIsRefineMode} />
        )}
      </div>

      {/* Main Content Area - Handles Scroll */}
      <div className="flex-1 min-h-0 flex flex-col relative overflow-hidden"> 
        <AnimatePresence mode="wait">
          
          {/* === STEP 1: INPUT === */}
          {step === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-4 h-full"
            >
              {/* Model Select */}
              <div className="flex-none flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['midjourney', 'dalle', 'leonardo', 'banana'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setModel(m)}
                    className={cn(
                      "px-3 py-1.5 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-medium border transition-all capitalize whitespace-nowrap",
                      model === m
                        ? "bg-purple-500/20 border-purple-500/40 text-purple-200"
                        : "bg-white/5 border-white/5 text-neutral-500 hover:bg-white/10 hover:text-neutral-300"
                    )}
                  >
                    {m === 'banana' ? 'Stable Diff.' : m}
                  </button>
                ))}
              </div>

              {/* Text Area - Controlled by Props */}
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your creative vision..."
                className="flex-1 w-full resize-none rounded-xl bg-black/40 p-4 text-sm leading-relaxed text-neutral-300 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all border border-transparent focus:border-purple-500/20"
              />

              {/* Footer Button */}
              <div className="flex-none pt-2">
                <button
                  onClick={handleInitialAction}
                  disabled={loading || !prompt.trim()}
                  className="w-full md:w-auto group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg bg-neutral-800 border border-neutral-700 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-neutral-700 hover:border-neutral-600 active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin text-purple-400" />
                  ) : (
                    <>
                      <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {isRefineMode ? "Analyze & Refine" : "Enhance Now"}
                      </span>
                      {isRefineMode ? <MessageCircleQuestion size={16} className="text-purple-400" /> : <Sparkles size={16} className="text-purple-400" />}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* === STEP 2: QUESTIONS === */}
          {step === "questions" && (
            <motion.div
              key="questions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-full"
            >
              <div className="flex-none mb-3 rounded-lg bg-purple-500/10 border border-purple-500/20 p-3 text-xs md:text-sm text-purple-200 flex items-center gap-2">
                <Sparkles size={14} className="shrink-0" />
                <span>I need a few details to perfect this prompt:</span>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4 scrollbar-thin scrollbar-thumb-white/10 pb-4">
                {generatedQuestions.map((q, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <label className="text-[11px] md:text-xs font-medium text-neutral-400 ml-1 block">
                        {q}
                    </label>
                    <input 
                      type="text"
                      className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-3 text-sm text-white placeholder-neutral-700 focus:border-purple-500/50 focus:bg-purple-500/5 focus:outline-none transition-all"
                      placeholder="Type your preference..."
                      onChange={(e) => setUserAnswers(prev => ({ ...prev, [idx]: e.target.value }))}
                    />
                  </div>
                ))}
                <div ref={questionsEndRef} />
              </div>

              <div className="flex-none flex items-center justify-between pt-4 border-t border-white/5 bg-neutral-900/60 backdrop-blur-md">
                 <button 
                    onClick={() => setStep("input")} 
                    className="text-xs font-medium text-neutral-500 hover:text-white transition-colors px-2 py-2"
                 >
                    Back
                 </button>
                 <button
                  onClick={handleFinalize}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-xs md:text-sm font-semibold text-white hover:bg-purple-500 transition-colors shadow-lg shadow-purple-900/20"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : "Finalize Prompt"}
                  {!loading && <ArrowRight size={16} />}
                </button>
              </div>
            </motion.div>
          )}

          {/* === STEP 3: RESULT === */}
          {step === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col h-full gap-4"
            >
              <div className="flex-none flex items-center gap-2 text-sm text-green-400">
                <CheckCircle2 size={16} />
                <span className="font-semibold">Enhancement Complete</span>
              </div>

              <div className="flex-1 relative overflow-hidden rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
                <div className="mb-2 text-[10px] font-medium uppercase tracking-widest text-purple-400/80">
                  {model} Output
                </div>
                <pre className="whitespace-pre-wrap text-xs md:text-sm text-purple-100/90 font-mono h-full overflow-y-auto custom-scrollbar pb-8">
                  {finalResult}
                </pre>
                <CopyButton text={finalResult} />
              </div>

              <div className="flex-none flex justify-end">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-xs font-medium text-neutral-300 hover:bg-white/10 hover:text-white transition-all"
                >
                  <RefreshCcw size={14} />
                  Enhance Another
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </GlassCard>
  );
};

export default ImagePromptEnhancer;