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
  
  // Import comprehensive codex builder
  const { comprehensiveCodexBuilder } = await import("./services/comprehensive-codex-builder");
  
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

  // Load all individual emotion variants as separate entries
  app.post("/api/emotions/load-all-variants", async (req: Request, res: Response) => {
    try {
      const allVariants = [
        // JOY FAMILY VARIANTS
        { referenceCode: "JOY-002", emotionFamily: "JOY", variant: "Elation", definition: "Heightened joy with feelings of triumph, celebration, or euphoria", intensityMin: 70, intensityMax: 100 },
        { referenceCode: "JOY-003", emotionFamily: "JOY", variant: "Relief", definition: "Joy resulting from the cessation of anxiety, fear, or distress", intensityMin: 30, intensityMax: 80 },
        { referenceCode: "JOY-004", emotionFamily: "JOY", variant: "Delight", definition: "A light, often momentary joy evoked by pleasure or satisfaction", intensityMin: 40, intensityMax: 70 },
        { referenceCode: "JOY-005", emotionFamily: "JOY", variant: "Contentment", definition: "A sustained emotional state of calm joy and peaceful satisfaction", intensityMin: 30, intensityMax: 60 },
        { referenceCode: "JOY-006", emotionFamily: "JOY", variant: "Bliss", definition: "Pure, transcendent happiness often with spiritual overtones", intensityMin: 80, intensityMax: 100 },
        { referenceCode: "JOY-007", emotionFamily: "JOY", variant: "Euphoria", definition: "Intense elation often with reduced inhibition and heightened energy", intensityMin: 85, intensityMax: 100 },
        { referenceCode: "JOY-008", emotionFamily: "JOY", variant: "Serenity", definition: "Peaceful joy characterized by tranquility and emotional balance", intensityMin: 25, intensityMax: 55 },
        { referenceCode: "JOY-009", emotionFamily: "JOY", variant: "Glee", definition: "Exuberant joy with playful or mischievous undertones", intensityMin: 50, intensityMax: 85 },
        { referenceCode: "JOY-010", emotionFamily: "JOY", variant: "Jubilation", definition: "Triumphant joy expressed with celebration and festivity", intensityMin: 70, intensityMax: 95 },
        { referenceCode: "JOY-011", emotionFamily: "JOY", variant: "Rapture", definition: "Intense joy with overwhelming ecstatic experience", intensityMin: 80, intensityMax: 100 },
        { referenceCode: "JOY-012", emotionFamily: "JOY", variant: "Satisfaction", definition: "Joy derived from fulfillment of needs or achievement of goals", intensityMin: 35, intensityMax: 75 },
        { referenceCode: "JOY-013", emotionFamily: "JOY", variant: "Cheerfulness", definition: "Bright, optimistic joy that tends to be contagious", intensityMin: 40, intensityMax: 70 },
        { referenceCode: "JOY-014", emotionFamily: "JOY", variant: "Exhilaration", definition: "Energizing joy often accompanied by physical stimulation", intensityMin: 65, intensityMax: 90 },
        { referenceCode: "JOY-015", emotionFamily: "JOY", variant: "Merriment", definition: "Social joy expressed through laughter and celebration", intensityMin: 45, intensityMax: 80 },

        // SADNESS FAMILY VARIANTS
        { referenceCode: "SAD-002", emotionFamily: "SADNESS", variant: "Grief", definition: "Deep sorrow following significant personal loss", intensityMin: 60, intensityMax: 100 },
        { referenceCode: "SAD-003", emotionFamily: "SADNESS", variant: "Disappointment", definition: "Sadness from unmet expectations or setbacks", intensityMin: 30, intensityMax: 70 },
        { referenceCode: "SAD-004", emotionFamily: "SADNESS", variant: "Melancholy", definition: "Introspective sadness without a singular trigger", intensityMin: 40, intensityMax: 70 },
        { referenceCode: "SAD-005", emotionFamily: "SADNESS", variant: "Despair", definition: "Overwhelming sadness combined with hopelessness", intensityMin: 70, intensityMax: 100 },
        { referenceCode: "SAD-006", emotionFamily: "SADNESS", variant: "Sorrow", definition: "Deep emotional pain from loss or misfortune", intensityMin: 50, intensityMax: 90 },
        { referenceCode: "SAD-007", emotionFamily: "SADNESS", variant: "Mourning", definition: "Ritualized expression of grief over loss", intensityMin: 60, intensityMax: 95 },
        { referenceCode: "SAD-008", emotionFamily: "SADNESS", variant: "Regret", definition: "Sadness over past actions or missed opportunities", intensityMin: 40, intensityMax: 80 },
        { referenceCode: "SAD-009", emotionFamily: "SADNESS", variant: "Heartbreak", definition: "Intense emotional pain from romantic loss or betrayal", intensityMin: 70, intensityMax: 100 },
        { referenceCode: "SAD-010", emotionFamily: "SADNESS", variant: "Anguish", definition: "Severe mental or emotional distress", intensityMin: 75, intensityMax: 100 },
        { referenceCode: "SAD-011", emotionFamily: "SADNESS", variant: "Desolation", definition: "Bleak sadness with sense of abandonment", intensityMin: 65, intensityMax: 95 },
        { referenceCode: "SAD-012", emotionFamily: "SADNESS", variant: "Wistfulness", definition: "Gentle sadness tinged with longing", intensityMin: 25, intensityMax: 55 },
        { referenceCode: "SAD-013", emotionFamily: "SADNESS", variant: "Dejection", definition: "Low spirits and discouragement", intensityMin: 45, intensityMax: 75 },
        { referenceCode: "SAD-014", emotionFamily: "SADNESS", variant: "Lamentation", definition: "Expressive sadness with verbal or physical expression of grief", intensityMin: 55, intensityMax: 85 },

        // ANGER FAMILY VARIANTS
        { referenceCode: "ANG-002", emotionFamily: "ANGER", variant: "Frustration", definition: "Moderate anger from obstruction or inability to achieve goals", intensityMin: 30, intensityMax: 70 },
        { referenceCode: "ANG-003", emotionFamily: "ANGER", variant: "Rage", definition: "High-intensity anger with reduced inhibition", intensityMin: 80, intensityMax: 100 },
        { referenceCode: "ANG-004", emotionFamily: "ANGER", variant: "Resentment", definition: "Prolonged anger linked to injustice or betrayal", intensityMin: 40, intensityMax: 80 },
        { referenceCode: "ANG-005", emotionFamily: "ANGER", variant: "Irritation", definition: "Low-level anger from minor disruptions", intensityMin: 20, intensityMax: 50 },
        { referenceCode: "ANG-006", emotionFamily: "ANGER", variant: "Moral Outrage", definition: "Anger from witnessing injustice or harm", intensityMin: 60, intensityMax: 90 },
        { referenceCode: "ANG-007", emotionFamily: "ANGER", variant: "Indignation", definition: "Righteous anger at unfair treatment", intensityMin: 50, intensityMax: 80 },
        { referenceCode: "ANG-008", emotionFamily: "ANGER", variant: "Fury", definition: "Violent anger with potential for destructive action", intensityMin: 85, intensityMax: 100 },
        { referenceCode: "ANG-009", emotionFamily: "ANGER", variant: "Annoyance", definition: "Mild anger at minor inconveniences", intensityMin: 15, intensityMax: 45 },
        { referenceCode: "ANG-010", emotionFamily: "ANGER", variant: "Wrath", definition: "Divine or righteous anger with moral overtones", intensityMin: 90, intensityMax: 100 },
        { referenceCode: "ANG-011", emotionFamily: "ANGER", variant: "Hostility", definition: "Aggressive anger directed at others", intensityMin: 60, intensityMax: 90 },
        { referenceCode: "ANG-012", emotionFamily: "ANGER", variant: "Exasperation", definition: "Anger mixed with frustration at repeated issues", intensityMin: 40, intensityMax: 70 },
        { referenceCode: "ANG-013", emotionFamily: "ANGER", variant: "Contempt", definition: "Disdainful anger viewing others as inferior", intensityMin: 50, intensityMax: 80 },
        { referenceCode: "ANG-014", emotionFamily: "ANGER", variant: "Outrage", definition: "Anger at violation of moral or social standards", intensityMin: 70, intensityMax: 95 },

        // FEAR FAMILY VARIANTS
        { referenceCode: "FEA-002", emotionFamily: "FEAR", variant: "Anxiety", definition: "Persistent fear about potential future threats", intensityMin: 40, intensityMax: 80 },
        { referenceCode: "FEA-003", emotionFamily: "FEAR", variant: "Dread", definition: "Intense fear about anticipated negative events", intensityMin: 60, intensityMax: 90 },
        { referenceCode: "FEA-004", emotionFamily: "FEAR", variant: "Panic", definition: "Acute, overwhelming fear with physiological disruption", intensityMin: 80, intensityMax: 100 },
        { referenceCode: "FEA-005", emotionFamily: "FEAR", variant: "Worry", definition: "Mild to moderate fear focused on specific concerns", intensityMin: 30, intensityMax: 60 },
        { referenceCode: "FEA-006", emotionFamily: "FEAR", variant: "Terror", definition: "Extreme fear often with paralysis or flight response", intensityMin: 85, intensityMax: 100 },
        { referenceCode: "FEA-007", emotionFamily: "FEAR", variant: "Apprehension", definition: "Mild fear or uneasiness about future events", intensityMin: 25, intensityMax: 55 },
        { referenceCode: "FEA-008", emotionFamily: "FEAR", variant: "Phobia", definition: "Irrational, intense fear of specific objects or situations", intensityMin: 70, intensityMax: 95 },
        { referenceCode: "FEA-009", emotionFamily: "FEAR", variant: "Nervousness", definition: "Mild fear with restlessness and tension", intensityMin: 20, intensityMax: 50 }
      ];

      // Add common properties to all variants
      const processedVariants = allVariants.map(variant => ({
        ...variant,
        culturalUniversality: "High",
        variants: {},
        blendableWith: [`${variant.emotionFamily.substring(0,3)}-001`],
        triggers: ["trigger1", "trigger2", "trigger3"],
        intensityMarkers: {
          low: ["mild", "slight", "subtle"],
          medium: ["moderate", "noticeable", "clear"],
          high: ["intense", "strong", "overwhelming"]
        }
      }));

      let created = 0;
      for (const variant of processedVariants) {
        try {
          await storage.createEmotionEntry(variant);
          created++;
        } catch (error) {
          console.log(`Variant ${variant.referenceCode} may already exist, skipping...`);
        }
      }

      res.json({
        success: true,
        variants_created: created,
        total_variants: processedVariants.length,
        message: `Successfully loaded ${created} individual emotion variant entries`
      });
    } catch (error) {
      res.status(500).json({ 
        error: "Failed to load all variants", 
        details: error instanceof Error ? error.message : "Unknown error" 
      });
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

  // Build comprehensive emotion database with extended families
  app.post("/api/admin/build-comprehensive-codex", async (req, res) => {
    try {
      const result = await comprehensiveCodexBuilder.buildComprehensiveEmotionDatabase();
      
      res.json({
        message: "Comprehensive Emotional Codex™ database built successfully",
        result
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
