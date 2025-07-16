import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Book, Search, Filter, Volume2, Globe, Brain, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

interface CodexEntry {
  family: string;
  data: {
    reference_code: string;
    definition: string;
    intensity_range: [number, number];
    cultural_universality: string;
    variants?: Record<string, { name: string; intensity_range: [number, number] }>;
    blendable_with?: string[];
    triggers?: string[];
    intensity_markers?: {
      low: string[];
      medium: string[];
      high: string[];
    };
  };
}

type BrowserType = 'emotions' | 'tone-codes' | 'cultural-profiles';

export default function CodexBrowser() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFamily, setSelectedFamily] = useState("");
  const [browserType, setBrowserType] = useState<BrowserType>('emotions');

  // Fetch emotion codex entries
  const { data: codexEntries = [], isLoading: isLoadingEmotions } = useQuery<CodexEntry[]>({
    queryKey: ["/api/emotions/codex", { search: searchQuery, family: selectedFamily !== "all" ? selectedFamily : undefined }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedFamily && selectedFamily !== "all") params.append('family', selectedFamily);
      
      const response = await fetch(`/api/emotions/codex?${params}`);
      if (!response.ok) throw new Error('Failed to fetch codex entries');
      return response.json();
    },
    enabled: browserType === 'emotions'
  });

  // Fetch tone codes
  const { data: toneCodes, isLoading: isLoadingTones } = useQuery({
    queryKey: ["/api/emotions/tone-codes"],
    staleTime: 5 * 60 * 1000,
    enabled: browserType === 'tone-codes'
  });

  // Fetch cultural profiles
  const { data: culturalProfiles, isLoading: isLoadingCultures } = useQuery({
    queryKey: ["/api/emotions/cultural-profiles"],
    staleTime: 5 * 60 * 1000,
    enabled: browserType === 'cultural-profiles'
  });

  const getUniversalityColor = (universality: string) => {
    switch (universality.toLowerCase()) {
      case "high": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      case "low": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100";
    }
  };

  const getReferenceColor = (reference: string) => {
    const colors = [
      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
      "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100",
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100",
      "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100",
    ];
    const hash = reference.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const isLoading = isLoadingEmotions || isLoadingTones || isLoadingCultures;

  if (isLoading) {
    return (
      <Card className="surface-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Book className="mr-2 text-accent" />
            Emotion Codex Browser
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Skeleton className="h-6 w-20 mr-3" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-4 w-full mb-3" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Skeleton className="h-4 w-16 mb-2" />
                  <div className="flex gap-1">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
                <div>
                  <Skeleton className="h-4 w-16 mb-2" />
                  <div className="flex gap-1">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="surface-card">
      <CardHeader>
        <CardTitle>
          Codex Browser
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Browser Type Selector */}
        <div className="mb-6">
          <Select value={browserType} onValueChange={(value: BrowserType) => setBrowserType(value)}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="emotions">
                <div className="flex items-center">
                  <Brain className="mr-2 h-4 w-4" />
                  Emotion Families
                </div>
              </SelectItem>
              <SelectItem value="tone-codes">
                <div className="flex items-center">
                  <Volume2 className="mr-2 h-4 w-4" />
                  T-Code Classification
                </div>
              </SelectItem>
              <SelectItem value="cultural-profiles">
                <div className="flex items-center">
                  <Globe className="mr-2 h-4 w-4" />
                  Cultural Profiles
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search and Filter - only show for emotions */}
        {browserType === 'emotions' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search emotions, variants, or triggers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Select value={selectedFamily} onValueChange={setSelectedFamily}>
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder="All Families" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Families</SelectItem>
                  <SelectItem value="JOY">JOY</SelectItem>
                  <SelectItem value="SADNESS">SADNESS</SelectItem>
                  <SelectItem value="ANGER">ANGER</SelectItem>
                  <SelectItem value="FEAR">FEAR</SelectItem>
                  <SelectItem value="LOVE">LOVE</SelectItem>
                  <SelectItem value="DISGUST">DISGUST</SelectItem>
                  <SelectItem value="CURIOSITY">CURIOSITY</SelectItem>
                  <SelectItem value="GUILT">GUILT</SelectItem>
                  <SelectItem value="SHAME">SHAME</SelectItem>
                  <SelectItem value="SURPRISE">SURPRISE</SelectItem>
                  <SelectItem value="PLAYFULNESS">PLAYFULNESS</SelectItem>
                  <SelectItem value="TRUST">TRUST</SelectItem>
                  <SelectItem value="HOPE">HOPE</SelectItem>
                  <SelectItem value="GRIEF">GRIEF</SelectItem>
                  <SelectItem value="HELPLESSNESS">HELPLESSNESS</SelectItem>
                  <SelectItem value="LONELINESS">LONELINESS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Content Display based on browser type */}
        {browserType === 'emotions' && (
          <>
            {/* Statistics Display */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{codexEntries.length}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Emotion Families</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {codexEntries.reduce((total, entry) => 
                      total + (entry.data.variants ? Object.keys(entry.data.variants).length : 0), 0
                    )}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Variants</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {codexEntries.reduce((total, entry) => 
                      total + (entry.data.triggers ? entry.data.triggers.length : 0), 0
                    )}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Triggers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {codexEntries.reduce((total, entry) => 
                      total + (entry.data.blendable_with ? entry.data.blendable_with.length : 0), 0
                    )}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Blendable</div>
                </div>
              </div>
            </div>

            <EmotionsDisplay 
              codexEntries={codexEntries} 
              searchQuery={searchQuery}
              selectedFamily={selectedFamily}
              getReferenceColor={getReferenceColor}
              getUniversalityColor={getUniversalityColor}
            />
          </>
        )}

        {browserType === 'tone-codes' && <ToneCodesDisplay toneCodes={toneCodes} />}

        {browserType === 'cultural-profiles' && <CulturalProfilesDisplay culturalProfiles={culturalProfiles} />}
      </CardContent>
    </Card>
  );
}

