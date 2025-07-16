/**
 * HEART™ Alignment Validator - Ensures ethical emotional processing
 * Based on HEART principles: Transparency, Alignment, Contextuality, Traceability
 */

export interface HeartValidationResult {
  alignment_score: number;
  transparency_check: boolean;
  contextual_appropriateness: boolean;
  traceability_status: boolean;
  ethical_flags: string[];
  recommendations: string[];
  heart_compliant: boolean;
}

export interface EmotionValidationContext {
  emotion_code: string;
  input_phrase: string;
  cultural_context: string;
  intensity: number;
  processing_context: 'therapeutic' | 'research' | 'development' | 'clinical';
  user_consent_level: 'explicit' | 'implied' | 'research';
}

export class HeartAlignmentValidator {
  private ethicalThresholds = {
    min_transparency: 0.7,
    max_intensity_without_consent: 0.6,
    cultural_sensitivity_threshold: 0.8,
    vulnerable_emotion_threshold: 0.7
  };

  private vulnerableEmotions = new Set([
    'SAD-005', // Despair
    'FEA-004', // Panic
    'ANG-003', // Rage
    'SHA-003', // Deep Shame
    'GUI-003', // Overwhelming Guilt
    'HEL-001', // Helplessness
    'TRA-001', // Trauma responses
    'SUI-001'  // Suicidal ideation
  ]);

  /**
   * Validate emotional processing against HEART™ principles
   */
  validateEmotionalProcessing(context: EmotionValidationContext): HeartValidationResult {
    const transparencyCheck = this.checkTransparency(context);
    const alignmentScore = this.calculateAlignmentScore(context);
    const contextualCheck = this.checkContextualAppropriateness(context);
    const traceabilityCheck = this.checkTraceability(context);
    
    const ethicalFlags = this.identifyEthicalFlags(context);
    const recommendations = this.generateRecommendations(context, ethicalFlags);
    
    const heartCompliant = this.determineOverallCompliance(
      transparencyCheck,
      alignmentScore,
      contextualCheck,
      traceabilityCheck,
      ethicalFlags
    );

    return {
      alignment_score: alignmentScore,
      transparency_check: transparencyCheck,
      contextual_appropriateness: contextualCheck,
      traceability_status: traceabilityCheck,
      ethical_flags: ethicalFlags,
      recommendations: recommendations,
      heart_compliant: heartCompliant
    };
  }

  private checkTransparency(context: EmotionValidationContext): boolean {
    // Ensure the emotional processing is transparent and explainable
    
    // Check if emotion code is valid and documented
    if (!context.emotion_code || context.emotion_code.length < 6) {
      return false;
    }
    
    // Verify input phrase is non-empty and meaningful
    if (!context.input_phrase || context.input_phrase.trim().length < 3) {
      return false;
    }
    
    // Check cultural context is specified
    if (!context.cultural_context) {
      return false;
    }
    
    return true;
  }

  private calculateAlignmentScore(context: EmotionValidationContext): number {
    let score = 1.0;
    
    // Reduce score for vulnerable emotions without appropriate consent
    if (this.vulnerableEmotions.has(context.emotion_code)) {
      if (context.user_consent_level === 'implied') {
        score -= 0.3;
      }
      if (context.intensity > this.ethicalThresholds.vulnerable_emotion_threshold) {
        score -= 0.2;
      }
    }
    
    // Adjust for processing context appropriateness
    if (context.processing_context === 'development' && context.intensity > 0.8) {
      score -= 0.1; // High-intensity emotions need appropriate context
    }
    
    // Cultural sensitivity adjustment
    if (this.requiresCulturalSensitivity(context.emotion_code)) {
      if (context.cultural_context === 'Auto-detect' || !context.cultural_context) {
        score -= 0.2;
      }
    }
    
    return Math.max(0, Math.min(1, score));
  }

  private checkContextualAppropriateness(context: EmotionValidationContext): boolean {
    // Verify the emotional processing is appropriate for the context
    
    // Clinical/therapeutic contexts have higher standards
    if (context.processing_context === 'clinical' || context.processing_context === 'therapeutic') {
      if (this.vulnerableEmotions.has(context.emotion_code)) {
        return context.user_consent_level === 'explicit';
      }
    }
    
    // Research contexts need explicit consent for vulnerable emotions
    if (context.processing_context === 'research') {
      if (this.vulnerableEmotions.has(context.emotion_code)) {
        return context.user_consent_level === 'explicit' || context.user_consent_level === 'research';
      }
    }
    
    // Development contexts should use lower-intensity emotional data
    if (context.processing_context === 'development') {
      return context.intensity <= this.ethicalThresholds.max_intensity_without_consent;
    }
    
    return true;
  }

  private checkTraceability(context: EmotionValidationContext): boolean {
    // Ensure emotional processing can be traced and audited
    
    // Must have valid emotion code for traceability
    if (!context.emotion_code || !context.emotion_code.match(/^[A-Z]{3}-\d{3}$/)) {
      return false;
    }
    
    // Must have processing context for audit trails
    if (!context.processing_context) {
      return false;
    }
    
    // Input phrase must be present for traceability
    if (!context.input_phrase) {
      return false;
    }
    
    return true;
  }

