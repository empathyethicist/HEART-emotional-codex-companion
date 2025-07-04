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

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Process emotion input
  app.post("/api/emotions/process", async (req, res) => {
    try {
      const data = emotionProcessingRequestSchema.parse(req.body);
      
      // Find emotion match using codex
      const emotionMatch = emotionCodexService.findEmotionMatch(data.inputPhrase);
      
      if (!emotionMatch) {
        return res.status(404).json({ 
          message: "No emotion match found. Consider using manual entry.",
          suggestions: emotionCodexService.searchEmotions(data.inputPhrase).slice(0, 3)
        });
      }

      // Perform SAL analysis
      const salAnalysis = salDetector.analyzeSymbolicContent(data.inputPhrase);
      
      // Apply cultural overlay
      let culturalContext = data.culturalContext;
      if (culturalContext === "Auto-detect") {
        culturalContext = culturalOverlayService.detectCulturalContext(data.inputPhrase);
      }
      
      const culturalOverlay = culturalOverlayService.applyCulturalOverlay(
        emotionMatch.emotion,
        data.inputPhrase,
        culturalContext!,
        emotionMatch.intensity
      );

      // Adjust intensity based on cultural context
      const adjustedIntensity = Math.max(0, Math.min(1, 
        emotionMatch.intensity + culturalOverlay.recommendedIntensityAdjustment
      ));

      // Detect blended emotions from SAL
      const salBlends = salDetector.detectBlendedEmotions(salAnalysis.symbolicPatterns, emotionMatch.emotion);
      const allBlends = Array.from(new Set([...emotionMatch.blendableWith, ...salBlends]));

      // Generate EMID
      const emid = generateEmid(emotionMatch.emotion);
      
      // Create CMOP entry
      const cmopEntry = await storage.createCmopEntry({
        emid,
        inputPhrase: data.inputPhrase,
        emotionFamily: emotionMatch.emotion,
        variant: emotionMatch.variant || null,
        codexReference: emotionMatch.referenceCode,
        intensity: Math.round(adjustedIntensity * 100), // Store as integer 0-100
        blendableWith: allBlends,
        symbolicReference: salAnalysis.archetype,
        culturalTag: culturalOverlay.culturalTag,
        confidence: Math.round(emotionMatch.confidence * 100), // Store as integer 0-100
        salAnalysis: salAnalysis ? {
          symbolicPatterns: salAnalysis.symbolicPatterns,
          archetype: salAnalysis.archetype,
          reasoning: salAnalysis.reasoning
        } : null
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
        timestamp: cmopEntry.timestamp.toISOString()
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
      
      if (search) {
        const results = emotionCodexService.searchEmotions(search as string);
        return res.json(results);
      }
      
      if (family) {
        const allEmotions = emotionCodexService.getAllEmotions();
        const filtered = Object.entries(allEmotions)
          .filter(([key, _]) => key === family)
          .map(([family, data]) => ({ family, data }));
        return res.json(filtered);
      }
      
      const allEmotions = emotionCodexService.getAllEmotions();
      const formatted = Object.entries(allEmotions).map(([family, data]) => ({ family, data }));
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

  const httpServer = createServer(app);
  return httpServer;
}
