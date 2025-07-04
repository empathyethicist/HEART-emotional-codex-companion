import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, BarChart3, Brain, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const cipEvaluationSchema = z.object({
  emotionName: z.string().min(1, "Emotion name is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  culturalContext: z.string().min(1, "Cultural context is required"),
  triggers: z.string().min(1, "At least one trigger is required")
});

type FormData = z.infer<typeof cipEvaluationSchema>;

interface CIPScore {
  universality: number;
  traceability: number;
  empathicCoherence: number;
  relationalActivation: number;
  totalScore: number;
  qualifiesForInclusion: boolean;
}

interface EvaluationResult {
  cipScore: CIPScore;
  esdmDeconstruction: any;
  recommendation: string;
  heartAlignment: boolean;
}

export default function CIPEvaluator() {
  const { toast } = useToast();
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(cipEvaluationSchema),
    defaultValues: {
      emotionName: "",
      description: "",
      culturalContext: "",
      triggers: ""
    }
  });

  const evaluateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/emotions/cip-evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          triggers: data.triggers.split(',').map(t => t.trim()).filter(Boolean)
        })
      });
      
      if (!response.ok) throw new Error("Failed to evaluate emotion");
      return response.json();
    },
    onSuccess: (data: EvaluationResult) => {
      setEvaluationResult(data);
      toast({
        title: "CIP Evaluation Complete",
        description: data.heartAlignment 
          ? "Emotion meets HEART alignment threshold!" 
          : "Emotion requires refinement for inclusion",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Evaluation Failed",
        description: error.message || "Failed to evaluate emotion using CIP rubric",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    evaluateMutation.mutate(data);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600 dark:text-green-400";
    if (score >= 6) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 8) return "default";
    if (score >= 6) return "secondary";
    return "destructive";
  };

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="mr-2 h-5 w-5" />
            CIP Rubric Evaluator
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Evaluate emotions using the Cultural Inclusion Protocol (CIP) from the Codex Mapping Manual
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="emotionName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emotion Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Vemod, Saudade, Doomscroll Fatigue" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="culturalContext"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cultural Context *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select cultural context..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Universal">Universal</SelectItem>
                          <SelectItem value="Western">Western</SelectItem>
                          <SelectItem value="Scandinavian">Scandinavian</SelectItem>
                          <SelectItem value="Russian">Russian</SelectItem>
                          <SelectItem value="East Asian">East Asian</SelectItem>
                          <SelectItem value="Latin American">Latin American</SelectItem>
                          <SelectItem value="African">African</SelectItem>
                          <SelectItem value="Middle Eastern">Middle Eastern</SelectItem>
                          <SelectItem value="Digital Culture">Digital Culture</SelectItem>
                          <SelectItem value="Multiple">Multiple Cultures</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emotion Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Describe the emotional experience, its characteristics, and manifestations..."
                        className="min-h-[100px] resize-none"
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a detailed description including emotional arc, intensity, and cultural significance
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="triggers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emotional Triggers *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="e.g., seasonal change, loss, social media, impermanence (comma-separated)"
                      />
                    </FormControl>
                    <FormDescription>
                      List situations, events, or conditions that commonly trigger this emotion
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                disabled={evaluateMutation.isPending}
              >
                {evaluateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Evaluating with CIP Rubric...
                  </>
                ) : (
                  <>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Evaluate Emotion
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {evaluationResult && (
        <Card className="w-full max-w-4xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                CIP Evaluation Results
              </span>
              {evaluationResult.heartAlignment ? (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  HEART Aligned
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="mr-1 h-3 w-3" />
                  Needs Refinement
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* CIP Scores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Universality</span>
                  <Badge variant={getScoreBadgeVariant(evaluationResult.cipScore.universality)}>
                    {evaluationResult.cipScore.universality.toFixed(1)}
                  </Badge>
                </div>
                <Progress value={evaluationResult.cipScore.universality * 10} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Traceability</span>
                  <Badge variant={getScoreBadgeVariant(evaluationResult.cipScore.traceability)}>
                    {evaluationResult.cipScore.traceability.toFixed(1)}
                  </Badge>
                </div>
                <Progress value={evaluationResult.cipScore.traceability * 10} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Empathic Coherence</span>
                  <Badge variant={getScoreBadgeVariant(evaluationResult.cipScore.empathicCoherence)}>
                    {evaluationResult.cipScore.empathicCoherence.toFixed(1)}
                  </Badge>
                </div>
                <Progress value={evaluationResult.cipScore.empathicCoherence * 10} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Relational Activation</span>
                  <Badge variant={getScoreBadgeVariant(evaluationResult.cipScore.relationalActivation)}>
                    {evaluationResult.cipScore.relationalActivation.toFixed(1)}
                  </Badge>
                </div>
                <Progress value={evaluationResult.cipScore.relationalActivation * 10} className="h-2" />
              </div>
            </div>

            {/* Total Score */}
            <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="text-2xl font-bold mb-2">
                <span className={getScoreColor(evaluationResult.cipScore.totalScore)}>
                  {evaluationResult.cipScore.totalScore.toFixed(1)}/10
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {evaluationResult.recommendation}
              </div>
              <Progress value={evaluationResult.cipScore.totalScore * 10} className="max-w-md mx-auto" />
            </div>

            {/* ESDM Deconstruction */}
            <div className="space-y-4">
              <h4 className="font-semibold">ESDM Deconstruction Analysis</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Emotion Arc</div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{evaluationResult.esdmDeconstruction.arcType.type}</Badge>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {evaluationResult.esdmDeconstruction.arcType.duration}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Primary Family</div>
                  <Badge>{evaluationResult.esdmDeconstruction.emotionFamily}</Badge>
                  {evaluationResult.esdmDeconstruction.secondaryFamily && (
                    <Badge variant="secondary">{evaluationResult.esdmDeconstruction.secondaryFamily}</Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Trigger Origins</div>
                <div className="flex flex-wrap gap-2">
                  {evaluationResult.esdmDeconstruction.triggerOrigin.map((origin: string, index: number) => (
                    <Badge key={index} variant="outline">{origin}</Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Blendable Emotions</div>
                <div className="flex flex-wrap gap-2">
                  {evaluationResult.esdmDeconstruction.blendability.map((emotion: string, index: number) => (
                    <Badge key={index} variant="secondary">{emotion}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}