  private identifyEthicalFlags(context: EmotionValidationContext): string[] {
    const flags: string[] = [];
    
    // Flag vulnerable emotions
    if (this.vulnerableEmotions.has(context.emotion_code)) {
      flags.push('VULNERABLE_EMOTION_DETECTED');
      
      if (context.user_consent_level !== 'explicit') {
        flags.push('INSUFFICIENT_CONSENT_FOR_VULNERABLE_EMOTION');
      }
    }
    
    // Flag high-intensity processing
    if (context.intensity > 0.8) {
      flags.push('HIGH_INTENSITY_EMOTION');
      
      if (context.processing_context === 'development') {
        flags.push('HIGH_INTENSITY_IN_DEVELOPMENT_CONTEXT');
      }
    }
    
    // Flag cultural sensitivity issues
    if (this.requiresCulturalSensitivity(context.emotion_code)) {
      if (!context.cultural_context || context.cultural_context === 'Auto-detect') {
        flags.push('CULTURAL_CONTEXT_REQUIRED');
      }
    }
    
    // Flag potential privacy concerns
    if (this.containsPersonalInformation(context.input_phrase)) {
      flags.push('POTENTIAL_PERSONAL_INFORMATION');
    }
    
    return flags;
  }

  private generateRecommendations(context: EmotionValidationContext, flags: string[]): string[] {
    const recommendations: string[] = [];
    
    if (flags.includes('VULNERABLE_EMOTION_DETECTED')) {
      recommendations.push('Consider additional care protocols for vulnerable emotional states');
      recommendations.push('Ensure appropriate support resources are available');
    }
    
    if (flags.includes('INSUFFICIENT_CONSENT_FOR_VULNERABLE_EMOTION')) {
      recommendations.push('Obtain explicit consent before processing vulnerable emotional states');
      recommendations.push('Provide clear information about emotional processing');
    }
    
    if (flags.includes('HIGH_INTENSITY_EMOTION')) {
      recommendations.push('Monitor for emotional escalation or crisis indicators');
      recommendations.push('Have de-escalation protocols ready');
    }
    
    if (flags.includes('CULTURAL_CONTEXT_REQUIRED')) {
      recommendations.push('Specify appropriate cultural context for accurate emotional interpretation');
      recommendations.push('Consider cultural modulation factors');
    }
    
    if (flags.includes('POTENTIAL_PERSONAL_INFORMATION')) {
      recommendations.push('Review input for personal information and apply appropriate privacy protections');
      recommendations.push('Consider data anonymization if required');
    }
    
    return recommendations;
  }

  private determineOverallCompliance(
    transparency: boolean,
    alignmentScore: number,
    contextual: boolean,
    traceability: boolean,
    flags: string[]
  ): boolean {
    // All core checks must pass
    if (!transparency || !contextual || !traceability) {
      return false;
    }
    
    // Alignment score must meet threshold
    if (alignmentScore < this.ethicalThresholds.min_transparency) {
      return false;
    }
    
    // Critical flags prevent compliance
    const criticalFlags = [
      'INSUFFICIENT_CONSENT_FOR_VULNERABLE_EMOTION',
      'HIGH_INTENSITY_IN_DEVELOPMENT_CONTEXT'
    ];
    
    const hasCriticalFlags = flags.some(flag => criticalFlags.includes(flag));
    if (hasCriticalFlags) {
      return false;
    }
    
    return true;
  }

  private requiresCulturalSensitivity(emotionCode: string): boolean {
    // Emotions that require cultural context for appropriate processing
    const culturallySensitiveEmotions = new Set([
      'SHA-001', // Shame (varies greatly by culture)
      'ANG-006', // Moral Outrage (culture-specific triggers)
      'LOV-001', // Love (expression varies by culture)
      'FEA-001', // Fear (cultural fears vary)
      'GRI-001', // Grief (cultural mourning practices)
      'JOY-001'  // Joy (cultural expression norms)
    ]);
    
    return culturallySensitiveEmotions.has(emotionCode);
  }

  private containsPersonalInformation(input: string): boolean {
    // Basic check for potential personal information
    const personalInfoPatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN pattern
      /\b\d{3}-\d{3}-\d{4}\b/, // Phone pattern
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email pattern
      /\bmy name is\b/i,
      /\bi am [A-Z][a-z]+\b/i, // "I am John" pattern
      /\bI live (at|on|in)\b/i
    ];
    
    return personalInfoPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Get validation requirements for a specific emotion code
   */
  getValidationRequirements(emotionCode: string): {
    requires_explicit_consent: boolean;
    requires_cultural_context: boolean;
    max_safe_intensity: number;
    recommended_contexts: string[];
  } {
    return {
      requires_explicit_consent: this.vulnerableEmotions.has(emotionCode),
      requires_cultural_context: this.requiresCulturalSensitivity(emotionCode),
      max_safe_intensity: this.vulnerableEmotions.has(emotionCode) ? 0.6 : 0.8,
      recommended_contexts: this.getRecommendedContexts(emotionCode)
    };
  }

  private getRecommendedContexts(emotionCode: string): string[] {
    if (this.vulnerableEmotions.has(emotionCode)) {
      return ['therapeutic', 'clinical', 'research'];
    }
    
    return ['development', 'research', 'therapeutic', 'clinical'];
  }
}

export const heartAlignmentValidator = new HeartAlignmentValidator();