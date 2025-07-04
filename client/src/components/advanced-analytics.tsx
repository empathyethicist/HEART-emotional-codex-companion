import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Globe, Volume2, AlertTriangle, CheckCircle, Info } from "lucide-react";

interface ToneAnalysis {
  primaryTone: {
    code: string;
    name: string;
    description: string;
    riskLevel: string;
  };
  secondaryTones: Array<{
    code: string;
    name: string;
  }>;
  culturalModulation: string;
  expressionRisk: number;
  recommendedResponse: string;
}

interface CulturalAnalysis {
  detectedProfile: {
    code: string;
    region: string;
    style: string;
    description: string;
  } | null;
  recommendedModifiers: Array<{
    expressionTendency: string;
    modulationNotes: string;
    intensityAdjustment: number;
  }>;
  culturalSensitivities: string[];
  expressionGuidance: string;
  riskAssessment: {
    misalignmentRisk: number;
    culturalOffenseRisk: number;
    communicationEffectiveness: number;
  };
}

export default function AdvancedAnalytics() {
  const [testInput, setTestInput] = useState("");
  const [selectedEmotion, setSelectedEmotion] = useState("JOY");
  const [selectedCulture, setSelectedCulture] = useState("US-N-Y-P");
  const [toneAnalysis, setToneAnalysis] = useState<ToneAnalysis | null>(null);
  const [culturalAnalysis, setCulturalAnalysis] = useState<CulturalAnalysis | null>(null);

  // Get available tone codes
  const { data: toneCodes } = useQuery({
    queryKey: ["/api/emotions/tone-codes"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get cultural profiles
  const { data: culturalProfiles } = useQuery({
    queryKey: ["/api/emotions/cultural-profiles"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const analyzeExpression = async () => {
    if (!testInput.trim() || !selectedEmotion) return;

    try {
      // Get tone analysis
      const toneResponse = await fetch("/api/emotions/tone-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputPhrase: testInput,
          emotionFamily: selectedEmotion,
          culturalContext: selectedCulture,
          intensity: 0.5
        })
      });
      
      if (toneResponse.ok) {
        const toneData = await toneResponse.json();
        setToneAnalysis(toneData);
      }

      // Get cultural analysis
      const culturalResponse = await fetch("/api/emotions/cultural-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputPhrase: testInput,
          emotionFamily: selectedEmotion,
          culturalContext: selectedCulture
        })
      });
      
      if (culturalResponse.ok) {
        const culturalData = await culturalResponse.json();
        setCulturalAnalysis(culturalData);
      }
    } catch (error) {
      console.error("Analysis failed:", error);
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk > 0.7) return "text-red-600 dark:text-red-400";
    if (risk > 0.4) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  const getRiskIcon = (risk: number) => {
    if (risk > 0.7) return <AlertTriangle className="h-4 w-4" />;
    if (risk > 0.4) return <Info className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="mr-2 h-5 w-5" />
            Advanced Emotional Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Test Expression</label>
              <Input
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Enter emotional expression to analyze..."
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Emotion Family</label>
              <Select value={selectedEmotion} onValueChange={setSelectedEmotion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JOY">Joy</SelectItem>
                  <SelectItem value="ANG">Anger</SelectItem>
                  <SelectItem value="SAD">Sadness</SelectItem>
                  <SelectItem value="FEA">Fear</SelectItem>
                  <SelectItem value="LOV">Love</SelectItem>
                  <SelectItem value="DIS">Disgust</SelectItem>
                  <SelectItem value="SUR">Surprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Cultural Context</label>
              <Select value={selectedCulture} onValueChange={setSelectedCulture}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {culturalProfiles && Object.entries(culturalProfiles).map(([code, profile]) => {
                    const profileData = profile as any;
                    return (
                      <SelectItem key={code} value={code}>
                        {profileData.region}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button onClick={analyzeExpression} className="w-full" disabled={!testInput.trim()}>
            <Brain className="mr-2 h-4 w-4" />
            Analyze Expression
          </Button>
        </CardContent>
      </Card>

      {(toneAnalysis || culturalAnalysis) && (
        <Tabs defaultValue="tone" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tone" className="flex items-center">
              <Volume2 className="mr-2 h-4 w-4" />
              T-Code Analysis
            </TabsTrigger>
            <TabsTrigger value="cultural" className="flex items-center">
              <Globe className="mr-2 h-4 w-4" />
              Cultural Modulation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tone" className="space-y-4">
            {toneAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tone Classification Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold mb-2">Primary Tone</h4>
                        <Badge variant="outline" className="text-sm">
                          {toneAnalysis.primaryTone.code}: {toneAnalysis.primaryTone.name}
                        </Badge>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {toneAnalysis.primaryTone.description}
                        </p>
                      </div>

                      {toneAnalysis.secondaryTones.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Secondary Tones</h4>
                          <div className="flex flex-wrap gap-2">
                            {toneAnalysis.secondaryTones.map((tone, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tone.code}: {tone.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold mb-2">Expression Risk Assessment</h4>
                        <div className="flex items-center space-x-2">
                          <div className={getRiskColor(toneAnalysis.expressionRisk)}>
                            {getRiskIcon(toneAnalysis.expressionRisk)}
                          </div>
                          <Progress 
                            value={toneAnalysis.expressionRisk * 100} 
                            className="flex-1"
                          />
                          <span className="text-sm font-medium">
                            {Math.round(toneAnalysis.expressionRisk * 100)}%
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <h4 className="font-semibold mb-1 text-sm">Recommended Response</h4>
                        <p className="text-sm">{toneAnalysis.recommendedResponse}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-900 border rounded-lg">
                    <h4 className="font-semibold mb-1 text-sm">Cultural Modulation</h4>
                    <p className="text-sm">{toneAnalysis.culturalModulation}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="cultural" className="space-y-4">
            {culturalAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cultural Expression Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {culturalAnalysis.detectedProfile && (
                    <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                      <h4 className="font-semibold mb-2">Detected Cultural Profile</h4>
                      <div className="space-y-1">
                        <p className="text-sm"><strong>Region:</strong> {culturalAnalysis.detectedProfile.region}</p>
                        <p className="text-sm"><strong>Style:</strong> {culturalAnalysis.detectedProfile.style}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {culturalAnalysis.detectedProfile.description}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold">Misalignment Risk</h4>
                      <div className="flex items-center space-x-2">
                        <Progress value={culturalAnalysis.riskAssessment.misalignmentRisk * 100} />
                        <span className="text-sm">
                          {Math.round(culturalAnalysis.riskAssessment.misalignmentRisk * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Cultural Offense Risk</h4>
                      <div className="flex items-center space-x-2">
                        <Progress value={culturalAnalysis.riskAssessment.culturalOffenseRisk * 100} />
                        <span className="text-sm">
                          {Math.round(culturalAnalysis.riskAssessment.culturalOffenseRisk * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Communication Effectiveness</h4>
                      <div className="flex items-center space-x-2">
                        <Progress value={culturalAnalysis.riskAssessment.communicationEffectiveness * 100} />
                        <span className="text-sm">
                          {Math.round(culturalAnalysis.riskAssessment.communicationEffectiveness * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {culturalAnalysis.culturalSensitivities.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Cultural Sensitivities</h4>
                      <ul className="space-y-1">
                        {culturalAnalysis.culturalSensitivities.map((sensitivity, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{sensitivity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h4 className="font-semibold mb-1 text-sm">Expression Guidance</h4>
                    <p className="text-sm">{culturalAnalysis.expressionGuidance}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {toneCodes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">T-Code Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(toneCodes).map(([code, toneData]) => {
                const tone = toneData as any;
                return (
                  <div key={code} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{code}</Badge>
                      <Badge 
                        variant={tone.riskLevel === 'high' ? 'destructive' : 
                                tone.riskLevel === 'medium' ? 'secondary' : 'default'}
                      >
                        {tone.riskLevel} risk
                      </Badge>
                    </div>
                    <h5 className="font-semibold text-sm">{tone.name}</h5>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {tone.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      <strong>Use case:</strong> {tone.useCase}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}