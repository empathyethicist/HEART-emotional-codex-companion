import { useQuery } from "@tanstack/react-query";
import { Activity, BarChart3, History, Settings, FolderSync } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function Sidebar() {
  // Mock session statistics (in a real app, this would come from the backend)
  const sessionStats = {
    processed: 127,
    matches: 104,
    manual: 23,
    confidence: 82
  };

  // Fetch recent activity
  const { data: recentActivity = [] } = useQuery({
    queryKey: ["/api/cmop/recent"],
  });

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getActivityIcon = (emotionFamily: string) => {
    const icons: Record<string, string> = {
      'JOY': '😊',
      'SADNESS': '😢',
      'FEAR': '😰',
      'ANGER': '😠',
      'LOVE': '❤️',
      'SURPRISE': '😲',
      'DISGUST': '🤢',
      'TRUST': '🤝',
    };
    return icons[emotionFamily] || '🧠';
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <Card className="surface-card">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <BarChart3 className="mr-2 h-5 w-5" />
            Session Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Emotions Processed:</span>
            <Badge variant="outline" className="font-mono">
              {sessionStats.processed}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Successful Matches:</span>
            <Badge className="bg-secondary text-secondary-foreground font-mono">
              {sessionStats.matches}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Manual Entries:</span>
            <Badge className="bg-accent text-accent-foreground font-mono">
              {sessionStats.manual}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Avg. Confidence:</span>
            <Badge variant="outline" className="font-mono">
              {sessionStats.confidence}%
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="surface-card">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Activity className="mr-2 h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              <Activity className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
              <p className="text-xs">Process emotions to see activity here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.slice(0, 8).map((activity: any, index: number) => (
                <div key={index} className="flex items-center space-x-3 text-sm">
                  <div className="flex-shrink-0">
                    <span className="text-lg">{getActivityIcon(activity.emotionFamily)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400 text-xs">
                        {formatTime(activity.timestamp)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {activity.emotionFamily}
                      </Badge>
                    </div>
                    <p className="text-gray-900 dark:text-gray-100 truncate">
                      {activity.inputPhrase.length > 30 
                        ? `${activity.inputPhrase.substring(0, 30)}...`
                        : activity.inputPhrase
                      }
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="surface-card">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Settings className="mr-2 h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-sm"
            onClick={() => {
              // In a real app, this would open a history modal or navigate to a history page
              console.log("View processing history");
            }}
          >
            <History className="mr-2 h-4 w-4 text-gray-400" />
            View Processing History
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-sm"
            onClick={() => {
              // In a real app, this would generate an analytics report
              console.log("Generate analytics report");
            }}
          >
            <BarChart3 className="mr-2 h-4 w-4 text-gray-400" />
            Generate Analytics Report
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-sm"
            onClick={() => {
              // In a real app, this would sync with a remote codex
              console.log("FolderSync with remote codex");
            }}
          >
            <FolderSync className="mr-2 h-4 w-4 text-gray-400" />
            FolderSync with Remote Codex
          </Button>
          <Separator className="my-2" />
          <Button
            variant="ghost"
            className="w-full justify-start text-sm"
            onClick={() => {
              // In a real app, this would open configuration settings
              console.log("Open configuration settings");
            }}
          >
            <Settings className="mr-2 h-4 w-4 text-gray-400" />
            Configuration Settings
          </Button>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card className="surface-card">
        <CardHeader>
          <CardTitle className="text-lg">System Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Codex Version:</span>
            <Badge variant="outline">2.1.0</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">API Status:</span>
            <Badge className="bg-secondary text-secondary-foreground">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              Connected
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Framework:</span>
            <Badge variant="outline">HEART</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
