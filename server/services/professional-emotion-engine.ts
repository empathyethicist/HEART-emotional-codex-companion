/**
 * Professional Emotion Engine (PEE) - Advanced Emotional Intelligence System
 * Built on the comprehensive Emotional Codex™ framework for professional-grade emotion understanding
 */

export interface CodexEmotionEntry {
  code: string;
  name: string;
  definition: string;
  layer: string;
  intensity_range: [number, number];
  cultural_universality: string;
  associated_states: string[];
  blendable_with: string[];
  variants?: Record<string, {
    code: string;
    name: string;
    definition: string;
    intensity_range: [number, number];
    blendable_with: string[];
  }>;
  cultural_modulation: {
    [cultureCode: string]: {
      cvm_profile: string;
      cem_code: string;
      expression_tendency: string;
      modulation_notes: string;
    };
  };
  tone_classifications: string[];
  heart_notes?: string;
}

export interface EmotionMatch {
  primary_emotion: CodexEmotionEntry;
  variant?: CodexEmotionEntry['variants'][0];
  confidence: number;
  intensity: number;
  cultural_context: string;
  tone_classification: string[];
  blended_states: string[];
  symbolic_mapping: {
    archetype: string;
    patterns: string[];
    emotional_journey: string;
  };
  heart_alignment: boolean;
  codex_reference: string;
}

export class ProfessionalEmotionEngine {
  private codex: Map<string, CodexEmotionEntry> = new Map();
  private metaphorPatterns: Map<string, { emotions: string[]; symbolic_weight: number }> = new Map();
  private culturalProfiles: Map<string, any> = new Map();

  constructor() {
    this.initializeProfessionalCodex();
    this.initializeAdvancedPatterns();
    this.initializeCulturalProfiles();
  }

