// Client-side emotion processing utilities
export interface EmotionMatch {
  emotion: string;
  variant?: string;
  confidence: number;
  intensity: number;
  triggers: string[];
}

export class ClientEmotionProcessor {
  private static instance: ClientEmotionProcessor;
  
  private constructor() {}
  
  static getInstance(): ClientEmotionProcessor {
    if (!ClientEmotionProcessor.instance) {
      ClientEmotionProcessor.instance = new ClientEmotionProcessor();
    }
    return ClientEmotionProcessor.instance;
  }

  // Pre-process input to identify potential emotion keywords
  preprocessInput(input: string): {
    normalizedInput: string;
    detectedKeywords: string[];
    metaphorIndicators: string[];
  } {
    const normalizedInput = input.toLowerCase().trim();
    
    // Common emotion keywords
    const emotionKeywords = [
      'happy', 'sad', 'angry', 'scared', 'love', 'hate', 'joy', 'fear',
      'excited', 'disappointed', 'frustrated', 'calm', 'anxious', 'content',
      'elated', 'depressed', 'furious', 'terrified', 'ecstatic', 'miserable'
    ];
    
    // Metaphor indicators
    const metaphorIndicators = [
      'like', 'as if', 'feels like', 'seems like', 'reminds me',
      'similar to', 'kind of', 'sort of', 'almost like', 'as though'
    ];
    
    const detectedKeywords = emotionKeywords.filter(keyword => 
      normalizedInput.includes(keyword)
    );
    
    const detectedMetaphors = metaphorIndicators.filter(indicator => 
      normalizedInput.includes(indicator)
    );
    
    return {
      normalizedInput,
      detectedKeywords,
      metaphorIndicators: detectedMetaphors
    };
  }

  // Suggest emotion families based on input
  suggestEmotionFamilies(input: string): string[] {
    const { detectedKeywords } = this.preprocessInput(input);
    
    const emotionFamilyMap: Record<string, string[]> = {
      'JOY': ['happy', 'excited', 'elated', 'content', 'joyful', 'thrilled', 'delighted'],
      'SADNESS': ['sad', 'disappointed', 'depressed', 'miserable', 'heartbroken', 'melancholy'],
      'ANGER': ['angry', 'frustrated', 'furious', 'mad', 'irritated', 'rage', 'annoyed'],
      'FEAR': ['scared', 'anxious', 'terrified', 'worried', 'nervous', 'panic', 'dread'],
      'LOVE': ['love', 'affection', 'adoration', 'fondness', 'care', 'cherish'],
      'SURPRISE': ['surprised', 'amazed', 'shocked', 'astonished', 'stunned']
    };
    
    const suggestions = new Set<string>();
    
    for (const keyword of detectedKeywords) {
      for (const [family, keywords] of Object.entries(emotionFamilyMap)) {
        if (keywords.includes(keyword)) {
          suggestions.add(family);
        }
      }
    }
    
    return Array.from(suggestions);
  }

  // Validate intensity range
  validateIntensityRange(min: number, max: number): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (min < 0 || min > 1) {
      errors.push('Minimum intensity must be between 0 and 1');
    }
    
    if (max < 0 || max > 1) {
      errors.push('Maximum intensity must be between 0 and 1');
    }
    
    if (min >= max) {
      errors.push('Minimum intensity must be less than maximum intensity');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Format emotion triggers for display
  formatTriggers(triggers: string[]): string {
    return triggers.join(', ');
  }

  // Parse triggers from comma-separated string
  parseTriggers(triggerString: string): string[] {
    return triggerString
      .split(',')
      .map(trigger => trigger.trim())
      .filter(trigger => trigger.length > 0);
  }
}

export const emotionProcessor = ClientEmotionProcessor.getInstance();
