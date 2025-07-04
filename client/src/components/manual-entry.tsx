import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { PlusCircle, Loader2, Database, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { manualEntrySchema } from "@shared/schema";
import type { z } from "zod";

type FormData = z.infer<typeof manualEntrySchema>;

const emotionFamilies = [
  "JOY", "FEAR", "ANGER", "SADNESS", "LOVE", "SURPRISE", 
  "DISGUST", "TRUST", "ANTICIPATION", "CONTEMPT", "GUILT", "SHAME"
];

export default function ManualEntry() {
  const { toast } = useToast();

  // Mass population mutation
  const populateCodexMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/emotions/populate", {
        method: "POST"
      });
      if (!response.ok) throw new Error("Failed to populate codex");
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Codex Population Complete", 
        description: `Added ${data.results.emotionFamiliesAdded} emotion families. Skipped ${data.results.emotionFamiliesSkipped} existing families.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/emotions/codex"] });
    },
    onError: (error: any) => {
      toast({
        title: "Population Failed",
        description: error.message || "Failed to populate emotion codex from YAML file",
        variant: "destructive",
      });
    },
  });

  const form = useForm<FormData>({
    resolver: zodResolver(manualEntrySchema),
    defaultValues: {
      emotionFamily: "",
      variantName: "",
      definition: "",
      intensityMin: 0.3,
      intensityMax: 0.8,
      triggers: [],
      blendableWith: [],
      culturalModifiers: "",
      symbolicInterpretation: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/emotions/manual", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Emotion Added Successfully",
        description: "The new emotion has been added to the codex.",
      });
      form.reset();
      // Invalidate codex cache to refresh the browser
      queryClient.invalidateQueries({ queryKey: ["/api/emotions/codex"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Emotion",
        description: error.message || "Failed to add the emotion to the codex",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  const handleTriggersChange = (value: string) => {
    const triggers = value.split(',').map(t => t.trim()).filter(t => t.length > 0);
    form.setValue('triggers', triggers);
  };

  const handleBlendableToggle = (emotion: string, checked: boolean) => {
    const currentBlendable = form.getValues('blendableWith') || [];
    if (checked) {
      form.setValue('blendableWith', [...currentBlendable, emotion]);
    } else {
      form.setValue('blendableWith', currentBlendable.filter(e => e !== emotion));
    }
  };

  return (
    <div className="space-y-6">
      <Card className="surface-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <PlusCircle className="mr-2 text-accent" />
          Manual Emotion Entry
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="emotionFamily"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emotion Family *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select existing family..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {emotionFamilies.map((family) => (
                          <SelectItem key={family} value={family}>
                            {family}
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
                name="variantName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Variant Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Melancholy, Euphoria..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Definition */}
            <FormField
              control={form.control}
              name="definition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Definition *</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Provide a clear, concise definition of this emotional state..."
                      className="min-h-[80px] resize-none"
                    />
                  </FormControl>
                  <FormDescription>
                    Describe the emotional state clearly and scientifically (minimum 10 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Intensity Range */}
            <div>
              <FormLabel>Intensity Range *</FormLabel>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <FormField
                  control={form.control}
                  name="intensityMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-gray-500">Minimum (0.0 - 1.0)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          max="1" 
                          step="0.1"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="intensityMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-gray-500">Maximum (0.0 - 1.0)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          max="1" 
                          step="0.1"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Triggers */}
            <FormField
              control={form.control}
              name="triggers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trigger Keywords *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., loss, separation, abandonment (comma-separated)"
                      onChange={(e) => handleTriggersChange(e.target.value)}
                    />
                  </FormControl>
                  <FormDescription>
                    List words or phrases that commonly trigger this emotion, separated by commas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Blendable Emotions */}
            <FormField
              control={form.control}
              name="blendableWith"
              render={() => (
                <FormItem>
                  <FormLabel>Blendable With</FormLabel>
                  <FormDescription>
                    Select emotion families that can blend with this emotion
                  </FormDescription>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {emotionFamilies.map((emotion) => (
                      <div key={emotion} className="flex items-center space-x-2">
                        <Checkbox
                          id={emotion}
                          onCheckedChange={(checked) => handleBlendableToggle(emotion, checked as boolean)}
                        />
                        <label 
                          htmlFor={emotion} 
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {emotion}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cultural Modifiers */}
            <FormField
              control={form.control}
              name="culturalModifiers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cultural Modifiers (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Describe any cultural-specific interpretations or expressions..."
                      className="min-h-[60px] resize-none"
                    />
                  </FormControl>
                  <FormDescription>
                    Note any cultural variations in how this emotion is expressed or interpreted
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Symbolic Interpretation */}
            <FormField
              control={form.control}
              name="symbolicInterpretation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Symbolic Interpretation (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Describe common metaphors, symbols, or archetypal patterns..."
                      className="min-h-[60px] resize-none"
                    />
                  </FormControl>
                  <FormDescription>
                    Include common metaphors, symbols, or archetypal patterns associated with this emotion
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full bg-secondary hover:bg-secondary/90" 
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding to Codex...
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add to Codex
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>

    {/* Mass Population Section */}
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="mr-2 h-5 w-5" />
          Mass Codex Population
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Populate the emotion codex with comprehensive emotion families from the YAML schema
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-3">
            <Download className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                Automated Population Available
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                This will add emotion families from the YAML file including Joy, Sadness, Anger, Fear, Love, 
                Disgust, Curiosity, Guilt, Shame, Surprise, Playfulness, Trust, Hope, Grief, Helplessness, 
                and Loneliness with their complete variant structures.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div>
            <h4 className="font-medium">Emotion Families Schema</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              16 comprehensive emotion families with variants, triggers, and intensity markers
            </p>
          </div>
          <Button 
            onClick={() => populateCodexMutation.mutate()}
            disabled={populateCodexMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {populateCodexMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Populating...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Populate Codex
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>• Existing emotion families will be skipped to prevent duplicates</p>
          <p>• Each family includes multiple variants with intensity ranges</p>
          <p>• Triggers and cultural markers are automatically generated</p>
          <p>• Blendable emotion relationships are established</p>
        </div>
      </CardContent>
      </Card>
    </div>
  );
}
