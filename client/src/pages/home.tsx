import { useState } from "react";
import { Brain, Cog } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmotionInput from "@/components/emotion-input";
import CodexBrowser from "@/components/codex-browser";
import ManualEntry from "@/components/manual-entry";
import CIPEvaluator from "@/components/cip-evaluator";
import ExportPanel from "@/components/export-panel";
import Sidebar from "@/components/sidebar";

export default function Home() {
  const [currentEmid, setCurrentEmid] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-app-background">
      {/* Header */}
      <header className="bg-primary text-white shadow-lg">
        <div className="container mx-auto px-4 py-6 bg-[#910000e8]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="text-2xl" />
              <div>
                <h1 className="text-2xl font-bold">Emotional Codex Companion</h1>
                <p className="text-blue-100 text-sm">Advanced Empathy System Development Tool</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm bg-blue-600 px-3 py-1 rounded-full">v2.1.0</span>
              <button className="text-white hover:text-blue-200 transition-colors">
                <Cog className="text-lg" />
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* Main Application */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Content Area */}
          <div className="col-span-12 lg:col-span-8">
            <Tabs defaultValue="input" className="space-y-6">
              <div className="surface-card rounded-lg shadow-md">
                <TabsList className="grid w-full grid-cols-5 bg-transparent p-0 h-auto">
                  <TabsTrigger 
                    value="input" 
                    className="tab-button px-6 py-4 text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary"
                  >
                    <span className="flex items-center">
                      Emotion Input
                    </span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="codex"
                    className="tab-button px-6 py-4 text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary"
                  >
                    <span className="flex items-center">
                      Codex Browser
                    </span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="manual"
                    className="tab-button px-6 py-4 text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary"
                  >
                    <span className="flex items-center">
                      Manual Entry
                    </span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="cip"
                    className="tab-button px-6 py-4 text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary"
                  >
                    <span className="flex items-center">
                      CIP Evaluator
                    </span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="export"
                    className="tab-button px-6 py-4 text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary"
                  >
                    <span className="flex items-center">
                      Export & Save
                    </span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="input" className="space-y-6">
                <EmotionInput onEmotionProcessed={setCurrentEmid} />
              </TabsContent>

              <TabsContent value="codex" className="space-y-6">
                <CodexBrowser />
              </TabsContent>

              <TabsContent value="manual" className="space-y-6">
                <ManualEntry />
              </TabsContent>

              <TabsContent value="cip" className="space-y-6">
                <CIPEvaluator />
              </TabsContent>

              <TabsContent value="export" className="space-y-6">
                <ExportPanel currentEmid={currentEmid} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-4">
            <Sidebar />
          </div>
        </div>
      </div>
      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <span>© 2024 Emotional Codex Companion</span>
              <span>•</span>
              <span>HEART Framework Compliant</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Codex Version: 2.1.0</span>
              <span>•</span>
              <span>API Status: <span className="text-secondary">Connected</span></span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
