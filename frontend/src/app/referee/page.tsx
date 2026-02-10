"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Calendar, FileText, User, Check, X, Plus, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function RefereeDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState([]);
  const [reports, setReports] = useState([]);
  const [refereeProfile, setRefereeProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReportForm, setShowReportForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Get referee profile
      const refereesRes = await fetch(`${API_URL}/api/referees`, { headers });
      const refereesData = await refereesRes.json();
      const myProfile = refereesData.find(r => r.user.email === user?.email);
      
      if (myProfile) {
        setRefereeProfile(myProfile);

        // Get assignments
        const assignmentsRes = await fetch(`${API_URL}/api/referees/${myProfile.id}/assignments`, { headers });
        if (assignmentsRes.ok) {
          const assignmentsData = await assignmentsRes.json();
          setAssignments(assignmentsData);
        }

        // Get reports
        const reportsRes = await fetch(`${API_URL}/api/referees/reports?refereeId=${myProfile.id}`, { headers });
        if (reportsRes.ok) {
          const reportsData = await reportsRes.json();
          console.log('Referee reports:', reportsData);
          setReports(reportsData);
        }
      }

      // Get all matches
      const matchesRes = await fetch(`${API_URL}/api/matches`, { headers });
      if (matchesRes.ok) {
        const matchesData = await matchesRes.json();
        setMatches(Array.isArray(matchesData) ? matchesData : []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptAssignment = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/referees/assignments/${id}/accept`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast({ title: "Success", description: "Assignment accepted" });
        fetchData();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to accept assignment", variant: "destructive" });
    }
  };

  const handleDeclineAssignment = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/referees/assignments/${id}/decline`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast({ title: "Success", description: "Assignment declined" });
        fetchData();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to decline assignment", variant: "destructive" });
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/referees/reports`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          matchId: formData.get('matchId'),
          refereeId: refereeProfile.id,
          playerName: formData.get('playerName') || null,
          incident: formData.get('incident'),
          action: formData.get('action'),
          minute: formData.get('minute'),
          description: formData.get('description')
        })
      });

      if (response.ok) {
        toast({ title: "Success", description: "Report submitted successfully" });
        setShowReportForm(false);
        fetchData();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit report", variant: "destructive" });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/referees/profile/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: formData.get('currentPassword'),
          newPassword: formData.get('newPassword')
        })
      });

      if (response.ok) {
        toast({ title: "Success", description: "Password changed successfully" });
        setShowPasswordForm(false);
        e.target.reset();
      } else {
        const error = await response.json();
        toast({ title: "Error", description: error.error, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to change password", variant: "destructive" });
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Referee Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.firstName} {user?.lastName}</span>
            <Button onClick={logout} variant="outline">Logout</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Assigned Matches</CardTitle>
              <Calendar className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignments.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Reports Filed</CardTitle>
              <FileText className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reports.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Certification</CardTitle>
              <Shield className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">{refereeProfile?.certification}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="assignments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="assignments">Assigned Matches</TabsTrigger>
            <TabsTrigger value="reports">My Reports</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="assignments">
            <Card>
              <CardHeader>
                <CardTitle>Match Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                {assignments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No assignments yet</p>
                ) : (
                  <div className="space-y-4">
                    {assignments.map((assignment) => (
                      <div key={assignment.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">{assignment.match?.homeTeam?.name} vs {assignment.match?.awayTeam?.name}</h3>
                            <p className="text-sm text-gray-600">{assignment.role}</p>
                            <p className="text-sm text-gray-500">{new Date(assignment.match?.scheduledAt).toLocaleString()}</p>
                          </div>
                          <Badge variant={assignment.status === 'ACCEPTED' ? 'default' : assignment.status === 'DECLINED' ? 'destructive' : 'secondary'}>
                            {assignment.status}
                          </Badge>
                        </div>
                        {assignment.status === 'PENDING' && (
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" onClick={() => handleAcceptAssignment(assignment.id)}>
                              <Check className="h-4 w-4 mr-1" /> Accept
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeclineAssignment(assignment.id)}>
                              <X className="h-4 w-4 mr-1" /> Decline
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Disciplinary Reports</CardTitle>
                <Button onClick={() => setShowReportForm(!showReportForm)}>
                  <Plus className="h-4 w-4 mr-2" /> Submit Report
                </Button>
              </CardHeader>
              <CardContent>
                {showReportForm && (
                  <form onSubmit={handleSubmitReport} className="mb-6 p-4 border rounded-lg space-y-4">
                    <div>
                      <Label>Match</Label>
                      <Select name="matchId" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select match" />
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
                      <Label>Player Name</Label>
                      <Input name="playerName" placeholder="Enter player name" />
                    </div>
                    <div>
                      <Label>Incident</Label>
                      <Input name="incident" required placeholder="Brief incident description" />
                    </div>
                    <div>
                      <Label>Action</Label>
                      <Select name="action" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select action" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="YELLOW_CARD">Yellow Card</SelectItem>
                          <SelectItem value="RED_CARD">Red Card</SelectItem>
                          <SelectItem value="SUSPENSION">Suspension</SelectItem>
                          <SelectItem value="FINE">Fine</SelectItem>
                          <SelectItem value="WARNING">Warning</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Minute</Label>
                      <Input name="minute" type="number" placeholder="Match minute" />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea name="description" required placeholder="Detailed description" />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">Submit Report</Button>
                      <Button type="button" variant="outline" onClick={() => setShowReportForm(false)}>Cancel</Button>
                    </div>
                  </form>
                )}

                {reports.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No reports filed yet</p>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <div key={report.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{report.incident}</h3>
                            <p className="text-sm text-gray-600">{report.action} - Minute {report.minute}</p>
                            <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                          </div>
                          <Badge>{report.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <p className="text-sm">{refereeProfile?.user?.firstName} {refereeProfile?.user?.lastName}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-sm">{refereeProfile?.user?.email}</p>
                </div>
                <div>
                  <Label>License Number</Label>
                  <p className="text-sm">{refereeProfile?.licenseNumber}</p>
                </div>
                <div>
                  <Label>Certification</Label>
                  <p className="text-sm">{refereeProfile?.certification}</p>
                </div>
                <div>
                  <Label>Experience</Label>
                  <p className="text-sm">{refereeProfile?.experience} years</p>
                </div>

                <div className="pt-4 border-t">
                  <Button onClick={() => setShowPasswordForm(!showPasswordForm)} variant="outline">
                    Change Password
                  </Button>
                  
                  {showPasswordForm && (
                    <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
                      <div>
                        <Label>Current Password</Label>
                        <Input name="currentPassword" type="password" required />
                      </div>
                      <div>
                        <Label>New Password</Label>
                        <Input name="newPassword" type="password" required />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit">Update Password</Button>
                        <Button type="button" variant="outline" onClick={() => setShowPasswordForm(false)}>Cancel</Button>
                      </div>
                    </form>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