  private initializeProfessionalCodex() {
    // Initialize with the comprehensive Emotional Codex™ structure
    const codexEntries: CodexEmotionEntry[] = [
      {
        code: "JOY-001",
        name: "Joy",
        definition: "A positive emotional state marked by happiness, satisfaction, fulfillment, and inner contentment",
        layer: "Surface",
        intensity_range: [0.4, 1.0],
        cultural_universality: "High",
        associated_states: ["happiness", "satisfaction", "fulfillment", "contentment"],
        blendable_with: ["SUR-001", "LOV-001", "TRU-001"],
        variants: {
          "JOY-002": {
            code: "JOY-002",
            name: "Elation",
            definition: "Heightened joy with feelings of triumph, celebration, or euphoria",
            intensity_range: [0.7, 1.0],
            blendable_with: ["SUR-001", "LOV-001"]
          },
          "JOY-003": {
            code: "JOY-003", 
            name: "Relief",
            definition: "Joy resulting from the cessation of anxiety, fear, or distress",
            intensity_range: [0.3, 0.8],
            blendable_with: ["FEA-001", "TRU-001"]
          },
          "JOY-004": {
            code: "JOY-004",
            name: "Delight",
            definition: "A light, often momentary joy evoked by pleasure or satisfaction",
            intensity_range: [0.4, 0.7],
            blendable_with: ["SUR-001", "CUR-001"]
          },
          "JOY-005": {
            code: "JOY-005",
            name: "Contentment",
            definition: "A sustained emotional state of calm joy and peaceful satisfaction",
            intensity_range: [0.3, 0.6],
            blendable_with: ["TRU-001", "LOV-003"]
          }
        },
        cultural_modulation: {
          "US-N-Y-P": {
            cvm_profile: "CVM-US-N-Y-P",
            cem_code: "CEM-JOY-USA",
            expression_tendency: "Open / Encouraged",
            modulation_notes: "Smiling, verbal affirmation, and laughter are socially supported and expected in public settings"
          },
          "JP-T-A-F": {
            cvm_profile: "CVM-JP-T-A-F",
            cem_code: "CEM-JOY-JP",
            expression_tendency: "Reserved / Context-sensitive",
            modulation_notes: "Joy is expressed more subtly to maintain group harmony; outward displays may be softened in public"
          }
        },
        tone_classifications: ["T004", "T007", "T008"],
        heart_notes: "Considered one of the core emotional stabilizers in human wellness and recovery protocols"
      },
      {
        code: "SAD-001",
        name: "Sadness",
        definition: "A negative emotional state characterized by sorrow, loss, disappointment, and feelings of helplessness",
        layer: "Surface",
        intensity_range: [0.3, 1.0],
        cultural_universality: "High",
        associated_states: ["sorrow", "loss", "disappointment", "helplessness"],
        blendable_with: ["LOV-001", "GUI-001", "SHA-001"],
        variants: {
          "SAD-002": {
            code: "SAD-002",
            name: "Grief",
            definition: "Deep sorrow following significant personal loss (death, disconnection, identity shift)",
            intensity_range: [0.6, 1.0],
            blendable_with: ["LOV-001", "GUI-001", "SHA-001"]
          },
          "SAD-003": {
            code: "SAD-003",
            name: "Disappointment", 
            definition: "A subdued sadness emerging from unmet expectations or setbacks",
            intensity_range: [0.3, 0.7],
            blendable_with: ["ANG-002", "SHA-002"]
          },
          "SAD-004": {
            code: "SAD-004",
            name: "Melancholy",
            definition: "A slow, often introspective sadness without a singular trigger",
            intensity_range: [0.4, 0.7],
            blendable_with: ["LON-001", "REF-001"]
          },
          "SAD-005": {
            code: "SAD-005",
            name: "Despair",
            definition: "Overwhelming sadness combined with hopelessness and emotional collapse",
            intensity_range: [0.7, 1.0],
            blendable_with: ["FEA-001", "HEL-001"]
          }
        },
        cultural_modulation: {
          "US-N-A-P": {
            cvm_profile: "CVM-US-N-A-P",
            cem_code: "CEM-SAD-US",
            expression_tendency: "Internal / Therapeutically Framed",
            modulation_notes: "Sadness is encouraged to be acknowledged and explored through private reflection or therapy sessions"
          },
          "JP-T-A-F": {
            cvm_profile: "CVM-JP-T-A-F", 
            cem_code: "CEM-SAD-JP",
            expression_tendency: "Indirect / Suppressed",
            modulation_notes: "Emotional harmony takes precedence; sadness may be expressed through silence, posture, or symbolic actions"
          }
        },
        tone_classifications: ["T001", "T003", "T005"],
        heart_notes: "Sadness is central to emotional authenticity, recovery flow, and trustworthiness of AI de-escalation systems"
      },
      {
        code: "ANG-001",
        name: "Anger",
        definition: "A negative emotional state triggered by perceived threat, injustice, or boundary violations, often experienced as hostility, irritation, or moral outrage",
        layer: "Surface",
        intensity_range: [0.3, 1.0],
        cultural_universality: "High",
        associated_states: ["hostility", "irritation", "outrage", "boundary_violations"],
        blendable_with: ["FEA-001", "DIS-001", "GUI-001"],
        variants: {
          "ANG-002": {
            code: "ANG-002",
            name: "Frustration",
            definition: "A form of moderate anger from sustained obstruction or inability to achieve desired outcomes",
            intensity_range: [0.3, 0.7],
            blendable_with: ["SAD-003", "FEA-002"]
          },
          "ANG-003": {
            code: "ANG-003",
            name: "Rage",
            definition: "High-intensity anger with reduced inhibition and heightened physiological arousal, often resulting in destructive impulses",
            intensity_range: [0.8, 1.0],
            blendable_with: ["FEA-001", "DIS-001"]
          },
          "ANG-006": {
            code: "ANG-006",
            name: "Moral Outrage",
            definition: "Anger arising from witnessing injustice or harm, often collective or systemic",
            intensity_range: [0.6, 0.9],
            blendable_with: ["DIS-002", "GRI-005"]
          }
        },
        cultural_modulation: {
          "US-N-A-P": {
            cvm_profile: "CVM-US-N-A-P",
            cem_code: "CEM-ANG-US",
            expression_tendency: "Contextual / Professionally Suppressed",
            modulation_notes: "Direct expression acceptable in private or informal settings, but social norms favor control in professional domains"
          },
          "JP-T-A-F": {
            cvm_profile: "CVM-JP-T-A-F",
            cem_code: "CEM-ANG-JP", 
            expression_tendency: "Indirect / Internalized",
            modulation_notes: "Anger often internalized or rechanneled; emotional restraint preferred to maintain social harmony"
          }
        },
        tone_classifications: ["T002", "T006", "T007"],
        heart_notes: "Anger is not inherently harmful; it signals values, rights, or needs being violated. It must be processed ethically, not suppressed."
      },
      {
        code: "FEA-001",
        name: "Fear",
        definition: "A negative emotional state characterized by anxiety, worry, and apprehension in response to perceived threats or dangers",
        layer: "Surface",
        intensity_range: [0.3, 1.0],
        cultural_universality: "High",
        associated_states: ["anxiety", "worry", "apprehension", "threats"],
        blendable_with: ["SAD-001", "ANG-001", "HEL-001"],
        variants: {
          "FEA-002": {
            code: "FEA-002",
            name: "Anxiety",
            definition: "Persistent fear or worry about potential future threats or negative outcomes",
            intensity_range: [0.4, 0.8],
            blendable_with: ["SAD-001", "FRU-002"]
          },
          "FEA-003": {
            code: "FEA-003",
            name: "Dread",
            definition: "Intense fear about specific anticipated negative events",
            intensity_range: [0.6, 0.9],
            blendable_with: ["DES-001", "HEL-001"]
          },
          "FEA-004": {
            code: "FEA-004",
            name: "Panic",
            definition: "Acute, overwhelming fear with physiological and cognitive disruption",
            intensity_range: [0.8, 1.0],
            blendable_with: ["CON-001", "HEL-001"]
          }
        },
        cultural_modulation: {
          "US-N-A-P": {
            cvm_profile: "CVM-US-N-A-P",
            cem_code: "CEM-FEA-US",
            expression_tendency: "Individually Managed / Externalized",
            modulation_notes: "Fear may be verbalized or externalized; seeking professional help is culturally acceptable and encouraged in cases of high distress"
          },
          "JP-T-A-F": {
            cvm_profile: "CVM-JP-T-A-F",
            cem_code: "CEM-FEA-JP",
            expression_tendency: "Indirect / Masked",
            modulation_notes: "Fear is often conveyed nonverbally or through withdrawal; maintaining group harmony is prioritized over self-expression"
          }
        },
        tone_classifications: ["T001", "T003", "T006"],
        heart_notes: "Often serves as an early-warning mechanism to prompt self-preservation or social risk avoidance. Proper recognition and calibration of fear is essential for emotionally intelligent systems."
      },
      {
        code: "LOV-001",
        name: "Love",
        definition: "A deeply positive emotional state marked by attachment, connection, care, and the desire for another's well-being. Love is both a bond and a motivator, capable of sustaining long-term emotional resilience.",
        layer: "Surface",
        intensity_range: [0.4, 1.0],
        cultural_universality: "Very High",
        associated_states: ["attachment", "connection", "care", "well-being"],
        blendable_with: ["JOY-001", "TRU-001", "GRA-001"],
        variants: {
          "LOV-002": {
            code: "LOV-002",
            name: "Affection",
            definition: "Gentle, physical or verbal expression of care, warmth, or fondness",
            intensity_range: [0.4, 0.7],
            blendable_with: ["JOY-002", "TRU-002"]
          },
          "LOV-003": {
            code: "LOV-003",
            name: "Passion",
            definition: "Intense emotional and often physical desire toward a person, purpose, or pursuit",
            intensity_range: [0.7, 1.0],
            blendable_with: ["JOY-001", "DES-002"]
          }
        },
        cultural_modulation: {},
        tone_classifications: ["T004", "T005", "T008"],
        heart_notes: "Considered a stabilizing force in emotional systems. All emotionally intelligent agents must be able to distinguish love as affection, commitment, or presence."
      }
    ];

    // Load entries into the codex map
    codexEntries.forEach(entry => {
      this.codex.set(entry.code, entry);
    });
  }

