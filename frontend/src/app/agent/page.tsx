'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Users, Send, Eye } from 'lucide-react';

export default function AgentDashboard() {
  const [myAthletes, setMyAthletes] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAthlete, setSelectedAthlete] = useState<any>(null);
  const [offerMessage, setOfferMessage] = useState('');
  const [agentRequests, setAgentRequests] = useState<any[]>([]);

  useEffect(() => {
    fetchMyAthletes();
    fetchAgentRequests();
  }, []);

  const fetchMyAthletes = async () => {
    try {
      const response = await fetch('/api/dashboard/agent/athletes', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setMyAthletes(data);
    } catch (error) {
      console.error('Error fetching my athletes:', error);
    }
  };

  const fetchAgentRequests = async () => {
    try {
      const response = await fetch('/api/dashboard/agent/requests', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setAgentRequests(data);
    } catch (error) {
      console.error('Error fetching agent requests:', error);
    }
  };

  const searchAthletes = async () => {
    try {
      const response = await fetch(`/api/dashboard/agent/search-athletes?search=${searchTerm}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching athletes:', error);
    }
  };

  const sendAgentRequest = async () => {
    try {
      await fetch('/api/dashboard/agent/send-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          athleteId: selectedAthlete.id,
          message: offerMessage
        })
      });
      alert('Agent request sent successfully');
      setOfferMessage('');
      setSelectedAthlete(null);
    } catch (error) {
      console.error('Error sending agent request:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Agent Dashboard</h1>
        <Badge variant="secondary">{myAthletes.length} Athletes Represented</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>My Athletes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{myAthletes.length}</p>
            <p className="text-sm text-gray-600">Currently representing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="h-5 w-5" />
              <span>Pending Requests</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{agentRequests.filter((r: any) => r.status === 'PENDING').length}</p>
            <p className="text-sm text-gray-600">Awaiting response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Success Rate</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {agentRequests.length > 0 ? Math.round((agentRequests.filter((r: any) => r.status === 'ACCEPTED').length / agentRequests.length) * 100) : 0}%
            </p>
            <p className="text-sm text-gray-600">Acceptance rate</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="search" className="w-full">
        <TabsList>
          <TabsTrigger value="search">Search Athletes</TabsTrigger>
          <TabsTrigger value="myathletes">My Athletes</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search for Athletes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button onClick={searchAthletes}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((athlete: any) => (
                  <Card key={athlete.id}>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold">{athlete.firstName} {athlete.lastName}</h4>
                        <p className="text-sm text-gray-600">Team: {athlete.team?.name}</p>
                        <p className="text-sm text-gray-600">
                          Agent: {athlete.agent ? `${athlete.agent.firstName} ${athlete.agent.lastName}` : 'No agent'}
                        </p>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              className="w-full"
                              onClick={() => setSelectedAthlete(athlete)}
                              disabled={!!athlete.agent}
                            >
                              {athlete.agent ? 'Has Agent' : 'Send Offer'}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Send Agent Offer</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <p><strong>Athlete:</strong> {selectedAthlete?.firstName} {selectedAthlete?.lastName}</p>
                                <p><strong>Team:</strong> {selectedAthlete?.team?.name}</p>
                              </div>
                              <Textarea
                                placeholder="Your message to the athlete..."
                                value={offerMessage}
                                onChange={(e) => setOfferMessage(e.target.value)}
                              />
                              <Button onClick={sendAgentRequest} className="w-full">
                                Send Offer
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="myathletes" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myAthletes.map((athlete: any) => (
              <Card key={athlete.id}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">{athlete.firstName} {athlete.lastName}</h4>
                    <p className="text-sm text-gray-600">Team: {athlete.team?.name}</p>
                    <p className="text-sm text-gray-600">Age: {new Date().getFullYear() - new Date(athlete.dateOfBirth).getFullYear()}</p>
                    <div className="flex justify-between text-sm">
                      <span>Matches: {athlete.matchEvents?.length || 0}</span>
                      <span>Goals: {athlete.matchEvents?.filter((e: any) => e.type === 'GOAL').length || 0}</span>
                    </div>
                    <Button size="sm" variant="outline" className="w-full">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          {agentRequests.map((request: any) => (
            <Card key={request.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{request.athlete?.firstName} {request.athlete?.lastName}</h4>
                    <p className="text-sm text-gray-600">Team: {request.athlete?.team?.name}</p>
                    <p className="text-sm text-gray-600">Message: {request.message}</p>
                    <p className="text-xs text-gray-400">{new Date(request.createdAt).toLocaleString()}</p>
                  </div>
                  <Badge variant={
                    request.status === 'PENDING' ? 'secondary' : 
                    request.status === 'ACCEPTED' ? 'default' : 'destructive'
                  }>
                    {request.status}
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