"use client";

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Plus, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Match {
  id: string;
  homeTeam: { name: string };
  awayTeam: { name: string };
  scheduledDate: string;
  competition: { name: string };
  status: string;
}

interface MatchReport {
  id: string;
  match: Match;
  homeScore: number;
  awayScore: number;
  incidents: string[];
  notes: string;
  yellowCards: string[];
  redCards: string[];
  status: string;
  createdAt: string;
}

export default function RefereeReportsPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [reports, setReports] = useState<MatchReport[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    homeScore: '',
    awayScore: '',
    incidents: '',
    notes: '',
    yellowCards: '',
    redCards: ''
  });

  useEffect(() => {
    fetchMatches();
    fetchReports();
  }, []);

  const fetchMatches = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/matches?status=FINISHED', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMatches(data);
      }
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    }
  };

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/match-reports', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/match-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          matchId: selectedMatch.id,
          homeScore: parseInt(formData.homeScore),
          awayScore: parseInt(formData.awayScore),
          incidents: formData.incidents.split('\n').filter(i => i.trim()),
          notes: formData.notes,
          yellowCards: formData.yellowCards.split(',').map(c => c.trim()).filter(c => c),
          redCards: formData.redCards.split(',').map(c => c.trim()).filter(c => c)
        })
      });

      if (response.ok) {
        await fetchReports();
        setIsDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to submit report:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      homeScore: '',
      awayScore: '',
      incidents: '',
      notes: '',
      yellowCards: '',
      redCards: ''
    });
    setSelectedMatch(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return 'bg-blue-100 text-blue-800';
      case 'REVIEWED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ProtectedRoute allowedRoles={['REFEREE']}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Match Reports</h1>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8 flex-1">
          <div className="mb-6">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  File New Report
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>File Match Report</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitReport} className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium">Select Match *</Label>
                    <Select onValueChange={(value) => {
                      const match = matches.find(m => m.id === value);
                      setSelectedMatch(match || null);
                    }}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Choose a match to report on" />
                      </SelectTrigger>
                      <SelectContent>
                        {matches.map((match) => (
                          <SelectItem key={match.id} value={match.id}>
                            {match.homeTeam.name} vs {match.awayTeam.name} - {new Date(match.scheduledDate).toLocaleDateString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedMatch && (
                    <div className="space-y-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-2">Match Details</h3>
                        <p className="text-sm text-gray-600">
                          {selectedMatch.homeTeam.name} vs {selectedMatch.awayTeam.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedMatch.competition.name} - {new Date(selectedMatch.scheduledDate).toLocaleDateString()}
                        </p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-3 block">Final Score *</Label>
                        <div className="flex items-center justify-center gap-4">
                          <div className="text-center">
                            <Label htmlFor="homeScore" className="block text-sm mb-2">
                              {selectedMatch.homeTeam.name}
                            </Label>
                            <Input
                              id="homeScore"
                              type="number"
                              min="0"
                              max="20"
                              className="w-16 h-12 text-center text-xl font-bold"
                              value={formData.homeScore}
                              onChange={(e) => setFormData({ ...formData, homeScore: e.target.value })}
                              required
                            />
                          </div>
                          <div className="text-2xl font-bold text-gray-400 mt-6">-</div>
                          <div className="text-center">
                            <Label htmlFor="awayScore" className="block text-sm mb-2">
                              {selectedMatch.awayTeam.name}
                            </Label>
                            <Input
                              id="awayScore"
                              type="number"
                              min="0"
                              max="20"
                              className="w-16 h-12 text-center text-xl font-bold"
                              value={formData.awayScore}
                              onChange={(e) => setFormData({ ...formData, awayScore: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="incidents" className="text-sm font-medium text-gray-700">Match Incidents</Label>
                        <Textarea
                          id="incidents"
                          className="mt-1"
                          placeholder="15' - Yellow card for dangerous play&#10;45' - Goal scored by Player Name&#10;67' - Substitution made"
                          value={formData.incidents}
                          onChange={(e) => setFormData({ ...formData, incidents: e.target.value })}
                          rows={4}
                        />
                        <p className="text-xs text-gray-500 mt-1">Enter each incident on a new line</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="yellowCards" className="text-sm font-medium text-gray-700">Yellow Cards</Label>
                          <Input
                            id="yellowCards"
                            className="mt-1"
                            placeholder="Player Name 1, Player Name 2"
                            value={formData.yellowCards}
                            onChange={(e) => setFormData({ ...formData, yellowCards: e.target.value })}
                          />
                          <p className="text-xs text-gray-500 mt-1">Separate multiple names with commas</p>
                        </div>
                        <div>
                          <Label htmlFor="redCards" className="text-sm font-medium text-gray-700">Red Cards</Label>
                          <Input
                            id="redCards"
                            className="mt-1"
                            placeholder="Player Name 1, Player Name 2"
                            value={formData.redCards}
                            onChange={(e) => setFormData({ ...formData, redCards: e.target.value })}
                          />
                          <p className="text-xs text-gray-500 mt-1">Separate multiple names with commas</p>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="notes" className="text-sm font-medium text-gray-700">Additional Notes</Label>
                        <Textarea
                          id="notes"
                          className="mt-1"
                          placeholder="Any additional observations, disciplinary actions, or comments about the match..."
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          rows={3}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={!selectedMatch} className="bg-blue-600 hover:bg-blue-700">
                      Submit Report
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                My Match Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading reports...</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Match</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {report.match.homeTeam.name} vs {report.match.awayTeam.name}
                              </p>
                              <p className="text-sm text-gray-500">{report.match.competition.name}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              {new Date(report.match.scheduledDate).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-lg">
                              {report.homeScore} - {report.awayScore}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(report.status)}>
                              {report.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(report.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                      {reports.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p>No reports filed yet.</p>
                            <p className="text-sm">Click "File New Report" to get started.</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}