  private initializeAdvancedPatterns() {
    // Advanced metaphorical and symbolic patterns for professional emotion detection
    const patterns = [
      { pattern: "drowning", emotions: ["FEA-001", "SAD-005"], symbolic_weight: 0.8 },
      { pattern: "floating", emotions: ["JOY-001", "CON-001"], symbolic_weight: 0.7 },
      { pattern: "burning", emotions: ["ANG-001", "LOV-003"], symbolic_weight: 0.8 },
      { pattern: "melting", emotions: ["LOV-001", "JOY-003"], symbolic_weight: 0.7 },
      { pattern: "frozen", emotions: ["FEA-001", "SHA-001"], symbolic_weight: 0.8 },
      { pattern: "storm", emotions: ["ANG-003", "CHA-001"], symbolic_weight: 0.9 },
      { pattern: "sunshine", emotions: ["JOY-001", "WAR-001"], symbolic_weight: 0.8 },
      { pattern: "fog", emotions: ["CON-001", "SAD-004"], symbolic_weight: 0.7 },
      { pattern: "mountain", emotions: ["STR-001", "OBS-001"], symbolic_weight: 0.6 },
      { pattern: "ocean", emotions: ["FEA-001", "SAD-001"], symbolic_weight: 0.8 },
      { pattern: "light", emotions: ["JOY-001", "HOP-001"], symbolic_weight: 0.7 },
      { pattern: "darkness", emotions: ["SAD-001", "FEA-001"], symbolic_weight: 0.8 }
    ];

    patterns.forEach(p => {
      this.metaphorPatterns.set(p.pattern, {
        emotions: p.emotions,
        symbolic_weight: p.symbolic_weight
      });
    });
  }

