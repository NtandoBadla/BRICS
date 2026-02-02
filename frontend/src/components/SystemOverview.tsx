"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Trophy, 
  Calendar, 
  Shield, 
  Activity, 
  Database, 
  Server, 
  AlertCircle,
  CheckCircle,
  TrendingUp,
  BarChart3,
  Settings
} from 'lucide-react';

interface SystemStats {
  users: {
    total: number;
    active: number;
    byRole: Record<string, number>;
  };
  competitions: {
    total: number;
    active: number;
    completed: number;
  };
  matches: {
    total: number;
    scheduled: number;
    completed: number;
    live: number;
  };
  system: {
    uptime: string;
    version: string;
    lastBackup: string;
    dbConnections: number;
    apiCalls: number;
  };
}

interface SystemHealth {
  database: 'healthy' | 'warning' | 'error';
  api: 'healthy' | 'warning' | 'error';
  storage: 'healthy' | 'warning' | 'error';
  overall: 'healthy' | 'warning' | 'error';
}

export default function SystemOverview() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchSystemData();
    const interval = setInterval(fetchSystemData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSystemData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch system statistics
      const [usersRes, competitionsRes, matchesRes, healthRes] = await Promise.all([
        fetch('/api/admin/stats/users', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/stats/competitions', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/stats/matches', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/health', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      // Mock data for demonstration (replace with actual API responses)
      const mockStats: SystemStats = {
        users: {
          total: 156,
          active: 89,
          byRole: {
            'ADMIN': 3,
            'SECRETARIAT': 8,
            'REFEREE': 24,
            'TEAM_MANAGER': 45,
            'FEDERATION_OFFICIAL': 76
          }
        },
        competitions: {
          total: 12,
          active: 5,
          completed: 7
        },
        matches: {
          total: 248,
          scheduled: 45,
          completed: 198,
          live: 5
        },
        system: {
          uptime: '15 days, 8 hours',
          version: '2.1.0',
          lastBackup: '2024-01-15 02:00:00',
          dbConnections: 12,
          apiCalls: 15420
        }
      };

      const mockHealth: SystemHealth = {
        database: 'healthy',
        api: 'healthy',
        storage: 'healthy',
        overall: 'healthy'
      };

      setStats(mockStats);
      setHealth(mockHealth);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch system data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">Loading system overview...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-3 rounded-lg border ${getHealthColor(health?.database || 'healthy')}`}>
              <div className="flex items-center gap-2">
                {getHealthIcon(health?.database || 'healthy')}
                <span className="font-medium">Database</span>
              </div>
              <p className="text-sm mt-1 capitalize">{health?.database || 'healthy'}</p>
            </div>
            <div className={`p-3 rounded-lg border ${getHealthColor(health?.api || 'healthy')}`}>
              <div className="flex items-center gap-2">
                {getHealthIcon(health?.api || 'healthy')}
                <span className="font-medium">API</span>
              </div>
              <p className="text-sm mt-1 capitalize">{health?.api || 'healthy'}</p>
            </div>
            <div className={`p-3 rounded-lg border ${getHealthColor(health?.storage || 'healthy')}`}>
              <div className="flex items-center gap-2">
                {getHealthIcon(health?.storage || 'healthy')}
                <span className="font-medium">Storage</span>
              </div>
              <p className="text-sm mt-1 capitalize">{health?.storage || 'healthy'}</p>
            </div>
            <div className={`p-3 rounded-lg border ${getHealthColor(health?.overall || 'healthy')}`}>
              <div className="flex items-center gap-2">
                {getHealthIcon(health?.overall || 'healthy')}
                <span className="font-medium">Overall</span>
              </div>
              <p className="text-sm mt-1 capitalize">{health?.overall || 'healthy'}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
            <Button variant="outline" size="sm" onClick={fetchSystemData}>
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Statistics */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.users.total}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.users.active} active users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Competitions</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.competitions.total}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.competitions.active} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Matches</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.matches.total}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.matches.live} live now
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Calls</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.system.apiCalls.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Today</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Distribution by Role</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.users.byRole && Object.entries(stats.users.byRole).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{role}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32">
                        <Progress value={(count / stats.users.total) * 100} className="h-2" />
                      </div>
                      <span className="text-sm font-medium w-8">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Match Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Scheduled</span>
                    <Badge variant="outline">{stats?.matches.scheduled}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Live</span>
                    <Badge className="bg-green-100 text-green-800">{stats?.matches.live}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Completed</span>
                    <Badge variant="secondary">{stats?.matches.completed}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Competition Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Active</span>
                    <Badge className="bg-blue-100 text-blue-800">{stats?.competitions.active}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Completed</span>
                    <Badge variant="secondary">{stats?.competitions.completed}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Version</span>
                    <Badge>{stats?.system.version}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Uptime</span>
                    <span className="text-sm">{stats?.system.uptime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DB Connections</span>
                    <span className="text-sm">{stats?.system.dbConnections}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Maintenance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Last Backup</span>
                    <span className="text-sm">{stats?.system.lastBackup}</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    System Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}