'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, User, Trophy, MessageSquare, ArrowRightLeft } from 'lucide-react';

export default function PlayerDashboard() {
  const [athlete, setAthlete] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [transferReason, setTransferReason] = useState('');
  const [agentMessage, setAgentMessage] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    fetchAthleteProfile();
    fetchNotifications();
    fetchAgents();
  }, []);

  const fetchAthleteProfile = async () => {
    try {
      const response = await fetch('/api/dashboard/athlete/profile', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (response.ok) {
        setAthlete(data);
      } else {
        // Mock athlete data if API fails
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setAthlete({
          id: 'mock-1',
          firstName: user.firstName || 'Mike',
          lastName: user.lastName || 'Player',
          dateOfBirth: '1995-01-01',
          team: { name: 'Mock Team' },
          agent: null,
          matchEvents: [],
          transferRequests: [],
          agentRequests: []
        });
      }
    } catch (error) {
      console.error('Error fetching athlete profile:', error);
      // Mock athlete data on error
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setAthlete({
        id: 'mock-1',
        firstName: user.firstName || 'Mike',
        lastName: user.lastName || 'Player',
        dateOfBirth: '1995-01-01',
        team: { name: 'Mock Team' },
        agent: null,
        matchEvents: [],
        transferRequests: [],
        agentRequests: []
      });
    }
  };

  const fetchNotifications = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
      const response = await fetch(`/api/dashboard/notifications/${userId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setAgents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      setAgents([]);
    }
  };

  const handleTransferRequest = async () => {
    try {
      await fetch('/api/dashboard/athlete/transfer-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          athleteId: athlete.id,
          reason: transferReason
        })
      });
      alert('Transfer request submitted successfully');
      setTransferReason('');
    } catch (error) {
      console.error('Error submitting transfer request:', error);
    }
  };

  const handleAgentRequest = async () => {
    try {
      await fetch('/api/dashboard/athlete/agent-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          athleteId: athlete.id,
          newAgentId: selectedAgent,
          message: agentMessage
        })
      });
      alert('Agent request submitted successfully');
      setAgentMessage('');
      setSelectedAgent('');
    } catch (error) {
      console.error('Error submitting agent request:', error);
    }
  };

  const respondToAgentOffer = async (requestId, response) => {
    try {
      await fetch('/api/dashboard/athlete/agent-response', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ requestId, response })
      });
      fetchAthleteProfile();
      fetchNotifications();
    } catch (error) {
      console.error('Error responding to agent offer:', error);
    }
  };

  if (!athlete) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Player Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <Badge variant="secondary">{Array.isArray(notifications) ? notifications.filter(n => !n.isRead).length : 0}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Profile</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Name:</strong> {athlete.firstName} {athlete.lastName}</p>
              <p><strong>Team:</strong> {athlete.team?.name}</p>
              <p><strong>Agent:</strong> {athlete.agent ? `${athlete.agent.firstName} ${athlete.agent.lastName}` : 'No agent'}</p>
              <p><strong>Date of Birth:</strong> {new Date(athlete.dateOfBirth).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5" />
              <span>Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Matches:</strong> {athlete.matchEvents?.length || 0}</p>
              <p><strong>Goals:</strong> {athlete.matchEvents?.filter(e => e.type === 'GOAL').length || 0}</p>
              <p><strong>Cards:</strong> {athlete.matchEvents?.filter(e => e.type.includes('CARD')).length || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Requests</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Transfer Requests:</strong> {athlete.transferRequests?.length || 0}</p>
              <p><strong>Agent Requests:</strong> {athlete.agentRequests?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="actions" className="w-full">
        <TabsList>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="actions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Request Transfer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Reason for transfer request..."
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                />
                <Button onClick={handleTransferRequest} className="w-full">
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  Submit Transfer Request
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Change Agent</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Agent</SelectItem>
                    {Array.isArray(agents) && agents.map(agent => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.firstName} {agent.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Message to agent..."
                  value={agentMessage}
                  onChange={(e) => setAgentMessage(e.target.value)}
                />
                <Button onClick={handleAgentRequest} className="w-full">
                  Request Agent Change
                </Button>
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
                  {notification.type === 'AGENT_OFFER' && (
                    <div className="space-x-2">
                      <Button size="sm" onClick={() => respondToAgentOffer(notification.id, 'ACCEPTED')}>
                        Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => respondToAgentOffer(notification.id, 'DECLINED')}>
                        Decline
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transfer History</CardTitle>
            </CardHeader>
            <CardContent>
              {athlete.transferRequests?.map(request => (
                <div key={request.id} className="flex justify-between items-center p-2 border-b">
                  <div>
                    <p className="font-medium">{request.reason}</p>
                    <p className="text-sm text-gray-600">{new Date(request.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Badge variant={request.status === 'PENDING' ? 'secondary' : request.status === 'APPROVED' ? 'default' : 'destructive'}>
                    {request.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}