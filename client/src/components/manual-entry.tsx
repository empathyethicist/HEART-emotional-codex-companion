import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { PlusCircle, Loader2 } from "lucide-react";
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
  );
}