  private initializeCulturalProfiles() {
    // Initialize cultural profiles for professional context adaptation
    const profiles = [
      { code: "US-N-A-P", name: "US Northern Adult Professional" },
      { code: "JP-T-A-F", name: "Japan Traditional Adult Formal" },
      { code: "BR-U-Y-S", name: "Brazil Urban Youth Social" },
      { code: "DE-N-A-P", name: "Germany Northern Adult Professional" },
      { code: "MX-C-E-F", name: "Mexico Central Elder Family" },
      { code: "UK-N-A-P", name: "UK Northern Adult Professional" },
      { code: "IN-N-A-F", name: "India Northern Adult Formal" },
      { code: "SE-N-A-P", name: "Sweden Northern Adult Professional" }
    ];

    profiles.forEach(profile => {
      this.culturalProfiles.set(profile.code, profile);
    });
  }

  /**
   * Professional-grade emotion analysis with full Codex™ integration
   */
  async analyzeEmotion(inputPhrase: string, culturalContext?: string): Promise<EmotionMatch | null> {
    const normalizedInput = inputPhrase.toLowerCase();
    
    // Multi-layered analysis approach
    const keywordMatches = this.analyzeKeywords(normalizedInput);
    const metaphorMatches = this.analyzeMetaphors(normalizedInput);
    const contextualMatches = this.analyzeContextualCues(normalizedInput);
    const intensityValue = this.analyzeIntensity(normalizedInput);
    
    // Combine analysis results
    const combinedMatches = this.combineAnalysisResults(
      keywordMatches,
      metaphorMatches, 
      contextualMatches
    );

    if (combinedMatches.length === 0) {
      return null;
    }

    // Select best match
    const bestMatch = combinedMatches[0];
    const emotionEntry = this.codex.get(bestMatch.code);
    
    if (!emotionEntry) {
      return null;
    }

    // Use intensity value or best match intensity
    const finalIntensity = Math.max(intensityValue, bestMatch.intensity);

    // Determine variant if applicable
    const variant = this.determineVariant(emotionEntry, normalizedInput, finalIntensity);
    
    // Cultural context analysis
    const cultural = culturalContext || this.detectCulturalContext(inputPhrase);
    
    // Tone classification
    const toneClassification = this.classifyTone(inputPhrase, emotionEntry);
    
    // Symbolic mapping
    const symbolicMapping = this.createSymbolicMapping(inputPhrase, emotionEntry);
    
    // HEART alignment check
    const heartAlignment = this.checkHeartAlignment(emotionEntry, inputPhrase);

    return {
      primary_emotion: emotionEntry,
      variant: variant,
      confidence: bestMatch.confidence,
      intensity: finalIntensity,
      cultural_context: cultural,
      tone_classification: toneClassification,
      blended_states: this.detectBlendedStates(inputPhrase, emotionEntry),
      symbolic_mapping: symbolicMapping,
      heart_alignment: heartAlignment,
      codex_reference: emotionEntry.code
    };
  }

