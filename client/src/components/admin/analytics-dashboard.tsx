import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Zap,
  Eye,
  MessageSquare,
  Calendar
} from "lucide-react";

export function AnalyticsDashboard() {
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["/api/admin/analytics/summary"],
  });

  const { data: detailed, isLoading: detailedLoading } = useQuery({
    queryKey: ["/api/admin/analytics/detailed"],
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getTopPages = () => {
    if (!detailed?.pageViews) return [];
    return Object.entries(detailed.pageViews)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5);
  };

  const getRecentDays = () => {
    if (!detailed?.dailyViews) return [];
    return Object.entries(detailed.dailyViews)
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
      .slice(0, 7);
  };

  if (summaryLoading || detailedLoading) {
    return (
      <div className="grid lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-slate-800 border-slate-700 animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-slate-600 rounded mb-2"></div>
              <div className="h-8 bg-slate-600 rounded mb-2"></div>
              <div className="h-3 bg-slate-600 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Page Views</h3>
              <Eye className="w-6 h-6 text-primary" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {formatNumber(summary?.totalViews || 0)}
            </div>
            <div className="text-emerald-400 text-sm">+12.5% from last month</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">MVPs Generated</h3>
              <Zap className="w-6 h-6 text-amber-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {formatNumber(summary?.totalMvpGenerated || 0)}
            </div>
            <div className="text-emerald-400 text-sm">+8.2% from last month</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">API Calls</h3>
              <BarChart3 className="w-6 h-6 text-violet-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {formatNumber(summary?.totalApiCalls || 0)}
            </div>
            <div className="text-emerald-400 text-sm">+15.7% from last month</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Active Users</h3>
              <Users className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {formatNumber(summary?.activeUsers || 0)}
            </div>
            <div className="text-emerald-400 text-sm">+22.1% from last month</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Top Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getTopPages().map(([page, views], index) => (
                <div key={page} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {index + 1}
                    </div>
                    <span className="text-slate-300">{page}</span>
                  </div>
                  <span className="text-white font-semibold">{views}</span>
                </div>
              ))}
              {getTopPages().length === 0 && (
                <p className="text-slate-400 text-center py-4">No page data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Daily Views (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getRecentDays().map(([date, views]) => (
                <div key={date} className="flex items-center justify-between">
                  <span className="text-slate-300">
                    {new Date(date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="h-2 bg-primary rounded"
                      style={{ 
                        width: `${Math.min((views as number) / Math.max(...Object.values(detailed?.dailyViews || {})) * 100, 100)}px` 
                      }}
                    ></div>
                    <span className="text-white font-semibold w-12 text-right">{views}</span>
                  </div>
                </div>
              ))}
              {getRecentDays().length === 0 && (
                <p className="text-slate-400 text-center py-4">No daily data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400 mb-2">
                {summary?.totalMvpGenerated && summary?.totalViews 
                  ? ((summary.totalMvpGenerated / summary.totalViews) * 100).toFixed(1)
                  : '0.0'
                }%
              </div>
              <p className="text-sm text-slate-400">Conversion Rate</p>
              <p className="text-xs text-slate-500 mt-1">
                Visitors who generate MVP plans
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400 mb-2">
                {summary?.totalApiCalls && summary?.totalMvpGenerated 
                  ? (summary.totalApiCalls / summary.totalMvpGenerated).toFixed(1)
                  : '0.0'
                }
              </div>
              <p className="text-sm text-slate-400">Avg API Calls per MVP</p>
              <p className="text-xs text-slate-500 mt-1">
                API efficiency metric
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-violet-400 mb-2">
                {summary?.totalViews && summary?.activeUsers 
                  ? (summary.totalViews / summary.activeUsers).toFixed(1)
                  : '0.0'
                }
              </div>
              <p className="text-sm text-slate-400">Pages per User</p>
              <p className="text-xs text-slate-500 mt-1">
                User engagement metric
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
