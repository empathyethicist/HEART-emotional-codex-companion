import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { emotionCodexService } from "./services/emotion-codex";
import { salDetector } from "./services/sal-detector";
import { culturalOverlayService } from "./services/cultural-overlay";
import { 
  emotionProcessingRequestSchema,
  manualEntrySchema,
  type EmotionProcessingResponse 
} from "@shared/schema";
import { generateEmid } from "./utils/emid-generator";
import { codexPopulator } from "./services/codex-populator";
import { variantExpander } from "./services/variant-expander";
import { cipRubricService } from "./services/cip-rubric";
import { codexIntegrationService } from "./services/codex-integration";
import { toneClassifierService } from "./services/tone-classifier";
import { culturalExpressionModifierService } from "./services/cultural-expression-modifier";
import { professionalEmotionEngine } from "./services/professional-emotion-engine";
import { heartAlignmentValidator } from "./services/heart-alignment-validator";
import { registerProfessionalAnalysisRoutes } from "./routes/professional-analysis";
import * as path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Register Professional Analysis Routes
  registerProfessionalAnalysisRoutes(app);
  
  // Professional Emotion Processing with Comprehensive Codex™ Integration
  app.post("/api/emotions/process", async (req, res) => {
    try {
      const data = emotionProcessingRequestSchema.parse(req.body);
      
      // Use Professional Emotion Engine for comprehensive analysis
      const emotionAnalysis = await professionalEmotionEngine.analyzeEmotion(
        data.inputPhrase, 
        data.culturalContext === "Auto-detect" ? undefined : data.culturalContext
      );

      if (!emotionAnalysis) {
        // Fallback to original codex service for backward compatibility
        const fallbackMatch = emotionCodexService.findEmotionMatch(data.inputPhrase);
        if (!fallbackMatch) {
          return res.status(404).json({ 
            message: "No emotion match found in Professional Codex. Consider using manual entry.",
            suggestions: emotionCodexService.searchEmotions(data.inputPhrase).slice(0, 3)
          });
        }
        
        // Process with fallback approach
        const salAnalysis = salDetector.analyzeSymbolicContent(data.inputPhrase);
        const emid = generateEmid(fallbackMatch.emotion);
        
        const cmopEntry = await storage.createCmopEntry({
          emid,
          inputPhrase: data.inputPhrase,
          emotionFamily: fallbackMatch.emotion,
          variant: fallbackMatch.variant || null,
          codexReference: fallbackMatch.referenceCode,
          intensity: Math.round(fallbackMatch.intensity * 100),
          blendableWith: fallbackMatch.blendableWith,
          symbolicReference: salAnalysis.archetype,
          culturalTag: "Auto-detected",
          confidence: Math.round(fallbackMatch.confidence * 100),
          salAnalysis: {
            symbolicPatterns: salAnalysis.symbolicPatterns,
            archetype: salAnalysis.archetype,
            reasoning: salAnalysis.reasoning
          }
        });

        const response: EmotionProcessingResponse = {
          emid: cmopEntry.emid,
          inputPhrase: cmopEntry.inputPhrase,
          emotionFamily: cmopEntry.emotionFamily,
          variant: cmopEntry.variant || undefined,
          codexReference: cmopEntry.codexReference,
          intensity: cmopEntry.intensity / 100,
          blendableWith: cmopEntry.blendableWith || [],
          symbolicReference: cmopEntry.symbolicReference || undefined,
          culturalTag: cmopEntry.culturalTag || "",
          confidence: cmopEntry.confidence / 100,
          salAnalysis: cmopEntry.salAnalysis || undefined,
          timestamp: cmopEntry.timestamp.toISOString()
        };

        return res.json(response);
      }

      // HEART™ Alignment Validation for professional processing
      const heartValidation = heartAlignmentValidator.validateEmotionalProcessing({
        emotion_code: emotionAnalysis.codex_reference,
        input_phrase: data.inputPhrase,
        cultural_context: emotionAnalysis.cultural_context,
        intensity: emotionAnalysis.intensity,
        processing_context: data.processingMode === "Research Mode" ? "research" : 
                           data.processingMode === "Therapist Mode" ? "therapeutic" : "development",
        user_consent_level: "implied"
      });

      // Enhanced SAL Analysis with symbolic mapping integration
      const salAnalysis = salDetector.analyzeSymbolicContent(data.inputPhrase);

      // Generate EMID with professional emotion code
      const emid = generateEmid(emotionAnalysis.primary_emotion.name);
      
      // Create comprehensive CMOP entry with professional analysis
      const cmopEntry = await storage.createCmopEntry({
        emid,
        inputPhrase: data.inputPhrase,
        emotionFamily: emotionAnalysis.primary_emotion.name,
        variant: emotionAnalysis.variant?.name || null,
        codexReference: emotionAnalysis.codex_reference,
        intensity: Math.round(emotionAnalysis.intensity * 100), // Store as integer 0-100
        blendableWith: emotionAnalysis.blended_states,
        symbolicReference: emotionAnalysis.symbolic_mapping.archetype,
        culturalTag: emotionAnalysis.cultural_context,
        confidence: Math.round(emotionAnalysis.confidence * 100), // Store as integer 0-100
        salAnalysis: {
          symbolicPatterns: [
            ...(Array.isArray(salAnalysis.symbolicPatterns) ? salAnalysis.symbolicPatterns : []),
            ...(Array.isArray(emotionAnalysis.symbolic_mapping.patterns) ? emotionAnalysis.symbolic_mapping.patterns : [])
          ],
          archetype: emotionAnalysis.symbolic_mapping.archetype,
          reasoning: `Professional Codex™ Analysis: ${emotionAnalysis.symbolic_mapping.emotional_journey}. Enhanced with: ${salAnalysis.reasoning}`,
          tone_classification: emotionAnalysis.tone_classification,
          heart_alignment: emotionAnalysis.heart_alignment,
          professional_confidence: emotionAnalysis.confidence,
          heart_validation: heartValidation
        }
      });

      const response: EmotionProcessingResponse = {
        emid: cmopEntry.emid,
        inputPhrase: cmopEntry.inputPhrase,
        emotionFamily: cmopEntry.emotionFamily,
        variant: cmopEntry.variant || undefined,
        codexReference: cmopEntry.codexReference,
        intensity: cmopEntry.intensity / 100, // Convert back to 0-1 scale
        blendableWith: cmopEntry.blendableWith || [],
        symbolicReference: cmopEntry.symbolicReference || undefined,
        culturalTag: cmopEntry.culturalTag || "",
        confidence: cmopEntry.confidence / 100, // Convert back to 0-1 scale
        salAnalysis: cmopEntry.salAnalysis || undefined,
        timestamp: cmopEntry.timestamp.toISOString(),
        // Enhanced professional fields
        professional_analysis: {
          primary_emotion: emotionAnalysis.primary_emotion,
          variant: emotionAnalysis.variant,
          symbolic_mapping: emotionAnalysis.symbolic_mapping,
          tone_classification: emotionAnalysis.tone_classification,
          heart_validation: heartValidation
        }
      };

      res.json(response);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get all emotion entries for codex browser
  app.get("/api/emotions/codex", async (req, res) => {
    try {
      const { search, family } = req.query;
      
      // Get emotion entries from storage instead of codex service
      let emotionEntries = await storage.getAllEmotionEntries();
      
      // Filter by family if specified
      if (family) {
        emotionEntries = emotionEntries.filter(entry => entry.emotionFamily === family);
      }
      
      // Filter by search if specified
      if (search) {
        const searchTerm = (search as string).toLowerCase();
        emotionEntries = emotionEntries.filter(entry => 
          entry.emotionFamily.toLowerCase().includes(searchTerm) ||
          entry.variant?.toLowerCase().includes(searchTerm) ||
          entry.definition.toLowerCase().includes(searchTerm) ||
          (entry.triggers as string[]).some(trigger => trigger.toLowerCase().includes(searchTerm))
        );
      }
      
      // Format the response to match the expected structure
      const formatted = emotionEntries.map(entry => ({
        family: entry.emotionFamily,
        data: {
          reference_code: entry.referenceCode,
          definition: entry.definition,
          intensity_range: [entry.intensityMin, entry.intensityMax] as [number, number],
          cultural_universality: entry.culturalUniversality,
          variants: entry.variants,
          blendable_with: entry.blendableWith,
          triggers: entry.triggers,
          intensity_markers: entry.intensityMarkers
        }
      }));
      
      res.json(formatted);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Manual emotion entry
  app.post("/api/emotions/manual", async (req, res) => {
    try {
      const data = manualEntrySchema.parse(req.body);
      
      // Generate reference code
      const familyCode = data.emotionFamily.substring(0, 3).toUpperCase();
      const existingEntries = await storage.getAllEmotionEntries();
      const familyEntries = existingEntries.filter(entry => 
        entry.referenceCode.startsWith(familyCode)
      );
      const nextNumber = String(familyEntries.length + 1).padStart(3, '0');
      const referenceCode = `${familyCode}-${nextNumber}`;

      const emotionEntry = await storage.createEmotionEntry({
        referenceCode,
        emotionFamily: data.emotionFamily.toUpperCase(),
        variant: data.variantName,
        definition: data.definition,
        intensityMin: Math.round(data.intensityMin * 100),
        intensityMax: Math.round(data.intensityMax * 100),
        culturalUniversality: "Medium", // Default for manual entries
        variants: null,
        blendableWith: data.blendableWith,
        triggers: data.triggers,
        intensityMarkers: {
          low: data.triggers.slice(0, 2),
          medium: data.triggers.slice(1, 3),
          high: data.triggers.slice(2, 4)
        }
      });

      res.json(emotionEntry);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get CMOP by EMID
  app.get("/api/cmop/:emid", async (req, res) => {
    try {
      const { emid } = req.params;
      const cmopEntry = await storage.getCmopEntry(emid);
      
      if (!cmopEntry) {
        return res.status(404).json({ message: "CMOP entry not found" });
      }
      
      res.json(cmopEntry);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Export CMOP in different formats
  app.get("/api/cmop/:emid/export/:format", async (req, res) => {
    try {
      const { emid, format } = req.params;
      const cmopEntry = await storage.getCmopEntry(emid);
      
      if (!cmopEntry) {
        return res.status(404).json({ message: "CMOP entry not found" });
      }

      const exportData = {
        input_phrase: cmopEntry.inputPhrase,
        emotion_family: cmopEntry.emotionFamily,
        variant: cmopEntry.variant,
        codex_reference: cmopEntry.codexReference,
        intensity: cmopEntry.intensity / 100,
        blendable_with: cmopEntry.blendableWith,
        symbolic_reference: cmopEntry.symbolicReference,
        cultural_tag: cmopEntry.culturalTag,
        emid: cmopEntry.emid,
        timestamp: cmopEntry.timestamp.toISOString(),
        confidence: cmopEntry.confidence / 100,
        sal_analysis: cmopEntry.salAnalysis
      };

      switch (format.toLowerCase()) {
        case 'json':
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Content-Disposition', `attachment; filename="cmop-${emid}.json"`);
          res.send(JSON.stringify(exportData, null, 2));
          break;
          
        case 'yaml':
          // Simple YAML conversion (in production, use a proper YAML library)
          const yamlContent = Object.entries(exportData)
            .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
            .join('\n');
          res.setHeader('Content-Type', 'text/yaml');
          res.setHeader('Content-Disposition', `attachment; filename="cmop-${emid}.yaml"`);
          res.send(yamlContent);
          break;
          
        case 'txt':
          const txtContent = `Codex Mapping Output Packet (CMOP)
Generated: ${new Date().toISOString()}

Input Phrase: ${exportData.input_phrase}
Emotion Family: ${exportData.emotion_family}
Variant: ${exportData.variant || 'N/A'}
Reference Code: ${exportData.codex_reference}
Intensity: ${exportData.intensity}
Confidence: ${exportData.confidence}
Cultural Context: ${exportData.cultural_tag}
Symbolic Reference: ${exportData.symbolic_reference || 'N/A'}
Blendable With: ${(exportData.blendable_with || []).join(', ')}

SAL Analysis:
- Symbolic Patterns: ${(exportData.sal_analysis?.symbolicPatterns || []).join(', ')}
- Archetype: ${exportData.sal_analysis?.archetype || 'N/A'}
- Reasoning: ${exportData.sal_analysis?.reasoning || 'N/A'}

EMID: ${exportData.emid}`;

          res.setHeader('Content-Type', 'text/plain');
          res.setHeader('Content-Disposition', `attachment; filename="cmop-${emid}.txt"`);
          res.send(txtContent);
          break;
          
        default:
          res.status(400).json({ message: "Unsupported export format" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get cultural contexts
  app.get("/api/cultural-contexts", async (req, res) => {
    try {
      const contexts = culturalOverlayService.getAllCulturalContexts();
      res.json(contexts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Populate codex from YAML file
  app.post("/api/emotions/populate", async (req, res) => {
    try {
      const yamlFilePath = path.join(process.cwd(), "attached_assets", "emotion_families_1751588740129.yaml");
      const results = await codexPopulator.populateFromYamlFile(yamlFilePath);
      
      res.json({
        message: "Codex population completed",
        results: {
          emotionFamiliesAdded: results.added,
          emotionFamiliesSkipped: results.skipped,
          errors: results.errors
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Expand emotion variants (ANG-002, JOY-002, etc.)
  app.post("/api/emotions/expand-variants", async (req, res) => {
    try {
      const results = await variantExpander.expandAllEmotionVariants();
      
      res.json({
        message: "Variant expansion completed",
        results: {
          variantsAdded: results.added,
          variantsSkipped: results.skipped,
          errors: results.errors
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // CIP Rubric evaluation for emotion inclusion
  app.post("/api/emotions/cip-evaluate", async (req, res) => {
    try {
      const { emotionName, description, culturalContext, triggers } = req.body;
      
      if (!emotionName || !description) {
        return res.status(400).json({ message: "Emotion name and description are required" });
      }

      const cipScore = cipRubricService.evaluateEmotionForInclusion(
        emotionName,
        description,
        culturalContext || "Universal",
        triggers || []
      );

      const esdmDeconstruction = cipRubricService.performESDMDeconstruction(
        emotionName,
        description,
        triggers || [],
        culturalContext || "Universal"
      );

      res.json({
        cipScore,
        esdmDeconstruction,
        recommendation: cipScore.qualifiesForInclusion 
          ? "Emotion qualifies for codex inclusion"
          : "Emotion requires refinement before inclusion",
        heartAlignment: cipScore.totalScore >= 7.0
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Integrate CIP-validated emotion into active codex
  app.post("/api/emotions/integrate", async (req, res) => {
    try {
      const { emotionName, description, culturalContext, triggers, forceIntegration } = req.body;
      
      if (!emotionName || !description) {
        return res.status(400).json({ message: "Emotion name and description are required" });
      }

      const result = await codexIntegrationService.validateAndIntegrateEmotion(
        emotionName,
        description,
        culturalContext || "Universal",
        triggers || [],
        forceIntegration || false
      );

      if (result.success) {
        res.json({
          message: result.message,
          referenceCode: result.referenceCode,
          emotionEntry: result.emotionEntry,
          cipScore: result.cipScore,
          esdmAnalysis: result.esdmAnalysis
        });
      } else {
        res.status(400).json({
          message: result.message,
          cipScore: result.cipScore,
          esdmAnalysis: result.esdmAnalysis
        });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get integration suggestions for improving CIP scores
  app.post("/api/emotions/improve", async (req, res) => {
    try {
      const { emotionName, description, cipScore } = req.body;
      
      if (!emotionName || !description || !cipScore) {
        return res.status(400).json({ message: "Emotion name, description, and CIP score are required" });
      }

      const suggestions = await codexIntegrationService.suggestEmotionImprovements(
        emotionName,
        description,
        cipScore
      );

      res.json(suggestions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get integration history
  app.get("/api/emotions/integration-history", async (req, res) => {
    try {
      const history = await codexIntegrationService.getIntegrationHistory();
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get recent CMOP entries for activity feed
  app.get("/api/cmop/recent", async (req, res) => {
    try {
      const allEntries = await storage.getAllCmopEntries();
      const recent = allEntries
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10);
      res.json(recent);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Advanced tone analysis endpoint
  app.post("/api/emotions/tone-analysis", async (req, res) => {
    try {
      const { inputPhrase, emotionFamily, culturalContext, intensity } = req.body;
      
      if (!inputPhrase || !emotionFamily) {
        return res.status(400).json({ message: "Input phrase and emotion family are required" });
      }

      const toneAnalysis = toneClassifierService.analyzeTone(
        inputPhrase,
        emotionFamily,
        culturalContext || "Universal",
        intensity || 0.5
      );

      res.json(toneAnalysis);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Cultural expression analysis endpoint
  app.post("/api/emotions/cultural-analysis", async (req, res) => {
    try {
      const { inputPhrase, emotionFamily, culturalContext } = req.body;
      
      if (!inputPhrase || !emotionFamily) {
        return res.status(400).json({ message: "Input phrase and emotion family are required" });
      }

      const culturalAnalysis = culturalExpressionModifierService.analyzeCulturalExpression(
        inputPhrase,
        emotionFamily,
        culturalContext
      );

      res.json(culturalAnalysis);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get available tone codes
  app.get("/api/emotions/tone-codes", async (req, res) => {
    try {
      const toneCodes = toneClassifierService.getAllToneCodes();
      res.json(toneCodes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get cultural profiles
  app.get("/api/emotions/cultural-profiles", async (req, res) => {
    try {
      const profiles = culturalExpressionModifierService.getAllCulturalProfiles();
      res.json(profiles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
