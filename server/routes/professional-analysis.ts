/**
 * Professional Analysis Routes - Advanced Emotional Codex™ endpoints
 */
import type { Express } from "express";
import { professionalEmotionEngine } from "../services/professional-emotion-engine";
import { heartAlignmentValidator } from "../services/heart-alignment-validator";
import { z } from "zod";

const professionalAnalysisSchema = z.object({
  inputPhrase: z.string(),
  culturalContext: z.string().optional(),
  analysisDepth: z.enum(["basic", "comprehensive", "research"]).default("comprehensive")
});

export function registerProfessionalAnalysisRoutes(app: Express) {
  
  // Professional emotion analysis endpoint
  app.post("/api/professional/analyze", async (req, res) => {
    try {
      const data = professionalAnalysisSchema.parse(req.body);
      
      const analysis = await professionalEmotionEngine.analyzeEmotion(
        data.inputPhrase,
        data.culturalContext
      );
      
      if (!analysis) {
        return res.status(404).json({
          message: "Unable to analyze emotion with Professional Codex™",
          suggestions: ["Try a more descriptive emotional expression", "Include cultural context"]
        });
      }
      
      // HEART validation for professional analysis
      const heartValidation = heartAlignmentValidator.validateEmotionalProcessing({
        emotion_code: analysis.codex_reference,
        input_phrase: data.inputPhrase,
        cultural_context: analysis.cultural_context,
        intensity: analysis.intensity,
        processing_context: "research",
        user_consent_level: "research"
      });
      
      res.json({
        analysis,
        heart_validation: heartValidation,
        codex_version: "v1.0.0",
        analysis_timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Get emotion families from Professional Codex™
  app.get("/api/professional/emotions", async (req, res) => {
    try {
      const families = professionalEmotionEngine.getEmotionFamilies();
      
      res.json({
        emotion_families: families,
        total_count: families.length,
        codex_version: "v1.0.0"
      });
      
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get specific emotion by code
  app.get("/api/professional/emotions/:code", async (req, res) => {
    try {
      const { code } = req.params;
      const emotion = professionalEmotionEngine.getEmotionByCode(code);
      
      if (!emotion) {
        return res.status(404).json({
          message: `Emotion code '${code}' not found in Professional Codex™`
        });
      }
      
      // Get HEART validation requirements for this emotion
      const requirements = heartAlignmentValidator.getValidationRequirements(code);
      
      res.json({
        emotion,
        validation_requirements: requirements,
        codex_version: "v1.0.0"
      });
      
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Bulk emotion analysis for research
  app.post("/api/professional/bulk-analyze", async (req, res) => {
    try {
      const { inputs, cultural_context } = req.body;
      
      if (!Array.isArray(inputs) || inputs.length === 0) {
        return res.status(400).json({
          message: "Inputs must be a non-empty array of strings"
        });
      }
      
      if (inputs.length > 50) {
        return res.status(400).json({
          message: "Maximum 50 inputs allowed per bulk analysis"
        });
      }
      
      const results = [];
      
      for (const input of inputs) {
        if (typeof input !== 'string') continue;
        
        const analysis = await professionalEmotionEngine.analyzeEmotion(
          input,
          cultural_context
        );
        
        if (analysis) {
          const heartValidation = heartAlignmentValidator.validateEmotionalProcessing({
            emotion_code: analysis.codex_reference,
            input_phrase: input,
            cultural_context: analysis.cultural_context,
            intensity: analysis.intensity,
            processing_context: "research",
            user_consent_level: "research"
          });
          
          results.push({
            input,
            analysis,
            heart_validation: heartValidation
          });
        } else {
          results.push({
            input,
            analysis: null,
            error: "No emotion match found"
          });
        }
      }
      
      res.json({
        results,
        total_processed: results.length,
        successful_analyses: results.filter(r => r.analysis !== null).length,
        analysis_timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
}