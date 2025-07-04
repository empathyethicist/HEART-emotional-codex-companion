import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Heart, Search, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { emotionProcessingRequestSchema, type EmotionProcessingResponse } from "@shared/schema";
import type { z } from "zod";

type FormData = z.infer<typeof emotionProcessingRequestSchema>;

interface EmotionInputProps {
  onEmotionProcessed: (emid: string) => void;
}

export default function EmotionInput({ onEmotionProcessed }: EmotionInputProps) {
  const [result, setResult] = useState<EmotionProcessingResponse | null>(null);
  const { toast } = useToast();

  // Fetch cultural contexts
  const { data: culturalContexts = [] } = useQuery({
    queryKey: ["/api/cultural-contexts"],
  }) as { data: string[] };

  const form = useForm<FormData>({
    resolver: zodResolver(emotionProcessingRequestSchema),
    defaultValues: {
      inputPhrase: "",
      culturalContext: "Auto-detect",
      processingMode: "Developer Mode",
    },
  });

  const processMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/emotions/process", data);
      return await response.json() as EmotionProcessingResponse;
    },
    onSuccess: (data) => {
      setResult(data);
      onEmotionProcessed(data.emid);
      toast({
        title: "Emotion Processed Successfully",
        description: `Mapped to ${data.emotionFamily} with ${Math.round(data.confidence * 100)}% confidence`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Processing Failed",
        description: error.message || "Failed to process emotion",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    processMutation.mutate(data);
  };

  const getConfidenceBadgeVariant = (confidence: number) => {
    if (confidence >= 0.8) return "badge-confidence-high";
    if (confidence >= 0.6) return "badge-confidence-medium";
    return "badge-confidence-low";
  };

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card className="surface-card">
        <CardHeader>
          <CardTitle>
            Emotion Input
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Text Input */}
              <FormField
                control={form.control}
                name="inputPhrase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enter emotional expression, phrase, or metaphor:</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="e.g., 'I feel like I'm floating through fog' or 'My heart is breaking into pieces'"
                        className="min-h-[100px] resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Cultural Context and Processing Mode */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="culturalContext"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cultural Context</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select cultural context" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Auto-detect">Auto-detect</SelectItem>
                          {(culturalContexts as string[]).map((context: string) => (
                            <SelectItem key={context} value={context}>
                              {context}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="processingMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Processing Mode</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select processing mode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Developer Mode">Developer Mode</SelectItem>
                          <SelectItem value="Therapist Mode">Therapist Mode</SelectItem>
                          <SelectItem value="Research Mode">Research Mode</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={processMutation.isPending}
              >
                {processMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Process
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <Card className="surface-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <span className="mr-2">📊</span>
                Analysis Results
              </span>
              <Badge className={getConfidenceBadgeVariant(result.confidence)}>
                Confidence: {Math.round(result.confidence * 100)}%
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Primary Match */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Primary Emotion Match</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Family:</span>
                  <p className="font-medium">{result.emotionFamily}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Variant:</span>
                  <p className="font-medium">{result.variant || "N/A"}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Reference:</span>
                  <p className="font-medium font-roboto-mono text-primary">{result.codexReference}</p>
                </div>
              </div>
              <div className="mt-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">Intensity:</span>
                <div className="flex items-center mt-1">
                  <Progress value={result.intensity * 100} className="flex-1 mr-3" />
                  <span className="text-sm font-medium">{result.intensity.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* SAL Analysis */}
            {result.salAnalysis && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Symbolic Ambiguity Layer (SAL)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Symbolic Patterns:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {result.salAnalysis.symbolicPatterns.map((pattern, index) => (
                        <Badge key={index} variant="outline">{pattern}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Archetype:</span>
                    <p className="font-medium">{result.salAnalysis.archetype}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Reasoning:</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{result.salAnalysis.reasoning}</p>
                </div>
              </div>
            )}

            {/* Blendable Emotions */}
            {result.blendableWith && result.blendableWith.length > 0 && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Detected Emotional Blends</h4>
                <div className="flex flex-wrap gap-2">
                  {result.blendableWith.map((emotion, index) => (
                    <Badge key={index} variant="secondary">{emotion}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Cultural Context */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Cultural Context</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Cultural Tag:</span>
                  <p className="font-medium">{result.culturalTag}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">EMID:</span>
                  <p className="font-medium font-roboto-mono text-primary">{result.emid}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