// Emotions Display Component
function EmotionsDisplay({ 
  codexEntries, 
  searchQuery, 
  selectedFamily, 
  getReferenceColor, 
  getUniversalityColor 
}: { 
  codexEntries: CodexEntry[]; 
  searchQuery: string;
  selectedFamily: string;
  getReferenceColor: (ref: string) => string; 
  getUniversalityColor: (universality: string) => string; 
}) {
  return (
    <div className="space-y-4">
      {codexEntries.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          {searchQuery || selectedFamily ? (
            <>
              <Search className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No emotions found matching your criteria.</p>
              <p className="text-sm">Try adjusting your search or filters.</p>
            </>
          ) : (
            <>
              <Book className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Loading emotion codex...</p>
            </>
          )}
        </div>
      ) : (
        codexEntries.map((entry, index) => (
          <div 
            key={index} 
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 interactive-card hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer"
            onClick={() => {
              // Show detailed information in console for now
              console.log('🧠 Emotional Codex™ Entry:', {
                family: entry.family,
                code: entry.data.reference_code,
                definition: entry.data.definition,
                variants: entry.data.variants ? Object.keys(entry.data.variants).length : 0,
                universality: entry.data.cultural_universality,
                intensity_range: entry.data.intensity_range,
                triggers: entry.data.triggers?.length || 0,
                blendable_emotions: entry.data.blendable_with?.length || 0
              });
              
              // Visual feedback
              const element = document.querySelector(`[data-emotion="${entry.data.reference_code}"]`);
              if (element) {
                element.classList.add('ring-2', 'ring-primary', 'ring-opacity-50');
                setTimeout(() => {
                  element.classList.remove('ring-2', 'ring-primary', 'ring-opacity-50');
                }, 1500);
              }
            }}
            data-emotion={entry.data.reference_code}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Badge className={`${getReferenceColor(entry.data.reference_code)} mr-3 font-roboto-mono text-xs`}>
                  {entry.data.reference_code}
                </Badge>
                <h3 className="font-semibold text-lg text-primary">{entry.family}</h3>
              </div>
              <Badge className={getUniversalityColor(entry.data.cultural_universality)}>
                Universality: {entry.data.cultural_universality}
              </Badge>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-3">{entry.data.definition}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Variants */}
              {entry.data.variants && Object.keys(entry.data.variants).length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Variants:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Object.values(entry.data.variants).map((variant, vIndex) => (
                      <Badge key={vIndex} variant="outline" className="text-xs">
                        {variant.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Blendable emotions */}
              {entry.data.blendable_with && entry.data.blendable_with.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Blendable With:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {entry.data.blendable_with.map((emotion, bIndex) => (
                      <Badge key={bIndex} variant="secondary" className="text-xs">
                        {emotion}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Triggers */}
              {entry.data.triggers && entry.data.triggers.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Common Triggers:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {entry.data.triggers.slice(0, 6).map((trigger, tIndex) => (
                      <Badge key={tIndex} variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900">
                        {trigger}
                      </Badge>
                    ))}
                    {entry.data.triggers.length > 6 && (
                      <Badge variant="outline" className="text-xs">
                        +{entry.data.triggers.length - 6} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Intensity Range */}
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Intensity Range:</span>
                <div className="mt-1">
                  <Progress 
                    value={((entry.data.intensity_range[0] + entry.data.intensity_range[1]) / 2)} 
                    className="h-2" 
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{entry.data.intensity_range[0]}%</span>
                    <span>{entry.data.intensity_range[1]}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// T-Codes Display Component
function ToneCodesDisplay({ toneCodes }: { toneCodes: any }) {
  if (!toneCodes) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <Volume2 className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p>Loading T-Code classification system...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">T-Code Tone Classification System</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Professional expression modulation framework for emotional intelligence
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(toneCodes).map(([code, toneData]) => {
          const tone = toneData as any;
          return (
            <div key={code} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Volume2 className="mr-2 h-5 w-5 text-blue-600" />
                  <Badge variant="outline" className="mr-2 font-mono">{code}</Badge>
                  <h4 className="font-semibold">{tone.name}</h4>
                </div>
                <Badge 
                  variant={tone.riskLevel === 'high' ? 'destructive' : 
                          tone.riskLevel === 'medium' ? 'secondary' : 'default'}
                >
                  {tone.riskLevel} risk
                </Badge>
              </div>
              
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                {tone.description}
              </p>
              
              <div className="space-y-2">
                <div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Use Case:</span>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{tone.useCase}</p>
                </div>
                
                {tone.culturalAlignment && tone.culturalAlignment.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Cultural Alignment:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tone.culturalAlignment.slice(0, 3).map((culture: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {culture}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Cultural Profiles Display Component
function CulturalProfilesDisplay({ culturalProfiles }: { culturalProfiles: any }) {
  if (!culturalProfiles) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <Globe className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p>Loading cultural expression profiles...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Cultural Expression Modifier (CEM) Profiles</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Sophisticated cultural mapping for emotionally sensitive communication
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(culturalProfiles).map(([code, profileData]) => {
          const profile = profileData as any;
          return (
            <div key={code} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Globe className="mr-2 h-5 w-5 text-green-600" />
                <Badge variant="outline" className="mr-2 font-mono">{code}</Badge>
                <h4 className="font-semibold">{profile.region}</h4>
              </div>
              
              <div className="space-y-2">
                <div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Style:</span>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{profile.style}</p>
                </div>
                
                <div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Context:</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {profile.generational} • {profile.context}
                  </p>
                </div>
                
                <div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Description:</span>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{profile.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}