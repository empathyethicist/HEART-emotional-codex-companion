import { 
  emotionEntries, 
  cmopEntries, 
  processingSessions,
  type EmotionEntry, 
  type InsertEmotionEntry,
  type CmopEntry,
  type InsertCmopEntry,
  type ProcessingSession,
  type InsertProcessingSession
} from "@shared/schema";

export interface IStorage {
  // Emotion Entries
  getEmotionEntry(referenceCode: string): Promise<EmotionEntry | undefined>;
  getAllEmotionEntries(): Promise<EmotionEntry[]>;
  searchEmotionEntries(query: string): Promise<EmotionEntry[]>;
  createEmotionEntry(entry: InsertEmotionEntry): Promise<EmotionEntry>;
  
  // CMOP Entries
  getCmopEntry(emid: string): Promise<CmopEntry | undefined>;
  getAllCmopEntries(): Promise<CmopEntry[]>;
  createCmopEntry(entry: InsertCmopEntry): Promise<CmopEntry>;
  
  // Processing Sessions
  getProcessingSession(sessionId: string): Promise<ProcessingSession | undefined>;
  createProcessingSession(session: InsertProcessingSession): Promise<ProcessingSession>;
  updateProcessingSession(sessionId: string, updates: Partial<ProcessingSession>): Promise<ProcessingSession>;
}

export class MemStorage implements IStorage {
  private emotionEntries: Map<string, EmotionEntry> = new Map();
  private cmopEntries: Map<string, CmopEntry> = new Map();
  private processingSessions: Map<string, ProcessingSession> = new Map();
  private currentId: number = 1;

  constructor() {
    this.initializeDefaultEmotions();
    // Auto-load all variants on startup
    this.loadAllVariants();
  }

