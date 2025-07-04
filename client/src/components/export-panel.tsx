import { useQuery } from "@tanstack/react-query";
import { Download, FileCode, FileText, Upload, Save, Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface ExportPanelProps {
  currentEmid: string | null;
}

export default function ExportPanel({ currentEmid }: ExportPanelProps) {
  const { toast } = useToast();

  const { data: cmopData, isLoading } = useQuery({
    queryKey: ["/api/cmop", currentEmid],
    enabled: !!currentEmid,
  });

  const handleExport = async (format: 'json' | 'yaml' | 'txt') => {
    if (!currentEmid) {
      toast({
        title: "No CMOP Available",
        description: "Please process an emotion first to generate a CMOP for export.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/cmop/${currentEmid}/export/${format}`);
      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `cmop-${currentEmid}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Successful",
        description: `CMOP exported as ${format.toUpperCase()} file.`,
      });
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export CMOP",
        variant: "destructive",
      });
    }
  };

  const handleCopyToClipboard = async () => {
    if (!cmopData) return;

    const exportData = {
      input_phrase: cmopData.inputPhrase,
      emotion_family: cmopData.emotionFamily,
      variant: cmopData.variant,
      codex_reference: cmopData.codexReference,
      intensity: cmopData.intensity / 100,
      blendable_with: cmopData.blendableWith,
      symbolic_reference: cmopData.symbolicReference,
      cultural_tag: cmopData.culturalTag,
      emid: cmopData.emid,
      timestamp: cmopData.timestamp,
      confidence: cmopData.confidence / 100,
      sal_analysis: cmopData.salAnalysis
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
      toast({
        title: "Copied to Clipboard",
        description: "CMOP data has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy CMOP data to clipboard.",
        variant: "destructive",
      });
    }
  };

  const formatCmopForDisplay = (data: any) => {
    if (!data) return "No CMOP data available";

    return {
      input_phrase: data.inputPhrase,
      emotion_family: data.emotionFamily,
      variant: data.variant,
      codex_reference: data.codexReference,
      intensity: (data.intensity / 100).toFixed(2),
      blendable_with: data.blendableWith || [],
      symbolic_reference: data.symbolicReference,
      cultural_tag: data.culturalTag,
      emid: data.emid,
      timestamp: new Date(data.timestamp).toISOString(),
      confidence: (data.confidence / 100).toFixed(2),
      sal_analysis: data.salAnalysis || {}
    };
  };

  return (
    <Card className="surface-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Download className="mr-2 text-accent" />
          Export & Save Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current CMOP Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <h3 className="font-medium">Current CMOP Status</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {currentEmid ? `EMID: ${currentEmid}` : "No CMOP available - process an emotion first"}
            </p>
          </div>
          <Badge variant={currentEmid ? "secondary" : "outline"}>
            {currentEmid ? "Ready" : "Pending"}
          </Badge>
        </div>

        {/* Current CMOP Display */}
        {cmopData && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Current CMOP (Codex Mapping Output Packet)</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyToClipboard}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 font-roboto-mono text-sm overflow-x-auto code-block">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(formatCmopForDisplay(cmopData), null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Export Options */}
        <div>
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Export Formats</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2 interactive-card"
              onClick={() => handleExport('json')}
              disabled={!currentEmid || isLoading}
            >
              <FileCode className="h-8 w-8 text-primary" />
              <div className="text-center">
                <p className="font-medium">Export as JSON</p>
                <p className="text-sm text-gray-500">Machine-readable format</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2 interactive-card"
              onClick={() => handleExport('yaml')}
              disabled={!currentEmid || isLoading}
            >
              <FileText className="h-8 w-8 text-primary" />
              <div className="text-center">
                <p className="font-medium">Export as YAML</p>
                <p className="text-sm text-gray-500">Human-readable format</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2 interactive-card"
              onClick={() => handleExport('txt')}
              disabled={!currentEmid || isLoading}
            >
              <FileText className="h-8 w-8 text-primary" />
              <div className="text-center">
                <p className="font-medium">Export as TXT</p>
                <p className="text-sm text-gray-500">Plain text report</p>
              </div>
            </Button>
          </div>
        </div>

        {/* Codex Contribution */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Contribute to Codex Repository</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Save your analysis as a potential addition to the main Emotional Codex for review and integration.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button 
              className="bg-secondary hover:bg-secondary/90"
              disabled={!currentEmid}
              onClick={() => {
                toast({
                  title: "Submission Feature",
                  description: "Codex contribution submission would be implemented here with proper review workflow.",
                });
              }}
            >
              <Upload className="mr-2 h-4 w-4" />
              Submit for Review
            </Button>
            <Button 
              variant="outline"
              disabled={!currentEmid}
              onClick={() => handleExport('json')}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Locally
            </Button>
          </div>
        </div>

        {/* Usage Guidelines */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Export Guidelines</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• JSON format is ideal for API integration and machine processing</li>
            <li>• YAML format provides human-readable structure for documentation</li>
            <li>• TXT format offers a simple report suitable for sharing and review</li>
            <li>• All exports include complete CMOP data with EMID for traceability</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
