"use client";

import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, FileText, Users, UserCheck, AlertCircle, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function SecretariatPage() {
  const { user, logout } = useAuth();
  const [matches, setMatches] = useState<any[]>([]);
  const [referees, setReferees] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedReferee, setSelectedReferee] = useState('');
  const [showMatchForm, setShowMatchForm] = useState(false);
  const [showCompetitionForm, setShowCompetitionForm] = useState(false);
  const [formData, setFormData] = useState({ competitionId: '', homeTeamId: '', awayTeamId: '', format: '' });

  useEffect(() => {
    fetchMatches();
    fetchReferees();
    fetchReports();
    fetchCompetitions();
    fetchTeams();
  }, []);

  const fetchMatches = async () => {
    try {
      const res = await fetch(`${API_URL}/api/matches`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setMatches(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching matches:', error);
      setMatches([]);
    }
  };

  const fetchReferees = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching referees with token:', token ? 'exists' : 'missing');
      
      const res = await fetch(`${API_URL}/api/referees`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Referees response status:', res.status);
      const data = await res.json();
      console.log('Referees data:', data);
      
      setReferees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching referees:', error);
      setReferees([]);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await fetch(`${API_URL}/api/referees/reports?status=SUBMITTED`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports([]);
    }
  };

  const fetchCompetitions = async () => {
    try {
      const res = await fetch(`${API_URL}/api/competitions`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setCompetitions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching competitions:', error);
      setCompetitions([]);
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await fetch(`${API_URL}/api/teams`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setTeams(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching teams:', error);
      setTeams([]);
    }
  };

  const handleAssignReferee = async () => {
    if (!selectedMatch || !selectedReferee) return;
    try {
      const res = await fetch(`${API_URL}/api/matches/assign-referee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ matchId: selectedMatch, refereeId: selectedReferee, role: 'MAIN_REFEREE' })
      });
      if (res.ok) {
        alert('Referee assigned successfully');
        setSelectedMatch(null);
        setSelectedReferee('');
        fetchMatches();
      }
    } catch (error) {
      console.error('Error assigning referee:', error);
    }
  };

  const handleCreateCompetition = async (e: any) => {
    e.preventDefault();
    const form = new FormData(e.target);
    
    if (!formData.format) {
      alert('Please select a format');
      return;
    }
    
    try {
      const payload = {
        name: form.get('name'),
        description: form.get('description'),
        startDate: form.get('startDate'),
        endDate: form.get('endDate'),
        location: form.get('location'),
        format: formData.format
      };
      
      console.log('Creating competition:', payload);
      
      const res = await fetch(`${API_URL}/api/competitions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      console.log('Response:', data);
      
      if (res.ok) {
        alert('Competition created successfully');
        setShowCompetitionForm(false);
        fetchCompetitions();
        e.target.reset();
        setFormData({ ...formData, format: '' });
      } else {
        alert('Error: ' + (data.error || 'Failed to create competition'));
      }
    } catch (error) {
      console.error('Error creating competition:', error);
      alert('Failed to create competition: ' + error);
    }
  };

  const handleCreateMatch = async (e: any) => {
    e.preventDefault();
    const form = new FormData(e.target);
    try {
      const res = await fetch(`${API_URL}/api/matches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          competitionId: formData.competitionId,
          homeTeamId: formData.homeTeamId,
          awayTeamId: formData.awayTeamId,
          venue: form.get('venue'),
          scheduledDate: form.get('scheduledDate')
        })
      });
      if (res.ok) {
        alert('Match created successfully');
        setShowMatchForm(false);
        fetchMatches();
        e.target.reset();
        setFormData({ ...formData, competitionId: '', homeTeamId: '', awayTeamId: '' });
      } else {
        const error = await res.json();
        alert('Error: ' + error.error);
      }
    } catch (error) {
      console.error('Error creating match:', error);
      alert('Failed to create match');
    }
  };

  return (
    <ProtectedRoute allowedRoles={['SECRETARIAT', 'ADMIN']}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Secretariat Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user?.firstName} {user?.lastName} ({user?.role})
              </span>
              <Button onClick={logout} variant="outline">Logout</Button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="competitions">Competitions</TabsTrigger>
              <TabsTrigger value="matches">Matches</TabsTrigger>
              <TabsTrigger value="referees">Referees</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Matches</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{matches.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Referees</CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{referees.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{reports.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Competitions</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{competitions.length}</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="competitions">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Competitions</CardTitle>
                  <Button onClick={() => setShowCompetitionForm(!showCompetitionForm)}>
                    <Plus className="h-4 w-4 mr-2" /> Create Competition
                  </Button>
                </CardHeader>
                <CardContent>
                  {showCompetitionForm && (
                    <form onSubmit={handleCreateCompetition} className="mb-6 p-4 border rounded-lg space-y-4">
                      <div>
                        <Label>Name</Label>
                        <Input name="name" required />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Input name="description" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Start Date</Label>
                          <Input name="startDate" type="datetime-local" required />
                        </div>
                        <div>
                          <Label>End Date</Label>
                          <Input name="endDate" type="datetime-local" required />
                        </div>
                      </div>
                      <div>
                        <Label>Location</Label>
                        <Input name="location" required />
                      </div>
                      <div>
                        <Label>Format</Label>
                        <Select value={formData.format} onValueChange={(val) => setFormData({...formData, format: val})} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LEAGUE">League</SelectItem>
                            <SelectItem value="KNOCKOUT">Knockout</SelectItem>
                            <SelectItem value="GROUP_STAGE">Group Stage</SelectItem>
                            <SelectItem value="ROUND_ROBIN">Round Robin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit">Create</Button>
                        <Button type="button" variant="outline" onClick={() => setShowCompetitionForm(false)}>Cancel</Button>
                      </div>
                    </form>
                  )}
                  <div className="space-y-3">
                    {competitions.map((comp) => (
                      <div key={comp.id} className="border rounded-lg p-4">
                        <h3 className="font-semibold">{comp.name}</h3>
                        <p className="text-sm text-gray-600">{comp.location} - {comp.format}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="matches">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Matches</CardTitle>
                  <Button onClick={() => setShowMatchForm(!showMatchForm)}>
                    <Plus className="h-4 w-4 mr-2" /> Schedule Match
                  </Button>
                </CardHeader>
                <CardContent>
                  {showMatchForm && (
                    <form onSubmit={handleCreateMatch} className="mb-6 p-4 border rounded-lg space-y-4">
                      <div>
                        <Label>Competition</Label>
                        <Select value={formData.competitionId} onValueChange={(val) => setFormData({...formData, competitionId: val})} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select competition" />
                          </SelectTrigger>
                          <SelectContent>
                            {competitions.map((comp) => (
                              <SelectItem key={comp.id} value={comp.id}>{comp.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Home Team</Label>
                          <Select value={formData.homeTeamId} onValueChange={(val) => setFormData({...formData, homeTeamId: val})} required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select team" />
                            </SelectTrigger>
                            <SelectContent>
                              {teams.map((team) => (
                                <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Away Team</Label>
                          <Select value={formData.awayTeamId} onValueChange={(val) => setFormData({...formData, awayTeamId: val})} required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select team" />
                            </SelectTrigger>
                            <SelectContent>
                              {teams.map((team) => (
                                <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label>Venue</Label>
                        <Input name="venue" required />
                      </div>
                      <div>
                        <Label>Scheduled Date</Label>
                        <Input name="scheduledDate" type="datetime-local" required />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit">Create Match</Button>
                        <Button type="button" variant="outline" onClick={() => setShowMatchForm(false)}>Cancel</Button>
                      </div>
                    </form>
                  )}
                  <div className="space-y-3">
                    {matches.map((match) => (
                      <div key={match.id} className="border rounded-lg p-4">
                        <h3 className="font-semibold">{match.homeTeam?.name} vs {match.awayTeam?.name}</h3>
                        <p className="text-sm text-gray-600">{match.venue} - {new Date(match.scheduledAt).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="referees">
              <Card>
                <CardHeader>
                  <CardTitle>Assign Referee to Match</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Select Match</Label>
                    <Select value={selectedMatch || ''} onValueChange={setSelectedMatch}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a match" />
                      </SelectTrigger>
                      <SelectContent>
                        {matches?.map((match) => (
                          <SelectItem key={match.id} value={match.id}>
                            {match.homeTeam?.name} vs {match.awayTeam?.name} - {new Date(match.scheduledAt).toLocaleDateString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Select Referee</Label>
                    <Select value={selectedReferee} onValueChange={setSelectedReferee}>
                      <SelectTrigger>
                        <SelectValue placeholder={referees.length === 0 ? "No referees available" : "Choose a referee"} />
                      </SelectTrigger>
                      <SelectContent>
                        {referees.length === 0 ? (
                          <div className="p-2 text-sm text-gray-500">No referees registered</div>
                        ) : (
                          referees.map((referee) => (
                            <SelectItem key={referee.id} value={referee.id}>
                              {referee.user?.firstName} {referee.user?.lastName} - {referee.certification}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAssignReferee} disabled={!selectedMatch || !selectedReferee} className="w-full">
                    Assign Referee
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>Submitted Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {reports.length === 0 ? (
                      <p className="text-gray-500 text-sm">No pending reports</p>
                    ) : (
                      reports.map((report) => (
                        <div key={report.id} className="border rounded-lg p-3 bg-white">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold text-sm">{report.match?.homeTeam?.name} vs {report.match?.awayTeam?.name}</p>
                              <p className="text-xs text-gray-500">Referee: {report.referee?.user?.firstName} {report.referee?.user?.lastName}</p>
                            </div>
                            <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">{report.status}</span>
                          </div>
                          <div className="text-sm space-y-1">
                            <p><strong>Incident:</strong> {report.incident}</p>
                            <p><strong>Action:</strong> {report.action}</p>
                            {report.player && <p><strong>Player:</strong> {report.player.firstName} {report.player.lastName}</p>}
                            {report.minute && <p><strong>Minute:</strong> {report.minute}'</p>}
                            <p className="text-gray-600">{report.description}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  );
}