  private async loadAllVariants() {
    const allVariants = [
      // JOY variants
      { referenceCode: "JOY-002", emotionFamily: "JOY", variant: "Elation", definition: "Heightened joy with feelings of triumph, celebration, or euphoria", intensityMin: 70, intensityMax: 100, triggers: ["victory", "triumph", "celebration", "breakthrough", "recognition"] },
      { referenceCode: "JOY-003", emotionFamily: "JOY", variant: "Relief", definition: "Joy resulting from the cessation of anxiety, fear, or distress", intensityMin: 30, intensityMax: 80, triggers: ["resolution", "safety", "escape", "recovery", "end_of_worry"] },
      { referenceCode: "JOY-004", emotionFamily: "JOY", variant: "Delight", definition: "A light, often momentary joy evoked by pleasure or satisfaction", intensityMin: 40, intensityMax: 70, triggers: ["surprise", "beauty", "novelty", "charm", "discovery"] },
      { referenceCode: "JOY-005", emotionFamily: "JOY", variant: "Contentment", definition: "A sustained emotional state of calm joy and peaceful satisfaction", intensityMin: 30, intensityMax: 60, triggers: ["fulfillment", "peace", "stability", "comfort", "acceptance"] },
      { referenceCode: "JOY-006", emotionFamily: "JOY", variant: "Bliss", definition: "Pure, transcendent happiness often with spiritual overtones", intensityMin: 80, intensityMax: 100, triggers: ["transcendence", "unity", "enlightenment", "divine_connection", "perfect_moment"] },
      { referenceCode: "JOY-007", emotionFamily: "JOY", variant: "Euphoria", definition: "Intense elation often with reduced inhibition and heightened energy", intensityMin: 85, intensityMax: 100, triggers: ["extreme_success", "peak_experience", "overwhelming_joy", "life_changing_event", "ecstatic_moment"] },
      { referenceCode: "JOY-008", emotionFamily: "JOY", variant: "Serenity", definition: "Peaceful joy characterized by tranquility and emotional balance", intensityMin: 25, intensityMax: 55, triggers: ["meditation", "nature", "calm_reflection", "inner_peace", "mindfulness"] },
      { referenceCode: "JOY-009", emotionFamily: "JOY", variant: "Glee", definition: "Exuberant joy with playful or mischievous undertones", intensityMin: 50, intensityMax: 85, triggers: ["playfulness", "pranks", "games", "fun_activities", "childlike_wonder"] },
      { referenceCode: "JOY-010", emotionFamily: "JOY", variant: "Jubilation", definition: "Triumphant joy expressed with celebration and festivity", intensityMin: 70, intensityMax: 95, triggers: ["team_victory", "celebration", "achievement", "success_announcement", "milestone"] },
      { referenceCode: "JOY-011", emotionFamily: "JOY", variant: "Rapture", definition: "Intense joy with overwhelming ecstatic experience", intensityMin: 80, intensityMax: 100, triggers: ["spiritual_experience", "divine_encounter", "overwhelming_beauty", "transcendent_love", "mystical_union"] },
      { referenceCode: "JOY-012", emotionFamily: "JOY", variant: "Satisfaction", definition: "Joy derived from fulfillment of needs or achievement of goals", intensityMin: 35, intensityMax: 75, triggers: ["goal_completion", "problem_solved", "needs_met", "work_accomplished", "duty_fulfilled"] },
      { referenceCode: "JOY-013", emotionFamily: "JOY", variant: "Cheerfulness", definition: "Bright, optimistic joy that tends to be contagious", intensityMin: 40, intensityMax: 70, triggers: ["positive_interactions", "sunny_weather", "good_news", "friendly_company", "uplifting_music"] },
      { referenceCode: "JOY-014", emotionFamily: "JOY", variant: "Exhilaration", definition: "Energizing joy often accompanied by physical stimulation", intensityMin: 65, intensityMax: 90, triggers: ["adventure", "thrill_seeking", "physical_challenge", "adrenaline_rush", "exciting_activity"] },
      { referenceCode: "JOY-015", emotionFamily: "JOY", variant: "Merriment", definition: "Social joy expressed through laughter and celebration", intensityMin: 45, intensityMax: 80, triggers: ["social_gathering", "humor", "festivities", "shared_laughter", "party_atmosphere"] },
      
      // SADNESS variants
      { referenceCode: "SAD-002", emotionFamily: "SADNESS", variant: "Grief", definition: "Deep sorrow following significant personal loss", intensityMin: 60, intensityMax: 100, triggers: ["death_of_loved_one", "major_loss", "separation", "end_of_relationship", "profound_loss"] },
      { referenceCode: "SAD-003", emotionFamily: "SADNESS", variant: "Disappointment", definition: "Sadness from unmet expectations or setbacks", intensityMin: 30, intensityMax: 70, triggers: ["failed_expectations", "setback", "rejection", "unmet_goals", "let_down"] },
      { referenceCode: "SAD-004", emotionFamily: "SADNESS", variant: "Melancholy", definition: "Introspective sadness without a singular trigger", intensityMin: 40, intensityMax: 70, triggers: ["solitude", "nostalgia", "autumn_mood", "contemplation", "bittersweet_memories"] },
      { referenceCode: "SAD-005", emotionFamily: "SADNESS", variant: "Despair", definition: "Overwhelming sadness combined with hopelessness", intensityMin: 70, intensityMax: 100, triggers: ["hopelessness", "trapped_situation", "overwhelming_problems", "existential_crisis", "helplessness"] },
      { referenceCode: "SAD-006", emotionFamily: "SADNESS", variant: "Sorrow", definition: "Deep emotional pain from loss or misfortune", intensityMin: 50, intensityMax: 90, triggers: ["tragedy", "misfortune", "suffering", "injustice", "empathetic_pain"] },
      { referenceCode: "SAD-007", emotionFamily: "SADNESS", variant: "Mourning", definition: "Ritualized expression of grief over loss", intensityMin: 60, intensityMax: 95, triggers: ["funeral", "memorial", "anniversary_of_loss", "burial", "remembrance"] },
      { referenceCode: "SAD-008", emotionFamily: "SADNESS", variant: "Regret", definition: "Sadness over past actions or missed opportunities", intensityMin: 40, intensityMax: 80, triggers: ["missed_opportunity", "wrong_decision", "past_mistakes", "what_if_thoughts", "hindsight"] },
      { referenceCode: "SAD-009", emotionFamily: "SADNESS", variant: "Heartbreak", definition: "Intense emotional pain from romantic loss or betrayal", intensityMin: 70, intensityMax: 100, triggers: ["breakup", "betrayal", "unrequited_love", "infidelity", "romantic_rejection"] },
      { referenceCode: "SAD-010", emotionFamily: "SADNESS", variant: "Anguish", definition: "Severe mental or emotional distress", intensityMin: 75, intensityMax: 100, triggers: ["intense_suffering", "torment", "agony", "overwhelming_distress", "mental_pain"] },
      { referenceCode: "SAD-011", emotionFamily: "SADNESS", variant: "Desolation", definition: "Bleak sadness with sense of abandonment", intensityMin: 65, intensityMax: 95, triggers: ["abandonment", "isolation", "emptiness", "loneliness", "desolate_environment"] },
      { referenceCode: "SAD-012", emotionFamily: "SADNESS", variant: "Wistfulness", definition: "Gentle sadness tinged with longing", intensityMin: 25, intensityMax: 55, triggers: ["memories", "longing", "nostalgia", "distant_past", "bittersweet_recollection"] },
      { referenceCode: "SAD-013", emotionFamily: "SADNESS", variant: "Dejection", definition: "Low spirits and discouragement", intensityMin: 45, intensityMax: 75, triggers: ["failure", "discouragement", "low_mood", "setbacks", "feeling_defeated"] },
      { referenceCode: "SAD-014", emotionFamily: "SADNESS", variant: "Lamentation", definition: "Expressive sadness with verbal or physical expression of grief", intensityMin: 55, intensityMax: 85, triggers: ["crying", "wailing", "vocal_grief", "public_mourning", "expressive_sorrow"] },
      
      // ANGER variants  
      { referenceCode: "ANG-002", emotionFamily: "ANGER", variant: "Frustration", definition: "Moderate anger from obstruction or inability to achieve goals", intensityMin: 30, intensityMax: 70, triggers: ["obstacles", "blocked_goals", "repeated_failure", "inefficiency", "uncooperative_people"] },
      { referenceCode: "ANG-003", emotionFamily: "ANGER", variant: "Rage", definition: "High-intensity anger with reduced inhibition", intensityMin: 80, intensityMax: 100, triggers: ["extreme_provocation", "threat_to_safety", "violation_of_boundaries", "intense_betrayal", "overwhelming_injustice"] },
      { referenceCode: "ANG-004", emotionFamily: "ANGER", variant: "Resentment", definition: "Prolonged anger linked to injustice or betrayal", intensityMin: 40, intensityMax: 80, triggers: ["past_injustice", "betrayal", "unfair_treatment", "grudges", "perceived_wrongs"] },
      { referenceCode: "ANG-005", emotionFamily: "ANGER", variant: "Irritation", definition: "Low-level anger from minor disruptions", intensityMin: 20, intensityMax: 50, triggers: ["minor_inconveniences", "noise", "interruptions", "petty_annoyances", "daily_hassles"] },
      { referenceCode: "ANG-006", emotionFamily: "ANGER", variant: "Moral Outrage", definition: "Anger from witnessing injustice or harm", intensityMin: 60, intensityMax: 90, triggers: ["injustice", "cruelty", "oppression", "harm_to_innocent", "violation_of_rights"] },
      { referenceCode: "ANG-007", emotionFamily: "ANGER", variant: "Indignation", definition: "Righteous anger at unfair treatment", intensityMin: 50, intensityMax: 80, triggers: ["unfair_treatment", "discrimination", "being_wronged", "unjust_accusations", "double_standards"] },
      { referenceCode: "ANG-008", emotionFamily: "ANGER", variant: "Fury", definition: "Violent anger with potential for destructive action", intensityMin: 85, intensityMax: 100, triggers: ["extreme_violation", "threat_to_loved_ones", "deliberate_harm", "unforgivable_acts", "complete_betrayal"] },
      { referenceCode: "ANG-009", emotionFamily: "ANGER", variant: "Annoyance", definition: "Mild anger at minor inconveniences", intensityMin: 15, intensityMax: 45, triggers: ["small_disruptions", "mild_rudeness", "trivial_delays", "minor_mistakes", "pet_peeves"] },
      { referenceCode: "ANG-010", emotionFamily: "ANGER", variant: "Wrath", definition: "Divine or righteous anger with moral overtones", intensityMin: 90, intensityMax: 100, triggers: ["moral_violation", "sacrilege", "ultimate_betrayal", "grave_injustice", "unforgivable_sin"] },
      { referenceCode: "ANG-011", emotionFamily: "ANGER", variant: "Hostility", definition: "Aggressive anger directed at others", intensityMin: 60, intensityMax: 90, triggers: ["conflict", "opposition", "threat", "competition", "territorial_dispute"] },
      { referenceCode: "ANG-012", emotionFamily: "ANGER", variant: "Exasperation", definition: "Anger mixed with frustration at repeated issues", intensityMin: 40, intensityMax: 70, triggers: ["repeated_problems", "persistent_issues", "ongoing_difficulties", "chronic_annoyances", "recurring_failures"] },
      { referenceCode: "ANG-013", emotionFamily: "ANGER", variant: "Contempt", definition: "Disdainful anger viewing others as inferior", intensityMin: 50, intensityMax: 80, triggers: ["perceived_inferiority", "moral_superiority", "disdain", "scorn", "looking_down_on_others"] },
      { referenceCode: "ANG-014", emotionFamily: "ANGER", variant: "Outrage", definition: "Anger at violation of moral or social standards", intensityMin: 70, intensityMax: 95, triggers: ["scandal", "violation_of_norms", "shocking_behavior", "breach_of_trust", "moral_transgression"] },
      
      // FEAR variants
      { referenceCode: "FEA-002", emotionFamily: "FEAR", variant: "Anxiety", definition: "Persistent fear about potential future threats", intensityMin: 40, intensityMax: 80, triggers: ["uncertainty", "future_events", "social_situations", "performance", "health_concerns"] },
      { referenceCode: "FEA-003", emotionFamily: "FEAR", variant: "Dread", definition: "Intense fear about anticipated negative events", intensityMin: 60, intensityMax: 90, triggers: ["impending_doom", "anticipated_loss", "upcoming_confrontation", "expected_bad_news", "looming_deadline"] },
      { referenceCode: "FEA-004", emotionFamily: "FEAR", variant: "Panic", definition: "Acute, overwhelming fear with physiological disruption", intensityMin: 80, intensityMax: 100, triggers: ["immediate_danger", "trapped_situation", "overwhelming_threat", "loss_of_control", "life_threatening_event"] },
      { referenceCode: "FEA-005", emotionFamily: "FEAR", variant: "Worry", definition: "Mild to moderate fear focused on specific concerns", intensityMin: 30, intensityMax: 60, triggers: ["specific_concerns", "what_if_scenarios", "loved_ones_safety", "financial_issues", "minor_problems"] },
      { referenceCode: "FEA-006", emotionFamily: "FEAR", variant: "Terror", definition: "Extreme fear often with paralysis or flight response", intensityMin: 85, intensityMax: 100, triggers: ["extreme_threat", "mortal_danger", "horrific_situation", "overwhelming_horror", "paralyzing_fear"] },
      { referenceCode: "FEA-007", emotionFamily: "FEAR", variant: "Apprehension", definition: "Mild fear or uneasiness about future events", intensityMin: 25, intensityMax: 55, triggers: ["new_situations", "unknown_outcomes", "mild_uncertainty", "first_time_experiences", "cautious_anticipation"] },
      { referenceCode: "FEA-008", emotionFamily: "FEAR", variant: "Phobia", definition: "Irrational, intense fear of specific objects or situations", intensityMin: 70, intensityMax: 95, triggers: ["specific_objects", "particular_situations", "irrational_triggers", "phobic_stimuli", "conditioned_fear"] },
      { referenceCode: "FEA-009", emotionFamily: "FEAR", variant: "Nervousness", definition: "Mild fear with restlessness and tension", intensityMin: 20, intensityMax: 50, triggers: ["social_situations", "performance_pressure", "new_experiences", "being_watched", "anticipation"] },
      
      // GRIEF variants (expanding from single entry to comprehensive variants)
      { referenceCode: "GRI-002", emotionFamily: "GRIEF", variant: "Acute Grief", definition: "Intense, overwhelming grief in the immediate aftermath of loss", intensityMin: 80, intensityMax: 100, triggers: ["sudden_death", "unexpected_loss", "tragic_accident", "immediate_aftermath", "shock_of_loss"] },
      { referenceCode: "GRI-003", emotionFamily: "GRIEF", variant: "Anticipatory Grief", definition: "Grief experienced before an expected loss occurs", intensityMin: 60, intensityMax: 90, triggers: ["terminal_diagnosis", "impending_death", "expected_separation", "gradual_decline", "inevitable_loss"] },
      { referenceCode: "GRI-004", emotionFamily: "GRIEF", variant: "Complicated Grief", definition: "Prolonged, intense grief that doesn't naturally resolve over time", intensityMin: 70, intensityMax: 95, triggers: ["unresolved_trauma", "sudden_loss", "lack_of_closure", "complicated_relationship", "multiple_losses"] },
      { referenceCode: "GRI-005", emotionFamily: "GRIEF", variant: "Disenfranchised Grief", definition: "Grief that is not socially recognized or supported", intensityMin: 50, intensityMax: 85, triggers: ["stigmatized_loss", "ex_partner_death", "pet_loss", "miscarriage", "hidden_relationship"] },
      { referenceCode: "GRI-006", emotionFamily: "GRIEF", variant: "Collective Grief", definition: "Shared grief experienced by a community or group", intensityMin: 60, intensityMax: 90, triggers: ["community_tragedy", "mass_casualty", "cultural_loss", "shared_trauma", "public_mourning"] },
      { referenceCode: "GRI-007", emotionFamily: "GRIEF", variant: "Ambiguous Grief", definition: "Grief when loss is unclear or incomplete", intensityMin: 55, intensityMax: 80, triggers: ["missing_person", "dementia", "estrangement", "uncertain_fate", "living_loss"] },
      { referenceCode: "GRI-008", emotionFamily: "GRIEF", variant: "Anniversary Grief", definition: "Recurring grief that intensifies on significant dates", intensityMin: 45, intensityMax: 75, triggers: ["anniversary_date", "birthday", "holiday", "milestone_date", "seasonal_reminder"] },
      { referenceCode: "GRI-009", emotionFamily: "GRIEF", variant: "Absent Grief", definition: "Delayed or suppressed grief response", intensityMin: 30, intensityMax: 60, triggers: ["shock", "numbness", "denial", "suppression", "delayed_processing"] },
      { referenceCode: "GRI-010", emotionFamily: "GRIEF", variant: "Inhibited Grief", definition: "Grief that is consciously or unconsciously held back", intensityMin: 40, intensityMax: 70, triggers: ["social_pressure", "family_expectations", "professional_demands", "cultural_norms", "fear_of_emotion"] },
      
      // LOVE variants (expanding from single entry to comprehensive variants)
      { referenceCode: "LOV-002", emotionFamily: "LOVE", variant: "Romantic Love", definition: "Passionate emotional attachment and attraction to another person", intensityMin: 60, intensityMax: 100, triggers: ["attraction", "intimacy", "connection", "passion", "romantic_bond"] },
      { referenceCode: "LOV-003", emotionFamily: "LOVE", variant: "Unconditional Love", definition: "Love without conditions, requirements, or expectations", intensityMin: 70, intensityMax: 95, triggers: ["parental_bond", "spiritual_connection", "deep_acceptance", "pure_compassion", "selfless_care"] },
      { referenceCode: "LOV-004", emotionFamily: "LOVE", variant: "Platonic Love", definition: "Deep affection and care without romantic or sexual elements", intensityMin: 50, intensityMax: 80, triggers: ["friendship", "intellectual_connection", "shared_values", "mutual_respect", "companionship"] },
      { referenceCode: "LOV-005", emotionFamily: "LOVE", variant: "Self-Love", definition: "Positive regard, acceptance, and care for oneself", intensityMin: 40, intensityMax: 85, triggers: ["self_acceptance", "personal_growth", "self_compassion", "inner_peace", "self_worth"] },
      { referenceCode: "LOV-006", emotionFamily: "LOVE", variant: "Familial Love", definition: "Deep affection and loyalty within family relationships", intensityMin: 55, intensityMax: 90, triggers: ["family_bonds", "shared_history", "blood_relation", "chosen_family", "protective_instinct"] },
      { referenceCode: "LOV-007", emotionFamily: "LOVE", variant: "Compassionate Love", definition: "Love characterized by empathy, care, and concern for others' wellbeing", intensityMin: 50, intensityMax: 85, triggers: ["empathy", "suffering_witness", "helping_others", "service", "kindness"] },
      { referenceCode: "LOV-008", emotionFamily: "LOVE", variant: "Passionate Love", definition: "Intense, often overwhelming romantic and physical attraction", intensityMin: 75, intensityMax: 100, triggers: ["intense_attraction", "desire", "infatuation", "overwhelming_emotion", "physical_chemistry"] },
      { referenceCode: "LOV-009", emotionFamily: "LOVE", variant: "Mature Love", definition: "Stable, enduring love built on deep understanding and commitment", intensityMin: 60, intensityMax: 85, triggers: ["long_relationship", "deep_understanding", "commitment", "shared_life", "weathered_challenges"] },
      { referenceCode: "LOV-010", emotionFamily: "LOVE", variant: "Universal Love", definition: "Expansive love that extends to all beings and existence", intensityMin: 65, intensityMax: 95, triggers: ["spiritual_awakening", "meditation", "oneness", "universal_connection", "divine_love"] },
      
      // SHAME variants (expanding from single entry to comprehensive variants)
      { referenceCode: "SHA-002", emotionFamily: "SHAME", variant: "Toxic Shame", definition: "Deeply internalized shame that defines one's core identity", intensityMin: 70, intensityMax: 100, triggers: ["core_identity_attack", "childhood_trauma", "systematic_abuse", "internalized_criticism", "identity_wounds"] },
      { referenceCode: "SHA-003", emotionFamily: "SHAME", variant: "Healthy Shame", definition: "Appropriate shame that signals moral boundaries and promotes growth", intensityMin: 30, intensityMax: 60, triggers: ["moral_violation", "boundary_crossing", "ethical_lapse", "value_conflict", "conscience_activation"] },
      { referenceCode: "SHA-004", emotionFamily: "SHAME", variant: "Body Shame", definition: "Shame specifically related to physical appearance or bodily functions", intensityMin: 40, intensityMax: 85, triggers: ["body_image", "physical_appearance", "weight", "disability", "bodily_functions"] },
      { referenceCode: "SHA-005", emotionFamily: "SHAME", variant: "Sexual Shame", definition: "Shame related to sexuality, desires, or sexual experiences", intensityMin: 50, intensityMax: 90, triggers: ["sexual_identity", "desires", "sexual_experience", "purity_culture", "sexual_trauma"] },
      { referenceCode: "SHA-006", emotionFamily: "SHAME", variant: "Cultural Shame", definition: "Shame arising from cultural identity or background", intensityMin: 45, intensityMax: 80, triggers: ["cultural_background", "accent", "traditions", "family_origin", "cultural_differences"] },
      { referenceCode: "SHA-007", emotionFamily: "SHAME", variant: "Academic Shame", definition: "Shame related to intellectual abilities or educational achievements", intensityMin: 40, intensityMax: 75, triggers: ["academic_failure", "intelligence_questioning", "learning_difficulties", "educational_background", "intellectual_inadequacy"] },
      { referenceCode: "SHA-008", emotionFamily: "SHAME", variant: "Social Shame", definition: "Shame arising from social rejection or social awkwardness", intensityMin: 45, intensityMax: 80, triggers: ["social_rejection", "awkwardness", "social_mistakes", "exclusion", "social_inadequacy"] },
      { referenceCode: "SHA-009", emotionFamily: "SHAME", variant: "Financial Shame", definition: "Shame related to economic status or financial struggles", intensityMin: 40, intensityMax: 75, triggers: ["poverty", "financial_failure", "economic_status", "unemployment", "financial_dependence"] },
      { referenceCode: "SHA-010", emotionFamily: "SHAME", variant: "Existential Shame", definition: "Deep shame about one's existence or fundamental worth", intensityMin: 60, intensityMax: 95, triggers: ["existence_questioning", "fundamental_worthlessness", "life_meaninglessness", "existential_crisis", "being_burden"] }
    ];

    const processedVariants = allVariants.map(variant => ({
      ...variant,
      culturalUniversality: "High",
      variants: {},
      blendableWith: [`${variant.emotionFamily.substring(0,3)}-001`],
      intensityMarkers: {
        low: ["mild", "slight", "subtle"],
        medium: ["moderate", "noticeable", "clear"],
        high: ["intense", "strong", "overwhelming"]
      }
    }));

    for (const variant of processedVariants) {
      try {
        await this.createEmotionEntry(variant);
      } catch (error) {
        // Variant may already exist, continue
      }
    }
    
    console.log(`✅ Auto-loaded ${processedVariants.length} emotion variants on startup`);
  }

