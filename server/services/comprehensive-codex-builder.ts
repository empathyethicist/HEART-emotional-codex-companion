/**
 * Comprehensive Codex Builder - Expands emotion database based on Professional Emotional Codex™
 */
import { storage } from "../storage";
import type { InsertEmotionEntry } from "@shared/schema";

export class ComprehensiveCodexBuilder {
  private static instance: ComprehensiveCodexBuilder;

  private constructor() {}

  static getInstance(): ComprehensiveCodexBuilder {
    if (!ComprehensiveCodexBuilder.instance) {
      ComprehensiveCodexBuilder.instance = new ComprehensiveCodexBuilder();
    }
    return ComprehensiveCodexBuilder.instance;
  }

  async buildComprehensiveEmotionDatabase(): Promise<{
    total_created: number;
    emotion_families: number;
    variants_created: number;
    success: boolean;
  }> {
    const comprehensiveEmotions = this.getComprehensiveEmotionData();
    let totalCreated = 0;
    let variantsCreated = 0;

    for (const emotionData of comprehensiveEmotions) {
      try {
        await storage.createEmotionEntry(emotionData);
        totalCreated++;
        
        // Count variants
        if (emotionData.variants && typeof emotionData.variants === 'object') {
          variantsCreated += Object.keys(emotionData.variants).length;
        }
      } catch (error) {
        console.log(`Emotion ${emotionData.referenceCode} may already exist, skipping...`);
      }
    }

    return {
      total_created: totalCreated,
      emotion_families: comprehensiveEmotions.length,
      variants_created: variantsCreated,
      success: true
    };
  }

