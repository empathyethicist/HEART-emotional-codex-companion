import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Book, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function CodexBrowser() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFamily, setSelectedFamily] = useState("");

  const { data: codexEntries = [], isLoading } = useQuery<CodexEntry[]>({
    queryKey: ["/api/emotions/codex", searchQuery, selectedFamily !== "all" ? selectedFamily : ""].filter(Boolean),
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
    ];
    const hash = reference.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

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
        <CardTitle className="flex items-center">
          <Book className="mr-2 text-accent" />
          Emotion Codex Browser
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search and Filter */}
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
                <SelectItem value="FEAR">FEAR</SelectItem>
                <SelectItem value="ANGER">ANGER</SelectItem>
                <SelectItem value="SADNESS">SADNESS</SelectItem>
                <SelectItem value="LOVE">LOVE</SelectItem>
                <SelectItem value="SURPRISE">SURPRISE</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Codex Entries */}
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
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 interactive-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Badge className={`${getReferenceColor(entry.data.reference_code)} mr-3 font-roboto-mono`}>
                      {entry.data.reference_code}
                    </Badge>
                    <h3 className="font-semibold text-lg">{entry.family}</h3>
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

                  {/* Triggers */}
                  {entry.data.triggers && entry.data.triggers.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Triggers:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {entry.data.triggers.slice(0, 6).map((trigger, tIndex) => (
                          <Badge key={tIndex} variant="secondary" className="text-xs">
                            {trigger}
                          </Badge>
                        ))}
                        {entry.data.triggers.length > 6 && (
                          <Badge variant="secondary" className="text-xs">
                            +{entry.data.triggers.length - 6} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Intensity Range */}
                <div className="mt-3">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Intensity Range: {entry.data.intensity_range[0]}% - {entry.data.intensity_range[1]}%
                  </span>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                    <div 
                      className="intensity-bar h-2 rounded-full" 
                      style={{
                        width: `${entry.data.intensity_range[1]}%`,
                        marginLeft: `${entry.data.intensity_range[0]}%`
                      }}
                    />
                  </div>
                </div>

                {/* Blendable With */}
                {entry.data.blendable_with && entry.data.blendable_with.length > 0 && (
                  <div className="mt-3">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Blendable With:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {entry.data.blendable_with.map((blend, bIndex) => (
                        <Badge key={bIndex} variant="outline" className="text-xs">
                          {blend}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
