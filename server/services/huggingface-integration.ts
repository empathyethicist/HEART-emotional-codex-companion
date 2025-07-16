import { HfInference } from '@huggingface/inference';

export interface HuggingFaceEmotionResult {
  label: string;
  score: number;
}

export interface HuggingFaceAnalysis {
  emotions: HuggingFaceEmotionResult[];
  primaryEmotion: string;
  confidence: number;
  modelUsed: string;
  rawResponse: any;
}

export class HuggingFaceService {
  private static instance: HuggingFaceService;
  private hf: HfInference | null = null;
  private isInitialized = false;

  private constructor() {
    this.initialize();
  }

  static getInstance(): HuggingFaceService {
    if (!HuggingFaceService.instance) {
      HuggingFaceService.instance = new HuggingFaceService();
    }
    return HuggingFaceService.instance;
  }

  private initialize(): void {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (apiKey) {
      this.hf = new HfInference(apiKey);
      this.isInitialized = true;
      console.log('[HuggingFace] Service initialized successfully');
    } else {
      console.warn('[HuggingFace] API key not found. Service will operate in fallback mode.');
    }
  }

  async analyzeEmotion(text: string): Promise<HuggingFaceAnalysis | null> {
    if (!this.isInitialized || !this.hf) {
      console.warn('[HuggingFace] Service not initialized. Skipping emotion analysis.');
      return null;
    }

    try {
      // Use emotion classification model
      const response = await this.hf.textClassification({
        model: 'j-hartmann/emotion-english-distilroberta-base',
        inputs: text,
      });

      if (!response || !Array.isArray(response)) {
        throw new Error('Invalid response from Hugging Face API');
      }

      // Sort emotions by confidence score
      const emotions = response
        .map(item => ({
          label: this.mapEmotionLabel(item.label),
          score: item.score
        }))
        .sort((a, b) => b.score - a.score);

      const primaryEmotion = emotions[0]?.label || 'UNKNOWN';
      const confidence = emotions[0]?.score || 0;

      return {
        emotions,
        primaryEmotion,
        confidence,
        modelUsed: 'j-hartmann/emotion-english-distilroberta-base',
        rawResponse: response
      };

    } catch (error: any) {
      console.error('[HuggingFace] Error analyzing emotion:', error.message);
      return null;
    }
  }

  async analyzeSentiment(text: string): Promise<{ label: string; score: number } | null> {
    if (!this.isInitialized || !this.hf) {
      return null;
    }

    try {
      const response = await this.hf.textClassification({
        model: 'cardiffnlp/twitter-roberta-base-sentiment-latest',
        inputs: text,
      });

      if (!response || !Array.isArray(response)) {
        throw new Error('Invalid response from Hugging Face API');
      }

      const result = response[0];
      return {
        label: result.label,
        score: result.score
      };

    } catch (error: any) {
      console.error('[HuggingFace] Error analyzing sentiment:', error.message);
      return null;
    }
  }

  async generateEmotionDescription(emotionName: string, context?: string): Promise<string | null> {
    if (!this.isInitialized || !this.hf) {
      return null;
    }

    try {
      const prompt = context 
        ? `Describe the emotion "${emotionName}" in the context of: ${context}. Provide a psychological definition:`
        : `Provide a detailed psychological definition of the emotion "${emotionName}":`;

      const response = await this.hf.textGeneration({
        model: 'microsoft/DialoGPT-medium',
        inputs: prompt,
        parameters: {
          max_new_tokens: 150,
          temperature: 0.7,
          do_sample: true,
          top_p: 0.9
        }
      });

      return response.generated_text?.trim() || null;

    } catch (error: any) {
      console.error('[HuggingFace] Error generating description:', error.message);
      return null;
    }
  }