  private getComprehensiveEmotionData(): InsertEmotionEntry[] {
    return [
      // JOY FAMILY - Extended
      {
        referenceCode: "JOY-001",
        emotionFamily: "JOY",
        variant: "Joy",
        definition: "A positive emotional state marked by happiness, satisfaction, fulfillment, and inner contentment",
        intensityMin: 40,
        intensityMax: 100,
        culturalUniversality: "High",
        variants: {
          "JOY-002": { name: "Elation", intensity_range: [70, 100], definition: "Heightened joy with feelings of triumph, celebration, or euphoria" },
          "JOY-003": { name: "Relief", intensity_range: [30, 80], definition: "Joy resulting from the cessation of anxiety, fear, or distress" },
          "JOY-004": { name: "Delight", intensity_range: [40, 70], definition: "A light, often momentary joy evoked by pleasure or satisfaction" },
          "JOY-005": { name: "Contentment", intensity_range: [30, 60], definition: "A sustained emotional state of calm joy and peaceful satisfaction" },
          "JOY-006": { name: "Bliss", intensity_range: [80, 100], definition: "Pure, transcendent happiness often with spiritual overtones" },
          "JOY-007": { name: "Euphoria", intensity_range: [85, 100], definition: "Intense elation often with reduced inhibition and heightened energy" },
          "JOY-008": { name: "Serenity", intensity_range: [25, 55], definition: "Peaceful joy characterized by tranquility and emotional balance" }
        },
        blendableWith: ["SUR-001", "LOV-001", "TRU-001", "GRA-001", "HOP-001"],
        triggers: ["achievement", "success", "positive_feedback", "celebration", "love", "gratitude", "relief", "beauty", "harmony", "accomplishment"],
        intensityMarkers: {
          low: ["pleased", "glad", "content", "satisfied", "peaceful"],
          medium: ["happy", "excited", "joyful", "cheerful", "delighted"],
          high: ["ecstatic", "thrilled", "euphoric", "elated", "blissful"]
        }
      },

      // SADNESS FAMILY - Extended
      {
        referenceCode: "SAD-001",
        emotionFamily: "SADNESS",
        variant: "Sadness",
        definition: "A negative emotional state characterized by sorrow, loss, disappointment, and feelings of helplessness",
        intensityMin: 30,
        intensityMax: 100,
        culturalUniversality: "High",
        variants: {
          "SAD-002": { name: "Grief", intensity_range: [60, 100], definition: "Deep sorrow following significant personal loss" },
          "SAD-003": { name: "Disappointment", intensity_range: [30, 70], definition: "Sadness from unmet expectations or setbacks" },
          "SAD-004": { name: "Melancholy", intensity_range: [40, 70], definition: "Introspective sadness without a singular trigger" },
          "SAD-005": { name: "Despair", intensity_range: [70, 100], definition: "Overwhelming sadness combined with hopelessness" },
          "SAD-006": { name: "Sorrow", intensity_range: [50, 90], definition: "Deep emotional pain from loss or misfortune" },
          "SAD-007": { name: "Mourning", intensity_range: [60, 95], definition: "Ritualized expression of grief over loss" },
          "SAD-008": { name: "Regret", intensity_range: [40, 80], definition: "Sadness over past actions or missed opportunities" },
          "SAD-009": { name: "Heartbreak", intensity_range: [70, 100], definition: "Intense emotional pain from romantic loss or betrayal" }
        },
        blendableWith: ["LOV-001", "GUI-001", "SHA-001", "FEA-001", "ANG-001", "LON-001"],
        triggers: ["loss", "death", "breakup", "failure", "rejection", "disappointment", "betrayal", "isolation", "unmet_expectations", "memories"],
        intensityMarkers: {
          low: ["blue", "down", "disappointed", "wistful", "subdued"],
          medium: ["sad", "sorrowful", "dejected", "mournful", "melancholy"],
          high: ["devastated", "heartbroken", "despairing", "inconsolable", "anguished"]
        }
      },

      // ANGER FAMILY - Extended
      {
        referenceCode: "ANG-001",
        emotionFamily: "ANGER",
        variant: "Anger",
        definition: "A negative emotional state triggered by perceived threat, injustice, or boundary violations",
        intensityMin: 30,
        intensityMax: 100,
        culturalUniversality: "High",
        variants: {
          "ANG-002": { name: "Frustration", intensity_range: [30, 70], definition: "Moderate anger from obstruction or inability to achieve goals" },
          "ANG-003": { name: "Rage", intensity_range: [80, 100], definition: "High-intensity anger with reduced inhibition" },
          "ANG-004": { name: "Resentment", intensity_range: [40, 80], definition: "Prolonged anger linked to injustice or betrayal" },
          "ANG-005": { name: "Irritation", intensity_range: [20, 50], definition: "Low-level anger from minor disruptions" },
          "ANG-006": { name: "Moral Outrage", intensity_range: [60, 90], definition: "Anger from witnessing injustice or harm" },
          "ANG-007": { name: "Indignation", intensity_range: [50, 80], definition: "Righteous anger at unfair treatment" },
          "ANG-008": { name: "Fury", intensity_range: [85, 100], definition: "Violent anger with potential for destructive action" },
          "ANG-009": { name: "Annoyance", intensity_range: [15, 45], definition: "Mild anger at minor inconveniences" }
        },
        blendableWith: ["FEA-001", "DIS-001", "GUI-001", "SAD-001", "SHA-001"],
        triggers: ["injustice", "betrayal", "obstruction", "disrespect", "violation", "incompetence", "unfairness", "threat", "criticism", "control"],
        intensityMarkers: {
          low: ["annoyed", "irritated", "bothered", "peeved", "miffed"],
          medium: ["angry", "mad", "frustrated", "indignant", "resentful"],
          high: ["furious", "enraged", "livid", "seething", "incensed"]
        }
      },

      // FEAR FAMILY - Extended
      {
        referenceCode: "FEA-001",
        emotionFamily: "FEAR",
        variant: "Fear",
        definition: "A negative emotional state characterized by anxiety, worry, and apprehension in response to perceived threats",
        intensityMin: 30,
        intensityMax: 100,
        culturalUniversality: "High",
        variants: {
          "FEA-002": { name: "Anxiety", intensity_range: [40, 80], definition: "Persistent fear about potential future threats" },
          "FEA-003": { name: "Dread", intensity_range: [60, 90], definition: "Intense fear about anticipated negative events" },
          "FEA-004": { name: "Panic", intensity_range: [80, 100], definition: "Acute, overwhelming fear with physiological disruption" },
          "FEA-005": { name: "Worry", intensity_range: [30, 60], definition: "Mild to moderate fear focused on specific concerns" },
          "FEA-006": { name: "Terror", intensity_range: [85, 100], definition: "Extreme fear often with paralysis or flight response" },
          "FEA-007": { name: "Apprehension", intensity_range: [25, 55], definition: "Mild fear or uneasiness about future events" },
          "FEA-008": { name: "Phobia", intensity_range: [70, 95], definition: "Irrational, intense fear of specific objects or situations" },
          "FEA-009": { name: "Nervousness", intensity_range: [20, 50], definition: "Mild fear with restlessness and tension" }
        },
        blendableWith: ["SAD-001", "ANG-001", "SHA-001", "GUI-001", "SUR-001"],
        triggers: ["danger", "uncertainty", "threat", "unknown", "loss_of_control", "failure", "rejection", "death", "pain", "change"],
        intensityMarkers: {
          low: ["nervous", "uneasy", "worried", "concerned", "apprehensive"],
          medium: ["afraid", "fearful", "anxious", "scared", "troubled"],
          high: ["terrified", "panicked", "petrified", "horrified", "paralyzed"]
        }
      },

      // LOVE FAMILY - Extended
      {
        referenceCode: "LOV-001",
        emotionFamily: "LOVE",
        variant: "Love",
        definition: "A deeply positive emotional state marked by attachment, connection, care, and desire for another's well-being",
        intensityMin: 40,
        intensityMax: 100,
        culturalUniversality: "Very High",
        variants: {
          "LOV-002": { name: "Affection", intensity_range: [40, 70], definition: "Gentle expression of care, warmth, or fondness" },
          "LOV-003": { name: "Passion", intensity_range: [70, 100], definition: "Intense emotional and often physical desire" },
          "LOV-004": { name: "Devotion", intensity_range: [60, 95], definition: "Deep commitment and loyalty to another" },
          "LOV-005": { name: "Adoration", intensity_range: [70, 100], definition: "Intense love with reverence and admiration" },
          "LOV-006": { name: "Tenderness", intensity_range: [50, 80], definition: "Gentle, caring love with protective feelings" },
          "LOV-007": { name: "Infatuation", intensity_range: [60, 90], definition: "Intense but often short-lived romantic attraction" },
          "LOV-008": { name: "Compassion", intensity_range: [45, 75], definition: "Love expressed through empathy and desire to help" },
          "LOV-009": { name: "Attachment", intensity_range: [50, 85], definition: "Deep emotional bond and connection" }
        },
        blendableWith: ["JOY-001", "TRU-001", "GRA-001", "FEA-001", "SAD-001"],
        triggers: ["connection", "care", "beauty", "protection", "sharing", "intimacy", "understanding", "support", "commitment", "empathy"],
        intensityMarkers: {
          low: ["fond", "caring", "warm", "affectionate", "tender"],
          medium: ["loving", "devoted", "passionate", "adoring", "cherishing"],
          high: ["obsessed", "consumed", "worshipping", "idolizing", "enchanted"]
        }
      },

      // SURPRISE FAMILY - New
      {
        referenceCode: "SUR-001",
        emotionFamily: "SURPRISE",
        variant: "Surprise",
        definition: "A brief emotional state triggered by unexpected or novel events, serving as an attention reset mechanism",
        intensityMin: 20,
        intensityMax: 90,
        culturalUniversality: "High",
        variants: {
          "SUR-002": { name: "Amazement", intensity_range: [60, 90], definition: "Wonder and astonishment at something remarkable" },
          "SUR-003": { name: "Shock", intensity_range: [70, 95], definition: "Sudden, intense surprise often with distress" },
          "SUR-004": { name: "Wonder", intensity_range: [40, 80], definition: "Curious surprise mixed with admiration" },
          "SUR-005": { name: "Bewilderment", intensity_range: [50, 85], definition: "Confusion combined with surprise" },
          "SUR-006": { name: "Astonishment", intensity_range: [65, 90], definition: "Great surprise or amazement" },
          "SUR-007": { name: "Startled", intensity_range: [30, 70], definition: "Brief surprise from sudden stimulus" }
        },
        blendableWith: ["JOY-001", "FEA-001", "CON-001", "CUR-001"],
        triggers: ["unexpected_event", "novelty", "sudden_change", "revelation", "discovery", "interruption", "achievement", "twist"],
        intensityMarkers: {
          low: ["surprised", "caught off guard", "taken aback", "unexpected"],
          medium: ["amazed", "astonished", "startled", "shocked", "bewildered"],
          high: ["flabbergasted", "stunned", "thunderstruck", "dumbfounded"]
        }
      },

      // DISGUST FAMILY - New
      {
        referenceCode: "DIS-001",
        emotionFamily: "DISGUST",
        variant: "Disgust",
        definition: "A negative emotional response to offensive, repulsive, or contaminating stimuli, serving protective functions",
        intensityMin: 25,
        intensityMax: 95,
        culturalUniversality: "High",
        variants: {
          "DIS-002": { name: "Revulsion", intensity_range: [70, 95], definition: "Intense disgust with strong physical reaction" },
          "DIS-003": { name: "Contempt", intensity_range: [50, 85], definition: "Disgust mixed with superiority and disdain" },
          "DIS-004": { name: "Repugnance", intensity_range: [60, 90], definition: "Strong aversion and distaste" },
          "DIS-005": { name: "Aversion", intensity_range: [40, 75], definition: "Strong dislike and avoidance tendency" },
          "DIS-006": { name: "Loathing", intensity_range: [65, 95], definition: "Intense hatred and disgust" },
          "DIS-007": { name: "Nausea", intensity_range: [55, 85], definition: "Physical disgust with queasiness" }
        },
        blendableWith: ["ANG-001", "FEA-001", "SHA-001"],
        triggers: ["contamination", "moral_violation", "bad_smell", "decay", "injustice", "betrayal", "cruelty", "hypocrisy"],
        intensityMarkers: {
          low: ["distasteful", "unpleasant", "off-putting", "disagreeable"],
          medium: ["disgusted", "repulsed", "revolted", "sickened", "appalled"],
          high: ["nauseated", "revolted", "abhorred", "loathing", "repugnant"]
        }
      },

      // TRUST FAMILY - New
      {
        referenceCode: "TRU-001",
        emotionFamily: "TRUST",
        variant: "Trust",
        definition: "A positive emotional state characterized by confidence, faith, and willingness to be vulnerable with another",
        intensityMin: 35,
        intensityMax: 95,
        culturalUniversality: "High",
        variants: {
          "TRU-002": { name: "Confidence", intensity_range: [50, 85], definition: "Strong belief in reliability and competence" },
          "TRU-003": { name: "Faith", intensity_range: [60, 95], definition: "Deep trust often with spiritual or transcendent elements" },
          "TRU-004": { name: "Security", intensity_range: [45, 80], definition: "Feeling safe and protected" },
          "TRU-005": { name: "Reliance", intensity_range: [40, 75], definition: "Dependence with confidence in support" },
          "TRU-006": { name: "Loyalty", intensity_range: [55, 90], definition: "Faithful allegiance and commitment" }
        },
        blendableWith: ["LOV-001", "JOY-001", "SEC-001", "COM-001"],
        triggers: ["reliability", "consistency", "honesty", "support", "protection", "competence", "vulnerability_safety", "loyalty"],
        intensityMarkers: {
          low: ["comfortable", "confident", "secure", "assured"],
          medium: ["trusting", "faithful", "loyal", "dependent", "reliant"],
          high: ["devoted", "unwavering", "absolute_faith", "blind_trust"]
        }
      },

      // GUILT FAMILY - New
      {
        referenceCode: "GUI-001",
        emotionFamily: "GUILT",
        variant: "Guilt",
        definition: "A negative emotional state arising from awareness of wrongdoing or harm caused to others",
        intensityMin: 30,
        intensityMax: 95,
        culturalUniversality: "High",
        variants: {
          "GUI-002": { name: "Remorse", intensity_range: [60, 95], definition: "Deep regret and sorrow for past actions" },
          "GUI-003": { name: "Regret", intensity_range: [40, 80], definition: "Sadness about decisions or missed opportunities" },
          "GUI-004": { name: "Self-blame", intensity_range: [50, 90], definition: "Taking responsibility for negative outcomes" },
          "GUI-005": { name: "Contrition", intensity_range: [55, 85], definition: "Sincere remorse with desire for forgiveness" }
        },
        blendableWith: ["SAD-001", "SHA-001", "ANG-001", "FEA-001"],
        triggers: ["wrongdoing", "harm_to_others", "moral_violation", "responsibility", "failure", "betrayal", "negligence"],
        intensityMarkers: {
          low: ["sorry", "regretful", "apologetic", "concerned"],
          medium: ["guilty", "remorseful", "ashamed", "contrite"],
          high: ["tormented", "consumed", "devastated", "self-loathing"]
        }
      },

      // SHAME FAMILY - New
      {
        referenceCode: "SHA-001",
        emotionFamily: "SHAME",
        variant: "Shame",
        definition: "A painful emotion arising from awareness of inadequacy, unworthiness, or social disapproval",
        intensityMin: 35,
        intensityMax: 100,
        culturalUniversality: "High",
        variants: {
          "SHA-002": { name: "Embarrassment", intensity_range: [35, 70], definition: "Mild shame from social awkwardness or exposure" },
          "SHA-003": { name: "Humiliation", intensity_range: [70, 100], definition: "Intense shame from public degradation" },
          "SHA-004": { name: "Mortification", intensity_range: [80, 100], definition: "Extreme shame with desire to disappear" },
          "SHA-005": { name: "Self-consciousness", intensity_range: [25, 60], definition: "Awareness of being observed and judged" }
        },
        blendableWith: ["GUI-001", "SAD-001", "ANG-001", "FEA-001"],
        triggers: ["inadequacy", "exposure", "judgment", "failure", "rejection", "social_violation", "vulnerability"],
        intensityMarkers: {
          low: ["embarrassed", "self-conscious", "awkward", "uncomfortable"],
          medium: ["ashamed", "humiliated", "mortified", "degraded"],
          high: ["worthless", "devastated", "crushed", "destroyed"]
        }
      },

      // HOPE FAMILY - New
      {
        referenceCode: "HOP-001",
        emotionFamily: "HOPE",
        variant: "Hope",
        definition: "A positive emotional state characterized by expectation and desire for positive future outcomes",
        intensityMin: 30,
        intensityMax: 90,
        culturalUniversality: "High",
        variants: {
          "HOP-002": { name: "Optimism", intensity_range: [45, 80], definition: "General tendency to expect positive outcomes" },
          "HOP-003": { name: "Anticipation", intensity_range: [40, 85], definition: "Excited expectation of future events" },
          "HOP-004": { name: "Faith", intensity_range: [50, 90], definition: "Confident hope often with spiritual elements" },
          "HOP-005": { name: "Aspiration", intensity_range: [55, 85], definition: "Hope directed toward specific goals or ideals" }
        },
        blendableWith: ["JOY-001", "TRU-001", "LOV-001", "EXC-001"],
        triggers: ["possibility", "progress", "support", "vision", "opportunity", "recovery", "change", "potential"],
        intensityMarkers: {
          low: ["hopeful", "optimistic", "expectant", "positive"],
          medium: ["confident", "anticipating", "aspiring", "faithful"],
          high: ["certain", "unwavering", "visionary", "inspired"]
        }
      }
    ];
  }
}

export const comprehensiveCodexBuilder = ComprehensiveCodexBuilder.getInstance();