  private initializeDefaultEmotions() {
    // Initialize with the provided emotion codex data
    const defaultEmotions = [
      {
        id: this.currentId++,
        referenceCode: "JOY-001",
        emotionFamily: "JOY",
        variant: "Joy",
        definition: "A positive emotional state marked by happiness, satisfaction, fulfillment, and inner contentment",
        intensityMin: 40,
        intensityMax: 100,
        culturalUniversality: "High",
        variants: {
          "JOY-002": { name: "Elation", intensity_range: [70, 100] },
          "JOY-003": { name: "Relief", intensity_range: [30, 80] },
          "JOY-004": { name: "Delight", intensity_range: [40, 70] },
          "JOY-005": { name: "Contentment", intensity_range: [30, 60] }
        },
        blendableWith: ["SUR-001", "LOV-001", "TRU-001"],
        triggers: ["achievement", "success", "positive_feedback", "celebration", "love", "gratitude"],
        intensityMarkers: {
          low: ["pleased", "glad", "content"],
          medium: ["happy", "excited", "joyful"],
          high: ["ecstatic", "thrilled", "euphoric"]
        },
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        referenceCode: "FEA-001",
        emotionFamily: "FEAR",
        variant: "Fear",
        definition: "A negative emotional state characterized by anxiety, worry, and apprehension in response to perceived threats or dangers",
        intensityMin: 30,
        intensityMax: 100,
        culturalUniversality: "High",
        variants: {
          "FEA-002": { name: "Anxiety", intensity_range: [40, 80] },
          "FEA-003": { name: "Dread", intensity_range: [60, 90] },
          "FEA-004": { name: "Panic", intensity_range: [80, 100] },
          "FEA-005": { name: "Worry", intensity_range: [30, 60] }
        },
        blendableWith: ["SAD-001", "ANG-001", "HEL-001"],
        triggers: ["uncertainty", "threat", "change", "failure", "loss", "unknown"],
        intensityMarkers: {
          low: ["concerned", "uneasy", "nervous"],
          medium: ["worried", "anxious", "fearful"],
          high: ["panicked", "terrified", "petrified"]
        },
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        referenceCode: "ANG-001",
        emotionFamily: "ANGER",
        variant: "Anger",
        definition: "A negative emotional state triggered by perceived threat, injustice, or boundary violations, often experienced as hostility, irritation, or moral outrage",
        intensityMin: 30,
        intensityMax: 100,
        culturalUniversality: "High",
        variants: {
          "ANG-002": { name: "Frustration", intensity_range: [30, 70] },
          "ANG-003": { name: "Rage", intensity_range: [80, 100] },
          "ANG-004": { name: "Resentment", intensity_range: [40, 80] },
          "ANG-005": { name: "Irritation", intensity_range: [20, 50] }
        },
        blendableWith: ["FEA-001", "DIS-001", "GUI-001"],
        triggers: ["injustice", "blocking", "disrespect", "betrayal", "incompetence", "delay"],
        intensityMarkers: {
          low: ["annoyed", "irritated", "bothered"],
          medium: ["frustrated", "angry", "mad"],
          high: ["furious", "enraged", "livid"]
        },
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        referenceCode: "LON-001",
        emotionFamily: "LONELINESS",
        variant: "Loneliness",
        definition: "A complex emotional state characterized by feelings of isolation, disconnection, and desire for meaningful social connection",
        intensityMin: 20,
        intensityMax: 100,
        culturalUniversality: "High",
        variants: {
          "LON-002": { name: "Crowded Isolation", intensity_range: [60, 90] },
          "LON-003": { name: "Emotional Isolation", intensity_range: [50, 80] },
          "LON-004": { name: "Social Invisibility", intensity_range: [40, 70] }
        },
        blendableWith: ["SAD-001", "HEL-001", "FEA-001"],
        triggers: ["isolation", "rejection", "misunderstanding", "abandonment", "disconnection"],
        intensityMarkers: {
          low: ["alone", "disconnected", "isolated"],
          medium: ["lonely", "forgotten", "invisible"],
          high: ["utterly alone", "completely isolated", "abandoned"]
        },
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        referenceCode: "HEL-001",
        emotionFamily: "HELPLESSNESS",
        variant: "Helplessness",
        definition: "A state of powerlessness and perceived inability to control or influence one's circumstances",
        intensityMin: 30,
        intensityMax: 100,
        culturalUniversality: "High",
        variants: {
          "HEL-002": { name: "Powerlessness", intensity_range: [60, 100] },
          "HEL-003": { name: "Overwhelm", intensity_range: [50, 90] },
          "HEL-004": { name: "Entrapment", intensity_range: [40, 80] }
        },
        blendableWith: ["FEA-001", "SAD-001", "LON-001"],
        triggers: ["overwhelming", "trapped", "powerless", "stuck", "no control"],
        intensityMarkers: {
          low: ["stuck", "limited", "constrained"],
          medium: ["powerless", "overwhelmed", "trapped"],
          high: ["completely helpless", "utterly powerless", "drowning"]
        },
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        referenceCode: "SAD-001",
        emotionFamily: "SADNESS",
        variant: "Sadness",
        definition: "A negative emotional state characterized by feelings of sorrow, loss, and emotional pain",
        intensityMin: 20,
        intensityMax: 100,
        culturalUniversality: "High",
        variants: {
          "SAD-002": { name: "Grief", intensity_range: [70, 100] },
          "SAD-003": { name: "Melancholy", intensity_range: [30, 60] },
          "SAD-004": { name: "Disappointment", intensity_range: [20, 50] }
        },
        blendableWith: ["FEA-001", "LON-001", "GUI-001"],
        triggers: ["loss", "rejection", "failure", "separation", "disappointment"],
        intensityMarkers: {
          low: ["blue", "down", "disappointed"],
          medium: ["sad", "sorrowful", "melancholy"],
          high: ["devastated", "heartbroken", "grief-stricken"]
        },
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        referenceCode: "LOV-001",
        emotionFamily: "LOVE",
        variant: "Love",
        definition: "A deep emotional attachment characterized by affection, care, and connection to others",
        intensityMin: 30,
        intensityMax: 100,
        culturalUniversality: "High",
        variants: {
          "LOV-002": { name: "Affection", intensity_range: [30, 70] },
          "LOV-003": { name: "Compassion", intensity_range: [40, 80] },
          "LOV-004": { name: "Passion", intensity_range: [70, 100] }
        },
        blendableWith: ["JOY-001", "TRU-001", "GRA-001"],
        triggers: ["connection", "caring", "affection", "bonding", "devotion"],
        intensityMarkers: {
          low: ["fond", "caring", "affectionate"],
          medium: ["loving", "devoted", "passionate"],
          high: ["deeply in love", "unconditional love", "soul connection"]
        },
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        referenceCode: "HOP-001",
        emotionFamily: "HOPE",
        variant: "Hope",
        definition: "A positive emotional state characterized by expectation and desire for a certain thing to happen",
        intensityMin: 30,
        intensityMax: 100,
        culturalUniversality: "High",
        variants: {
          "HOP-002": { name: "Optimism", intensity_range: [40, 80] },
          "HOP-003": { name: "Anticipation", intensity_range: [30, 70] },
          "HOP-004": { name: "Faith", intensity_range: [50, 90] }
        },
        blendableWith: ["JOY-001", "TRU-001", "LOV-001"],
        triggers: ["possibility", "future", "faith", "optimism", "belief"],
        intensityMarkers: {
          low: ["hopeful", "optimistic", "expectant"],
          medium: ["confident", "believing", "trusting"],
          high: ["certain", "unwavering faith", "absolute confidence"]
        },
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        referenceCode: "GRI-001",
        emotionFamily: "GRIEF",
        variant: "Grief",
        definition: "Deep sorrow especially that caused by someone's death or a significant loss",
        intensityMin: 50,
        intensityMax: 100,
        culturalUniversality: "High",
        variants: {
          "GRI-002": { name: "Bereavement", intensity_range: [70, 100] },
          "GRI-003": { name: "Mourning", intensity_range: [60, 90] },
          "GRI-004": { name: "Loss", intensity_range: [50, 80] }
        },
        blendableWith: ["SAD-001", "LON-001", "HEL-001"],
        triggers: ["death", "loss", "separation", "ending", "absence"],
        intensityMarkers: {
          low: ["missing", "saddened", "mourning"],
          medium: ["grieving", "bereaved", "heartbroken"],
          high: ["devastated", "inconsolable", "shattered"]
        },
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        referenceCode: "DIS-001",
        emotionFamily: "DISGUST",
        variant: "Disgust",
        definition: "A feeling of revulsion or strong disapproval aroused by something unpleasant or offensive",
        intensityMin: 20,
        intensityMax: 100,
        culturalUniversality: "High",
        variants: {
          "DIS-002": { name: "Revulsion", intensity_range: [60, 100] },
          "DIS-003": { name: "Contempt", intensity_range: [40, 80] },
          "DIS-004": { name: "Disdain", intensity_range: [30, 70] }
        },
        blendableWith: ["ANG-001", "FEA-001"],
        triggers: ["offensive", "unpleasant", "repulsive", "morally wrong"],
        intensityMarkers: {
          low: ["distaste", "dislike", "disapproval"],
          medium: ["disgusted", "repulsed", "revolted"],
          high: ["nauseated", "sickened", "abhorrent"]
        },
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        referenceCode: "SUR-001",
        emotionFamily: "SURPRISE",
        variant: "Surprise",
        definition: "A feeling of mild astonishment or shock caused by something unexpected",
        intensityMin: 20,
        intensityMax: 100,
        culturalUniversality: "High",
        variants: {
          "SUR-002": { name: "Amazement", intensity_range: [60, 90] },
          "SUR-003": { name: "Shock", intensity_range: [70, 100] },
          "SUR-004": { name: "Wonder", intensity_range: [40, 80] }
        },
        blendableWith: ["JOY-001", "FEA-001", "CUR-001"],
        triggers: ["unexpected", "sudden", "novel", "shocking"],
        intensityMarkers: {
          low: ["surprised", "taken aback", "caught off guard"],
          medium: ["astonished", "amazed", "startled"],
          high: ["shocked", "stunned", "flabbergasted"]
        },
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        referenceCode: "CUR-001",
        emotionFamily: "CURIOSITY",
        variant: "Curiosity",
        definition: "A strong desire to know or learn something",
        intensityMin: 20,
        intensityMax: 90,
        culturalUniversality: "High",
        variants: {
          "CUR-002": { name: "Intrigue", intensity_range: [40, 70] },
          "CUR-003": { name: "Wonder", intensity_range: [30, 80] },
          "CUR-004": { name: "Investigation", intensity_range: [50, 90] }
        },
        blendableWith: ["SUR-001", "JOY-001"],
        triggers: ["mystery", "unknown", "question", "exploration"],
        intensityMarkers: {
          low: ["interested", "curious", "wondering"],
          medium: ["intrigued", "fascinated", "eager to know"],
          high: ["obsessed", "consumed by curiosity", "must know"]
        },
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        referenceCode: "GUI-001",
        emotionFamily: "GUILT",
        variant: "Guilt",
        definition: "A feeling of having done wrong or failed in an obligation",
        intensityMin: 30,
        intensityMax: 100,
        culturalUniversality: "High",
        variants: {
          "GUI-002": { name: "Remorse", intensity_range: [60, 100] },
          "GUI-003": { name: "Regret", intensity_range: [40, 80] },
          "GUI-004": { name: "Self-Blame", intensity_range: [50, 90] }
        },
        blendableWith: ["SAD-001", "SHA-001", "FEA-001"],
        triggers: ["wrongdoing", "mistake", "harm", "responsibility"],
        intensityMarkers: {
          low: ["sorry", "regretful", "apologetic"],
          medium: ["guilty", "remorseful", "ashamed"],
          high: ["tormented", "consumed by guilt", "self-loathing"]
        },
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        referenceCode: "SHA-001",
        emotionFamily: "SHAME",
        variant: "Shame",
        definition: "A painful feeling of humiliation or distress caused by consciousness of wrong or foolish behavior",
        intensityMin: 40,
        intensityMax: 100,
        culturalUniversality: "High",
        variants: {
          "SHA-002": { name: "Embarrassment", intensity_range: [40, 70] },
          "SHA-003": { name: "Humiliation", intensity_range: [70, 100] },
          "SHA-004": { name: "Mortification", intensity_range: [80, 100] }
        },
        blendableWith: ["GUI-001", "SAD-001", "ANG-001"],
        triggers: ["exposure", "judgment", "failure", "inadequacy"],
        intensityMarkers: {
          low: ["embarrassed", "self-conscious", "awkward"],
          medium: ["ashamed", "humiliated", "mortified"],
          high: ["utterly shamed", "wanting to disappear", "crushed"]
        },
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        referenceCode: "TRU-001",
        emotionFamily: "TRUST",
        variant: "Trust",
        definition: "Firm belief in the reliability, truth, or ability of someone or something",
        intensityMin: 30,
        intensityMax: 100,
        culturalUniversality: "High",
        variants: {
          "TRU-002": { name: "Faith", intensity_range: [60, 100] },
          "TRU-003": { name: "Confidence", intensity_range: [50, 90] },
          "TRU-004": { name: "Security", intensity_range: [40, 80] }
        },
        blendableWith: ["LOV-001", "HOP-001", "JOY-001"],
        triggers: ["reliability", "safety", "honesty", "consistency"],
        intensityMarkers: {
          low: ["trusting", "confident", "believing"],
          medium: ["secure", "certain", "faithful"],
          high: ["unwavering trust", "absolute faith", "complete confidence"]
        },
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        referenceCode: "PLA-001",
        emotionFamily: "PLAYFULNESS",
        variant: "Playfulness",
        definition: "A lighthearted, fun-loving attitude characterized by humor and spontaneity",
        intensityMin: 20,
        intensityMax: 90,
        culturalUniversality: "High",
        variants: {
          "PLA-002": { name: "Amusement", intensity_range: [30, 70] },
          "PLA-003": { name: "Humor", intensity_range: [40, 80] },
          "PLA-004": { name: "Whimsy", intensity_range: [20, 60] }
        },
        blendableWith: ["JOY-001", "CUR-001", "SUR-001"],
        triggers: ["fun", "games", "jokes", "spontaneity"],
        intensityMarkers: {
          low: ["playful", "lighthearted", "amused"],
          medium: ["silly", "goofy", "mischievous"],
          high: ["exuberant", "wild", "uncontrollably playful"]
        },
        createdAt: new Date(),
      }
    ];

    defaultEmotions.forEach(emotion => {
      this.emotionEntries.set(emotion.referenceCode, emotion as EmotionEntry);
    });
  }