  private mapEmotionLabel(huggingFaceLabel: string): string {
    // Map Hugging Face emotion labels to our codex emotion families
    const emotionMap: Record<string, string> = {
      'joy': 'JOY',
      'sadness': 'SADNESS',
      'anger': 'ANGER',
      'fear': 'FEAR',
      'surprise': 'SURPRISE',
      'disgust': 'DISGUST',
      'love': 'LOVE',
      'excitement': 'JOY',
      'optimism': 'JOY',
      'admiration': 'LOVE',
      'approval': 'TRUST',
      'caring': 'LOVE',
      'desire': 'LOVE',
      'gratitude': 'JOY',
      'pride': 'JOY',
      'relief': 'JOY',
      'amusement': 'JOY',
      'annoyance': 'ANGER',
      'disapproval': 'DISGUST',
      'disappointment': 'SADNESS',
      'embarrassment': 'SHAME',
      'grief': 'SADNESS',
      'nervousness': 'FEAR',
      'remorse': 'GUILT',
      'confusion': 'SURPRISE'
    };

    return emotionMap[huggingFaceLabel.toLowerCase()] || huggingFaceLabel.toUpperCase();
  }

  async enhanceEmotionCodex(emotionFamily: string, description: string): Promise<{
    enhancedDescription?: string;
    suggestedTriggers?: string[];
    culturalVariations?: string[];
  } | null> {
    if (!this.isInitialized || !this.hf) {
      return null;
    }

    try {
      // Generate enhanced description
      const enhancementPrompt = `Enhance this emotion definition with psychological insights: "${description}" for the emotion family ${emotionFamily}. Provide triggers and cultural variations:`;
      
      const response = await this.hf.textGeneration({
        model: 'microsoft/DialoGPT-medium',
        inputs: enhancementPrompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.6,
          do_sample: true
        }
      });

      const enhancedText = response.generated_text?.trim();
      
      if (!enhancedText) return null;

      // Parse the response to extract different components
      return {
        enhancedDescription: enhancedText,
        suggestedTriggers: this.extractTriggersFromText(enhancedText),
        culturalVariations: this.extractCulturalVariationsFromText(enhancedText)
      };

    } catch (error: any) {
      console.error('[HuggingFace] Error enhancing codex:', error.message);
      return null;
    }
  }

  private extractTriggersFromText(text: string): string[] {
    // Simple extraction logic - look for trigger-related keywords
    const triggerKeywords = text.toLowerCase().match(/triggered by|caused by|results from|due to|when|if/g);
    if (!triggerKeywords) return [];

    // Extract phrases after trigger keywords
    const triggers: string[] = [];
    const sentences = text.split(/[.!?]/);
    
    sentences.forEach(sentence => {
      if (sentence.toLowerCase().includes('trigger') || sentence.toLowerCase().includes('caused by')) {
        const cleaned = sentence.replace(/.*(?:trigger|caused by)/i, '').trim();
        if (cleaned && cleaned.length > 5) {
          triggers.push(cleaned);
        }
      }
    });

    return triggers.slice(0, 3); // Limit to 3 triggers
  }

  private extractCulturalVariationsFromText(text: string): string[] {
    // Simple extraction for cultural mentions
    const culturalKeywords = ['culture', 'cultural', 'society', 'tradition', 'western', 'eastern', 'asian', 'european'];
    const variations: string[] = [];
    
    const sentences = text.split(/[.!?]/);
    sentences.forEach(sentence => {
      const hasCultural = culturalKeywords.some(keyword => 
        sentence.toLowerCase().includes(keyword)
      );
      
      if (hasCultural && sentence.trim().length > 10) {
        variations.push(sentence.trim());
      }
    });

    return variations.slice(0, 2); // Limit to 2 variations
  }

  isAvailable(): boolean {
    return this.isInitialized && this.hf !== null;
  }

  getStatus(): { available: boolean; message: string } {
    if (this.isAvailable()) {
      return { available: true, message: 'Hugging Face integration is active' };
    } else {
      return { available: false, message: 'Hugging Face API key required for AI-powered features' };
    }
  }
}

export const huggingFaceService = HuggingFaceService.getInstance();