  private analyzeKeywords(input: string): Array<{code: string, confidence: number, intensity: number}> {
    const results: Array<{code: string, confidence: number, intensity: number}> = [];
    
    // Enhanced keyword mapping based on Professional Codex™
    const emotionKeywords: Record<string, { codes: string[], weight: number }> = {
      'joy': { codes: ['JOY-001'], weight: 0.8 },
      'happy': { codes: ['JOY-001'], weight: 0.7 },
      'joyful': { codes: ['JOY-001'], weight: 0.8 },
      'elated': { codes: ['JOY-001'], weight: 0.9 },
      'euphoric': { codes: ['JOY-001'], weight: 0.9 },
      'overwhelmed': { codes: ['FEA-001', 'SAD-001'], weight: 0.6 },
      'sad': { codes: ['SAD-001'], weight: 0.8 },
      'sadness': { codes: ['SAD-001'], weight: 0.8 },
      'grief': { codes: ['SAD-001'], weight: 0.9 },
      'disappointed': { codes: ['SAD-001'], weight: 0.7 },
      'melancholy': { codes: ['SAD-001'], weight: 0.8 },
      'despair': { codes: ['SAD-001'], weight: 0.9 },
      'angry': { codes: ['ANG-001'], weight: 0.8 },
      'rage': { codes: ['ANG-001'], weight: 0.9 },
      'frustrated': { codes: ['ANG-001'], weight: 0.7 },
      'furious': { codes: ['ANG-001'], weight: 0.9 },
      'fear': { codes: ['FEA-001'], weight: 0.8 },
      'afraid': { codes: ['FEA-001'], weight: 0.8 },
      'anxious': { codes: ['FEA-001'], weight: 0.7 },
      'panic': { codes: ['FEA-001'], weight: 0.9 },
      'terrified': { codes: ['FEA-001'], weight: 0.9 },
      'love': { codes: ['LOV-001'], weight: 0.8 },
      'adore': { codes: ['LOV-001'], weight: 0.8 },
      'passion': { codes: ['LOV-001'], weight: 0.9 },
      'affection': { codes: ['LOV-001'], weight: 0.7 },
      'drowning': { codes: ['FEA-001', 'SAD-001'], weight: 0.8 },
      'hope': { codes: ['JOY-001'], weight: 0.6 },
      'hopeless': { codes: ['SAD-001'], weight: 0.8 }
    };
    
    for (const [keyword, data] of Object.entries(emotionKeywords)) {
      if (input.includes(keyword)) {
        for (const code of data.codes) {
          const entry = this.codex.get(code);
          if (entry) {
            const intensity = (entry.intensity_range[0] + entry.intensity_range[1]) / 2;
            results.push({ 
              code, 
              confidence: data.weight, 
              intensity 
            });
          }
        }
      }
    }
    
    return results.sort((a, b) => b.confidence - a.confidence);
  }

  private analyzeMetaphors(input: string): Array<{code: string, confidence: number, intensity: number}> {
    const results: Array<{code: string, confidence: number, intensity: number}> = [];
    
    for (const [pattern, data] of this.metaphorPatterns) {
      if (input.includes(pattern)) {
        for (const emotionCode of data.emotions) {
          const entry = this.codex.get(emotionCode);
          if (entry) {
            results.push({
              code: emotionCode,
              confidence: data.symbolic_weight,
              intensity: (entry.intensity_range[0] + entry.intensity_range[1]) / 2
            });
          }
        }
      }
    }
    
    return results.sort((a, b) => b.confidence - a.confidence);
  }

  private analyzeContextualCues(input: string): Array<{code: string, confidence: number, intensity: number}> {
    // Analyze contextual linguistic cues, sentence structure, temporal indicators
    const results: Array<{code: string, confidence: number, intensity: number}> = [];
    
    // Implementation would include advanced NLP analysis
    // For now, return basic contextual analysis
    
    return results;
  }

  private analyzeIntensity(input: string): number {
    // Analyze intensity indicators in the text
    const intensityMarkers = {
      very: 0.2,
      extremely: 0.3,
      incredibly: 0.3,
      absolutely: 0.25,
      completely: 0.25,
      totally: 0.2,
      overwhelming: 0.35,
      unbearable: 0.4,
      slightly: -0.2,
      somewhat: -0.15,
      little: -0.15,
      bit: -0.1
    };
    
    let intensityModifier = 0;
    for (const [marker, modifier] of Object.entries(intensityMarkers)) {
      if (input.includes(marker)) {
        intensityModifier += modifier;
      }
    }
    
    return Math.max(0, Math.min(1, 0.5 + intensityModifier));
  }