  async getEmotionEntry(referenceCode: string): Promise<EmotionEntry | undefined> {
    return this.emotionEntries.get(referenceCode);
  }

  async getAllEmotionEntries(): Promise<EmotionEntry[]> {
    return Array.from(this.emotionEntries.values());
  }

  async searchEmotionEntries(query: string): Promise<EmotionEntry[]> {
    const entries = Array.from(this.emotionEntries.values());
    const lowerQuery = query.toLowerCase();
    
    return entries.filter(entry => 
      entry.emotionFamily.toLowerCase().includes(lowerQuery) ||
      entry.variant?.toLowerCase().includes(lowerQuery) ||
      entry.definition.toLowerCase().includes(lowerQuery) ||
      (entry.triggers as string[]).some(trigger => trigger.toLowerCase().includes(lowerQuery))
    );
  }

  async createEmotionEntry(entry: InsertEmotionEntry): Promise<EmotionEntry> {
    const newEntry: EmotionEntry = {
      id: this.currentId++,
      referenceCode: entry.referenceCode,
      emotionFamily: entry.emotionFamily,
      variant: entry.variant || null,
      definition: entry.definition,
      intensityMin: entry.intensityMin,
      intensityMax: entry.intensityMax,
      culturalUniversality: entry.culturalUniversality,
      variants: entry.variants || null,
      blendableWith: entry.blendableWith ? (entry.blendableWith as any) as string[] : null,
      triggers: entry.triggers ? (entry.triggers as any) as string[] : null,
      intensityMarkers: (entry.intensityMarkers && typeof entry.intensityMarkers === 'object') ? entry.intensityMarkers as Record<string, string[]> : null,
      createdAt: new Date(),
    };
    
    this.emotionEntries.set(newEntry.referenceCode, newEntry);
    return newEntry;
  }

