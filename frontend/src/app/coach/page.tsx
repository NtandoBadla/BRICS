'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Trophy, Bell, BarChart3, MessageSquare } from 'lucide-react';

export default function CoachDashboard() {
  const [teamAthletes, setTeamAthletes] = useState([]);
  const [teamStats, setTeamStats] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [teamId, setTeamId] = useState(null);

  useEffect(() => {
    // Get team ID from user context or localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.teamId) {
      setTeamId(user.teamId);
      fetchTeamAthletes(user.teamId);
      fetchTeamStats(user.teamId);
      fetchNotifications();
    }
  }, []);

  const fetchTeamAthletes = async (teamId) => {
    try {
      const response = await fetch(`/api/dashboard/coach/team/${teamId}/athletes`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setTeamAthletes(data);
    } catch (error) {
      console.error('Error fetching team athletes:', error);
    }
  };

  const fetchTeamStats = async (teamId) => {
    try {
      const response = await fetch(`/api/dashboard/coach/team/${teamId}/stats`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setTeamStats(data);
    } catch (error) {
      console.error('Error fetching team stats:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
      const response = await fetch(`/api/dashboard/notifications/${userId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const getAthleteStats = (athlete) => {
    const goals = athlete.matchEvents?.filter(e => e.type === 'GOAL').length || 0;
    const matches = athlete.matchEvents?.length || 0;
    const cards = athlete.matchEvents?.filter(e => e.type.includes('CARD')).length || 0;
    return { goals, matches, cards };
  };

  const getTeamOverallStats = () => {
    const totalGoals = teamAthletes.reduce((sum, athlete) => 
      sum + (athlete.matchEvents?.filter(e => e.type === 'GOAL').length || 0), 0);
    const totalMatches = teamAthletes.reduce((sum, athlete) => 
      sum + (athlete.matchEvents?.length || 0), 0);
    const totalCards = teamAthletes.reduce((sum, athlete) => 
      sum + (athlete.matchEvents?.filter(e => e.type.includes('CARD')).length || 0), 0);
    
    return { totalGoals, totalMatches, totalCards };
  };

  const overallStats = getTeamOverallStats();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Coach Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <Badge variant="secondary">{Array.isArray(notifications) ? notifications.filter(n => !n.isRead).length : 0}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Team Size</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{teamAthletes.length}</p>
            <p className="text-sm text-gray-600">Active players</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5" />
              <span>Total Goals</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{overallStats.totalGoals}</p>
            <p className="text-sm text-gray-600">This season</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Matches Played</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{overallStats.totalMatches}</p>
            <p className="text-sm text-gray-600">Total appearances</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Transfer Requests</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {teamAthletes.reduce((sum, athlete) => sum + (athlete.transferRequests?.length || 0), 0)}
            </p>
            <p className="text-sm text-gray-600">Pending requests</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="players" className="w-full">
        <TabsList>
          <TabsTrigger value="players">Team Players</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="players" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamAthletes.map(athlete => {
              const stats = getAthleteStats(athlete);
              return (
                <Card key={athlete.id}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{athlete.firstName} {athlete.lastName}</h4>
                          <p className="text-sm text-gray-600">
                            Age: {new Date().getFullYear() - new Date(athlete.dateOfBirth).getFullYear()}
                          </p>
                        </div>
                        {athlete.transferRequests?.length > 0 && (
                          <Badge variant="destructive">Transfer Request</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center">
                          <p className="font-semibold">{stats.matches}</p>
                          <p className="text-gray-600">Matches</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold">{stats.goals}</p>
                          <p className="text-gray-600">Goals</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold">{stats.cards}</p>
                          <p className="text-gray-600">Cards</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm">
                          <strong>Agent:</strong> {athlete.agent ? `${athlete.agent.firstName} ${athlete.agent.lastName}` : 'No agent'}
                        </p>
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full"
                            onClick={() => setSelectedAthlete(athlete)}
                          >
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Player Details</DialogTitle>
                          </DialogHeader>
                          {selectedAthlete && (
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold">{selectedAthlete.firstName} {selectedAthlete.lastName}</h4>
                                <p>Date of Birth: {new Date(selectedAthlete.dateOfBirth).toLocaleDateString()}</p>
                                <p>Gender: {selectedAthlete.gender}</p>
                              </div>
                              
                              <div>
                                <h5 className="font-medium">Performance Stats</h5>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  <p>Matches: {getAthleteStats(selectedAthlete).matches}</p>
                                  <p>Goals: {getAthleteStats(selectedAthlete).goals}</p>
                                  <p>Cards: {getAthleteStats(selectedAthlete).cards}</p>
                                </div>
                              </div>

                              {selectedAthlete.transferRequests?.length > 0 && (
                                <div>
                                  <h5 className="font-medium">Transfer Requests</h5>
                                  {selectedAthlete.transferRequests.map(request => (
                                    <div key={request.id} className="mt-2 p-2 border rounded">
                                      <p className="text-sm">{request.reason}</p>
                                      <p className="text-xs text-gray-500">
                                        {new Date(request.createdAt).toLocaleDateString()} - {request.status}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Scorers</CardTitle>
              </CardHeader>
              <CardContent>
                {teamAthletes
                  .map(athlete => ({
                    ...athlete,
                    goals: athlete.matchEvents?.filter(e => e.type === 'GOAL').length || 0
                  }))
                  .sort((a, b) => b.goals - a.goals)
                  .slice(0, 5)
                  .map(athlete => (
                    <div key={athlete.id} className="flex justify-between items-center py-2 border-b">
                      <span>{athlete.firstName} {athlete.lastName}</span>
                      <Badge>{athlete.goals} goals</Badge>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Most Active Players</CardTitle>
              </CardHeader>
              <CardContent>
                {teamAthletes
                  .map(athlete => ({
                    ...athlete,
                    matches: athlete.matchEvents?.length || 0
                  }))
                  .sort((a, b) => b.matches - a.matches)
                  .slice(0, 5)
                  .map(athlete => (
                    <div key={athlete.id} className="flex justify-between items-center py-2 border-b">
                      <span>{athlete.firstName} {athlete.lastName}</span>
                      <Badge variant="secondary">{athlete.matches} matches</Badge>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          {Array.isArray(notifications) && notifications.map(notification => (
            <Card key={notification.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{notification.title}</h4>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                    <p className="text-xs text-gray-400">{new Date(notification.createdAt).toLocaleString()}</p>
                  </div>
                  <Badge variant={notification.type === 'TRANSFER_REQUEST' ? 'destructive' : 'secondary'}>
                    {notification.type.replace('_', ' ')}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}