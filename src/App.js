import { useState } from "react";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import ImagePromptEnhancer from "./components/ImagePromptEnhancer";
import TemplatesGallery from "./components/TemplatesGallery"; // New Import
import HistorySidebar from "./components/HistorySidebar";
import { useAuth } from "@clerk/clerk-react";
// import { Toaster, toast } from 'sonner'; // Optional: Use a toast library like 'sonner' for better alerts

function App() {
  const [currentView, setCurrentView] = useState("home");
  const { isSignedIn, isLoaded } = useAuth();
  
  // --- STATE LIFTING: Shared Data ---
  // These control the ImagePromptEnhancer
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageModel, setImageModel] = useState("midjourney");
  
  // Sidebar State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // --- LOGIC: REMIX ACTION ---
  // This is the bridge between Gallery and Enhancer
  const handleRemix = (template) => {
    if (template.category === 'image') {
      // 1. Populate the State
      setImagePrompt(template.promptContent);
      setImageModel(template.modelConfig || 'midjourney');
      
      // 2. Redirect to Image View
      setCurrentView('image');
      
      // 3. Optional: Notify User
      // toast.success("Template loaded!"); 
    } else {
      // Handle Text/Code templates
      alert("Text/Code Enhancer coming soon! (Check 'Chat' tab)");
      // Future: setTextPrompt(template.promptContent); setCurrentView('chat');
    }
  };

  if (!isLoaded) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
  if (!isSignedIn) return <LoginPage />;

  const renderView = () => {
    switch (currentView) {
      case "home":
        return <HomePage onNavigate={setCurrentView} />;
        
      case "image":
        return (
          <div className="pt-24 px-6 max-w-7xl mx-auto h-[calc(100vh-100px)]">
             {/* Pass State & Setters Down */}
             <ImagePromptEnhancer 
               prompt={imagePrompt}
               setPrompt={setImagePrompt}
               model={imageModel}
               setModel={setImageModel}
             />
          </div>
        );
        
      case "chat":
        return (
          <div className="pt-32 text-center text-white">
            <h1 className="text-2xl">Text Enhancer (Component Coming Next)</h1>
          </div>
        );
        
      case "templates":
        return (
          <div className="pt-0">
             {/* Pass the Remix Handler Down */}
             <TemplatesGallery onRemix={handleRemix} />
          </div>
        );
        
      default:
        return <HomePage onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-blue-900/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-purple-900/10 blur-[120px]" />
      </div>

      <Navbar 
        activeTab={currentView} 
        onNavigate={setCurrentView} 
        onOpenHistory={() => setIsHistoryOpen(true)} 
      />
      
      <main className="relative z-10">
        {renderView()}
      </main>

      <HistorySidebar 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
      />
    </div>
  );
}

export default App;