  async getCmopEntry(emid: string): Promise<CmopEntry | undefined> {
    return this.cmopEntries.get(emid);
  }

  async getAllCmopEntries(): Promise<CmopEntry[]> {
    return Array.from(this.cmopEntries.values());
  }

  async createCmopEntry(entry: InsertCmopEntry): Promise<CmopEntry> {
    const newEntry: CmopEntry = {
      id: this.currentId++,
      emid: entry.emid,
      inputPhrase: entry.inputPhrase,
      emotionFamily: entry.emotionFamily,
      variant: entry.variant || null,
      codexReference: entry.codexReference,
      intensity: entry.intensity,
      blendableWith: entry.blendableWith ? (entry.blendableWith as any) as string[] : null,
      symbolicReference: entry.symbolicReference || null,
      culturalTag: entry.culturalTag || null,
      confidence: entry.confidence,
      salAnalysis: entry.salAnalysis ? (entry.salAnalysis as any) : null,
      timestamp: new Date(),
    };
    
    this.cmopEntries.set(newEntry.emid, newEntry);
    return newEntry;
  }

  async getProcessingSession(sessionId: string): Promise<ProcessingSession | undefined> {
    return this.processingSessions.get(sessionId);
  }

  async createProcessingSession(session: InsertProcessingSession): Promise<ProcessingSession> {
    const newSession: ProcessingSession = {
      id: this.currentId++,
      sessionId: session.sessionId,
      emotionsProcessed: session.emotionsProcessed ?? null,
      successfulMatches: session.successfulMatches ?? null,
      manualEntries: session.manualEntries ?? null,
      avgConfidence: session.avgConfidence ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.processingSessions.set(newSession.sessionId, newSession);
    return newSession;
  }

  async updateProcessingSession(sessionId: string, updates: Partial<ProcessingSession>): Promise<ProcessingSession> {
    const existing = this.processingSessions.get(sessionId);
    if (!existing) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    const updated: ProcessingSession = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    
    this.processingSessions.set(sessionId, updated);
    return updated;
  }
}

export const storage = new MemStorage();
