import { motion } from "framer-motion";
import { 
  ArrowRight, Sparkles, Image as ImageIcon, 
  Terminal, MousePointer2, Keyboard, Zap, 
  Github, Linkedin, Mail, CheckCircle2
} from "lucide-react";

// --- ANIMATED BACKGROUND ---
const BackgroundGrid = () => (
  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
    <div 
      className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
      style={{ maskImage: "radial-gradient(ellipse 60% 50% at 50% 0%, #000 70%, transparent 100%)" }}
    />
    <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[1000px] bg-blue-500/10 blur-[120px] rounded-full mix-blend-screen" />
  </div>
);

// --- REUSABLE COMPONENTS ---
const SectionHeading = ({ badge, title, subtitle }) => (
  <div className="mb-12 text-center">
    {badge && (
      <span className="mb-3 inline-block rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
        {badge}
      </span>
    )}
    <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">{title}</h2>
    <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-400">{subtitle}</p>
  </div>
);

const GlassCard = ({ children, className }) => (
  <div className={`relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/50 p-8 backdrop-blur-sm transition-colors hover:border-white/20 ${className}`}>
    {children}
  </div>
);

const HomePage = ({ onNavigate }) => {
  return (
    <div className="relative min-h-screen font-sans text-white selection:bg-blue-500/30">
      <BackgroundGrid />

      {/* ================= HERO SECTION ================= */}
      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pt-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-blue-400 backdrop-blur-sm">
            <Sparkles size={12} className="animate-pulse" />
            <span>v2.0 Neural Engine Live</span>
          </div>

          <h1 className="text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl">
            Enhance Your AI Prompts <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              With One Click.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-400 leading-relaxed">
            Unlock clearer, more effective prompts for ChatGPT, DALL·E, Midjourney, and more. Stop guessing and start engineering.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onNavigate("chat")}
              className="group relative flex h-12 items-center gap-2 overflow-hidden rounded-full bg-white px-8 text-sm font-bold text-black transition-all hover:bg-neutral-200 hover:scale-105"
            >
              <span>Try General Enhancer</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => onNavigate("image")}
              className="flex h-12 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/20"
            >
              <ImageIcon size={16} className="text-pink-400" />
              <span>Try Image Enhancer</span>
            </button>
          </div>
        </motion.div>
      </section>

      {/* ================= WHAT IS PROMPT STUDIO? ================= */}
      <section className="relative z-10 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            
            {/* Left: Text Content */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-6">What Does This App Do?</h2>
              <p className="text-lg text-neutral-400 leading-relaxed mb-6">
                Prompt Studio takes your basic AI input and intelligently upgrades it with 
                <span className="text-white font-semibold"> context</span>, 
                <span className="text-white font-semibold"> structure</span>, and 
                <span className="text-white font-semibold"> intent</span>.
              </p>
              <p className="text-neutral-500 mb-8">
                Whether you're chatting with an LLM, generating art, or writing code, vague instructions lead to poor results. We bridge that gap using advanced prompt engineering techniques.
              </p>
              
              <ul className="space-y-4">
                {[
                  "Optimized for GPT-4, Claude, & Llama",
                  "Midjourney Parameters & Art Styles",
                  "Reduces Hallucinations in Code"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-neutral-300">
                    <CheckCircle2 size={20} className="text-blue-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Right: Interactive Terminal Visual */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <GlassCard className="p-0 border-neutral-800 bg-black/80 font-mono text-sm">
                <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-500/50" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/50" />
                    <div className="h-3 w-3 rounded-full bg-green-500/50" />
                  </div>
                  <span className="ml-2 text-xs text-neutral-500">prompt_engine.ts</span>
                </div>
                
                <div className="p-6 space-y-6">
                  <div>
                    <div className="text-xs text-red-400 mb-1 flex items-center gap-2">
                       <span className="opacity-50">#</span> INPUT (Your Prompt)
                    </div>
                    <div className="text-neutral-400">"Write me a react component for a button"</div>
                  </div>

                  <div className="h-px w-full bg-white/10" />

                  <div>
                    <div className="text-xs text-emerald-400 mb-1 flex items-center gap-2">
                       <span className="opacity-50">#</span> OUTPUT (Enhanced)
                    </div>
                    <div className="text-blue-100">
                      "Create a robust, reusable React Button component using TypeScript and Tailwind CSS. Include props for variants (primary, secondary, outline), sizes (sm, md, lg), and loading states. Ensure accessibility (ARIA) compliance."
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="relative z-10 border-t border-white/5 bg-white/[0.02] px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading 
            badge="Workflow"
            title="How It Works"
            subtitle="Three simple steps to go from vague idea to professional output."
          />

          <div className="grid gap-8 md:grid-cols-3 relative">
            {/* Connecting Line (Desktop) */}
            <div className="absolute top-12 left-0 hidden h-px w-full bg-gradient-to-r from-transparent via-blue-500/20 to-transparent md:block" />

            {[
              { 
                icon: MousePointer2, 
                title: "1. Choose a Tool", 
                desc: "Select General Text Enhancer, Image Generation, or browse Templates." 
              },
              { 
                icon: Keyboard, 
                title: "2. Paste Prompt", 
                desc: "Type your raw input, rough idea, or basic command into the editor." 
              },
              { 
                icon: Zap, 
                title: "3. Get Enhanced", 
                desc: "Instantly receive a structured, context-rich prompt ready for AI." 
              }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative z-10"
              >
                <GlassCard className="flex flex-col items-center text-center h-full hover:bg-neutral-800/80">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-400 shadow-inner ring-1 ring-white/10">
                    <step.icon size={32} />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-white">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-neutral-400">{step.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FOOTER / CONTACT ================= */}
      <footer className="border-t border-white/10 bg-black pt-16 pb-8">
        <div className="mx-auto max-w-7xl px-6 text-center">
          
          <div className="mb-8 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 shadow-lg shadow-blue-500/20">
              <Sparkles className="text-white" size={24} />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white">Prompt Studio</h2>
          <p className="mt-2 text-neutral-500">Built for the next generation of Prompt Engineers.</p>

          <div className="mt-8 flex justify-center gap-6">
            <a href="#" className="rounded-full bg-white/5 p-3 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white">
              <Github size={20} />
            </a>
            <a href="#" className="rounded-full bg-white/5 p-3 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white">
              <Linkedin size={20} />
            </a>
            <a href="#" className="rounded-full bg-white/5 p-3 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white">
              <Mail size={20} />
            </a>
          </div>

          <div className="mt-16 border-t border-white/10 pt-8 text-xs text-neutral-600">
            <p>
              &copy; {new Date().getFullYear()} Prompt Studio. Made with <span className="text-red-500">♥</span> by [Your Name].
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;