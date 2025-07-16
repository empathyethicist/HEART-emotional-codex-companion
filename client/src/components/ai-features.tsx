import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Brain, Sparkles, BookOpen, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function AIFeatures() {
  const [analysisText, setAnalysisText] = useState("");
  const [emotionName, setEmotionName] = useState("");
  const [context, setContext] = useState("");
  const [enhanceEmotion, setEnhanceEmotion] = useState("");
  const [enhanceDescription, setEnhanceDescription] = useState("");
  const { toast } = useToast();

  // Check AI service status
  const { data: aiStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["/api/ai/status"],
  });

  // Emotion analysis mutation
  const emotionAnalysisMutation = useMutation({
    mutationFn: async (text: string) => {
      return await apiRequest("/api/ai/analyze-emotion", "POST", { text });
    },
    onSuccess: () => {
      toast({
        title: "Analysis Complete",
        description: "AI emotion analysis has been completed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze emotion using AI",
        variant: "destructive",
      });
    },
  });

  // Sentiment analysis mutation
  const sentimentAnalysisMutation = useMutation({
    mutationFn: async (text: string) => {
      return await apiRequest("/api/ai/analyze-sentiment", "POST", { text });
    },
    onSuccess: () => {
      toast({
        title: "Sentiment Analysis Complete",
        description: "AI sentiment analysis has been completed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze sentiment using AI",
        variant: "destructive",
      });
    },
  });

  // Description generation mutation
  const descriptionMutation = useMutation({
    mutationFn: async ({ emotionName, context }: { emotionName: string; context?: string }) => {
      return await apiRequest("/api/ai/generate-description", "POST", { emotionName, context });
    },
    onSuccess: () => {
      toast({
        title: "Description Generated",
        description: "AI-generated emotion description is ready.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate description using AI",
        variant: "destructive",
      });
    },
  });

  // Codex enhancement mutation
  const enhancementMutation = useMutation({
    mutationFn: async ({ emotionFamily, description }: { emotionFamily: string; description: string }) => {
      return await apiRequest("/api/ai/enhance-codex", "POST", { emotionFamily, description });
    },
    onSuccess: () => {
      toast({
        title: "Enhancement Complete",
        description: "AI codex enhancement has been completed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Enhancement Failed",
        description: error.message || "Failed to enhance codex using AI",
        variant: "destructive",
      });
    },
  });

  const handleEmotionAnalysis = () => {
    if (!analysisText.trim()) {
      toast({
        title: "Text Required",
        description: "Please enter text to analyze",
        variant: "destructive",
      });
      return;
    }
    emotionAnalysisMutation.mutate(analysisText);
  };

  const handleSentimentAnalysis = () => {
    if (!analysisText.trim()) {
      toast({
        title: "Text Required",
        description: "Please enter text to analyze",
        variant: "destructive",
      });
      return;
    }
    sentimentAnalysisMutation.mutate(analysisText);
  };

  const handleDescriptionGeneration = () => {
    if (!emotionName.trim()) {
      toast({
        title: "Emotion Name Required",
        description: "Please enter an emotion name",
        variant: "destructive",
      });
      return;
    }
    descriptionMutation.mutate({ emotionName, context });
  };

  const handleCodexEnhancement = () => {
    if (!enhanceEmotion.trim() || !enhanceDescription.trim()) {
      toast({
        title: "Fields Required",
        description: "Please enter both emotion family and description",
        variant: "destructive",
      });
      return;
    }
    enhancementMutation.mutate({ emotionFamily: enhanceEmotion, description: enhanceDescription });
  };

  if (statusLoading) {
    return (
      <Card className="surface-card">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading AI features...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="surface-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="mr-2 h-5 w-5" />
            AI-Powered Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* AI Status */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Hugging Face Integration Status</span>
              <Badge variant={aiStatus?.available ? "default" : "destructive"}>
                {aiStatus?.available ? "Active" : "Inactive"}
              </Badge>
            </div>
            <Alert>
              <AlertDescription>
                {aiStatus?.message || "Status unknown"}
                {!aiStatus?.available && (
                  <span className="block mt-2 text-sm">
                    To enable AI features, add your Hugging Face API key to the HUGGINGFACE_API_KEY environment variable.
                  </span>
                )}
              </AlertDescription>
            </Alert>
          </div>

          {aiStatus?.available && (
            <Tabs defaultValue="analysis" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="analysis">Emotion Analysis</TabsTrigger>
                <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
                <TabsTrigger value="generate">Generate</TabsTrigger>
                <TabsTrigger value="enhance">Enhance</TabsTrigger>
              </TabsList>

              <TabsContent value="analysis" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Text to Analyze</label>
                    <Textarea
                      value={analysisText}
                      onChange={(e) => setAnalysisText(e.target.value)}
                      placeholder="Enter emotional expression or text to analyze..."
                      className="min-h-[100px]"
                    />
                  </div>
                  <Button 
                    onClick={handleEmotionAnalysis}
                    disabled={emotionAnalysisMutation.isPending || !analysisText.trim()}
                    className="w-full"
                  >
                    {emotionAnalysisMutation.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                    ) : (
                      <><Brain className="mr-2 h-4 w-4" /> Analyze Emotions</>
                    )}
                  </Button>
                  
                  {emotionAnalysisMutation.data && (
                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle className="text-lg">AI Analysis Results</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <span className="text-sm font-medium">Primary Emotion:</span>
                            <p className="text-lg font-semibold text-primary">
                              {emotionAnalysisMutation.data.primaryEmotion}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium">Confidence:</span>
                            <div className="flex items-center mt-1">
                              <Progress value={emotionAnalysisMutation.data.confidence * 100} className="flex-1 mr-3" />
                              <span className="text-sm font-medium">
                                {(emotionAnalysisMutation.data.confidence * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                          <div>
                            <span className="text-sm font-medium">All Emotions:</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {emotionAnalysisMutation.data.emotions.map((emotion: any, index: number) => (
                                <Badge key={index} variant="outline">
                                  {emotion.label} ({(emotion.score * 100).toFixed(1)}%)
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-sm font-medium">Model Used:</span>
                            <p className="text-sm text-gray-600">{emotionAnalysisMutation.data.modelUsed}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="sentiment" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Text for Sentiment Analysis</label>
                    <Textarea
                      value={analysisText}
                      onChange={(e) => setAnalysisText(e.target.value)}
                      placeholder="Enter text to analyze sentiment..."
                      className="min-h-[100px]"
                    />
                  </div>
                  <Button 
                    onClick={handleSentimentAnalysis}
                    disabled={sentimentAnalysisMutation.isPending || !analysisText.trim()}
                    className="w-full"
                  >
                    {sentimentAnalysisMutation.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                    ) : (
                      <><TrendingUp className="mr-2 h-4 w-4" /> Analyze Sentiment</>
                    )}
                  </Button>
                  
                  {sentimentAnalysisMutation.data && (
                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle className="text-lg">Sentiment Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <span className="text-sm font-medium">Sentiment:</span>
                            <p className="text-lg font-semibold text-primary">
                              {sentimentAnalysisMutation.data.label}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium">Confidence:</span>
                            <div className="flex items-center mt-1">
                              <Progress value={sentimentAnalysisMutation.data.score * 100} className="flex-1 mr-3" />
                              <span className="text-sm font-medium">
                                {(sentimentAnalysisMutation.data.score * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="generate" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Emotion Name</label>
                    <Input
                      value={emotionName}
                      onChange={(e) => setEmotionName(e.target.value)}
                      placeholder="e.g., nostalgia, euphoria, melancholy"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Context (Optional)</label>
                    <Input
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      placeholder="e.g., workplace, relationships, cultural"
                    />
                  </div>
                  <Button 
                    onClick={handleDescriptionGeneration}
                    disabled={descriptionMutation.isPending || !emotionName.trim()}
                    className="w-full"
                  >
                    {descriptionMutation.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                    ) : (
                      <><BookOpen className="mr-2 h-4 w-4" /> Generate Description</>
                    )}
                  </Button>
                  
                  {descriptionMutation.data && (
                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle className="text-lg">Generated Description</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-relaxed">
                          {descriptionMutation.data.description}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="enhance" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Emotion Family</label>
                    <Input
                      value={enhanceEmotion}
                      onChange={(e) => setEnhanceEmotion(e.target.value)}
                      placeholder="e.g., JOY, SADNESS, ANGER"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Current Description</label>
                    <Textarea
                      value={enhanceDescription}
                      onChange={(e) => setEnhanceDescription(e.target.value)}
                      placeholder="Enter the current emotion description to enhance..."
                      className="min-h-[100px]"
                    />
                  </div>
                  <Button 
                    onClick={handleCodexEnhancement}
                    disabled={enhancementMutation.isPending || !enhanceEmotion.trim() || !enhanceDescription.trim()}
                    className="w-full"
                  >
                    {enhancementMutation.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enhancing...</>
                    ) : (
                      <><Sparkles className="mr-2 h-4 w-4" /> Enhance with AI</>
                    )}
                  </Button>
                  
                  {enhancementMutation.data && (
                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle className="text-lg">AI Enhancement</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {enhancementMutation.data.enhancedDescription && (
                          <div>
                            <span className="text-sm font-medium">Enhanced Description:</span>
                            <p className="text-sm leading-relaxed mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                              {enhancementMutation.data.enhancedDescription}
                            </p>
                          </div>
                        )}
                        {enhancementMutation.data.suggestedTriggers && enhancementMutation.data.suggestedTriggers.length > 0 && (
                          <div>
                            <span className="text-sm font-medium">Suggested Triggers:</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {enhancementMutation.data.suggestedTriggers.map((trigger: string, index: number) => (
                                <Badge key={index} variant="outline">{trigger}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {enhancementMutation.data.culturalVariations && enhancementMutation.data.culturalVariations.length > 0 && (
                          <div>
                            <span className="text-sm font-medium">Cultural Variations:</span>
                            <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                              {enhancementMutation.data.culturalVariations.map((variation: string, index: number) => (
                                <li key={index} className="text-gray-600 dark:text-gray-400">{variation}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}