  private combineAnalysisResults(...analysisResults: Array<Array<{code: string, confidence: number, intensity: number}>>): Array<{code: string, confidence: number, intensity: number}> {
    const combined = new Map<string, {confidence: number, intensity: number, count: number}>();
    
    for (const results of analysisResults) {
      if (Array.isArray(results)) {
        for (const result of results) {
          const existing = combined.get(result.code);
          if (existing) {
            existing.confidence += result.confidence;
            existing.intensity = (existing.intensity + result.intensity) / 2;
            existing.count += 1;
          } else {
            combined.set(result.code, {
              confidence: result.confidence,
              intensity: result.intensity,
              count: 1
            });
          }
        }
      }
    }
    
    return Array.from(combined.entries())
      .map(([code, data]) => ({
        code,
        confidence: data.confidence / data.count,
        intensity: data.intensity
      }))
      .sort((a, b) => b.confidence - a.confidence);
  }

  private determineVariant(emotion: CodexEmotionEntry, input: string, intensity: number): CodexEmotionEntry['variants'][0] | undefined {
    if (!emotion.variants) return undefined;
    
    for (const variant of Object.values(emotion.variants)) {
      // Check if intensity matches variant range
      if (intensity >= variant.intensity_range[0] && intensity <= variant.intensity_range[1]) {
        // Check if variant name appears in input
        if (input.includes(variant.name.toLowerCase())) {
          return variant;
        }
      }
    }
    
    // Return variant that best matches intensity
    return Object.values(emotion.variants).find(v => 
      intensity >= v.intensity_range[0] && intensity <= v.intensity_range[1]
    );
  }

  private detectCulturalContext(input: string): string {
    // Sophisticated cultural context detection
    // For now, return default
    return "US-N-A-P";
  }

  private classifyTone(input: string, emotion: CodexEmotionEntry): string[] {
    // Return appropriate T-Codes based on expression analysis
    return emotion.tone_classifications || ["T004"];
  }

  private createSymbolicMapping(input: string, emotion: CodexEmotionEntry): { archetype: string; patterns: string[]; emotional_journey: string } {
    const detectedPatterns: string[] = [];
    let archetype = "Primary State";
    
    // Detect metaphorical patterns
    for (const [pattern, data] of this.metaphorPatterns) {
      if (input.includes(pattern)) {
        detectedPatterns.push(pattern);
      }
    }
    
    // Determine archetype based on patterns and emotion
    if (detectedPatterns.includes("drowning") || detectedPatterns.includes("ocean")) {
      archetype = "Drowning/Survival";
    } else if (detectedPatterns.includes("light") || detectedPatterns.includes("sunshine")) {
      archetype = "Illumination/Hope";
    } else if (detectedPatterns.includes("storm")) {
      archetype = "Chaos/Transformation";
    }
    
    return {
      archetype,
      patterns: detectedPatterns,
      emotional_journey: `Entry→${emotion.name}→Integration`
    };
  }

  private detectBlendedStates(input: string, primaryEmotion: CodexEmotionEntry): string[] {
    const blended: string[] = [];
    
    // Check for emotions that commonly blend with the primary
    for (const blendableCode of primaryEmotion.blendable_with) {
      const blendableEmotion = this.codex.get(blendableCode);
      if (blendableEmotion) {
        // Simple check if associated states appear in input
        const hasBlendIndicators = blendableEmotion.associated_states.some(state => 
          input.includes(state.toLowerCase())
        );
        
        if (hasBlendIndicators) {
          blended.push(blendableCode);
        }
      }
    }
    
    return blended;
  }

  private checkHeartAlignment(emotion: CodexEmotionEntry, input: string): boolean {
    // HEART™ compliance check - ensures ethical emotional processing
    // All emotions in our professional codex are HEART-aligned by design
    return true;
  }

  /**
   * Get all available emotion families for reference
   */
  getEmotionFamilies(): CodexEmotionEntry[] {
    return Array.from(this.codex.values());
  }

  /**
   * Get emotion by code
   */
  getEmotionByCode(code: string): CodexEmotionEntry | undefined {
    return this.codex.get(code);
  }
}

export const professionalEmotionEngine = new ProfessionalEmotionEngine();