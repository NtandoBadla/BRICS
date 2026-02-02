"use client";

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api, getErrorMessage } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Edit, Trophy, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Match {
  id: string;
  homeTeam: { name: string };
  awayTeam: { name: string };
  homeScore?: number;
  awayScore?: number;
  status: string;
  scheduledDate: string;
  venue?: string;
  competition: { name: string };
}

const MATCH_STATUSES = ['SCHEDULED', 'LIVE', 'FINISHED', 'POSTPONED', 'CANCELLED'];

export default function MatchResultManagementPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    homeScore: '',
    awayScore: '',
    status: ''
  });

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const data = await api.getMatches();
      setMatches(data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEditMatch = (match: Match) => {
    setEditingMatch(match);
    setFormData({
      homeScore: match.homeScore?.toString() || '',
      awayScore: match.awayScore?.toString() || '',
      status: match.status
    });
    setIsDialogOpen(true);
  };

  const handleUpdateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMatch) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/matches/${editingMatch.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          homeScore: formData.homeScore ? parseInt(formData.homeScore) : null,
          awayScore: formData.awayScore ? parseInt(formData.awayScore) : null,
          status: formData.status
        })
      });

      if (response.ok) {
        await fetchMatches();
        setIsDialogOpen(false);
        setEditingMatch(null);
      }
    } catch (err) {
      alert('Failed to update match: ' + getErrorMessage(err));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
      case 'LIVE': return 'bg-green-100 text-green-800';
      case 'FINISHED': return 'bg-gray-100 text-gray-800';
      case 'POSTPONED': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'SECRETARIAT']}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Match Result Management</h1>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8 flex-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Match Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-4">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="text-center py-8">Loading matches...</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Match</TableHead>
                        <TableHead>Competition</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {matches.map((match) => (
                        <TableRow key={match.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {match.homeTeam?.name || 'TBD'} vs {match.awayTeam?.name || 'TBD'}
                              </p>
                              {match.venue && (
                                <p className="text-sm text-gray-500">{match.venue}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{match.competition?.name || 'N/A'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              {new Date(match.scheduledDate).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            {match.homeScore !== null && match.awayScore !== null ? (
                              <span className="font-mono">
                                {match.homeScore} - {match.awayScore}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(match.status)}`}>
                              {match.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditMatch(match)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {matches.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            No matches found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit Match Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold">Update Match Result</DialogTitle>
              </DialogHeader>
              {editingMatch && (
                <form onSubmit={handleUpdateMatch} className="space-y-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-bold text-gray-900">
                      {editingMatch.homeTeam?.name || 'Home Team'}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">vs</p>
                    <h3 className="text-lg font-bold text-gray-900">
                      {editingMatch.awayTeam?.name || 'Away Team'}
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="text-center">
                      <Label className="text-base font-medium text-gray-700">Final Score</Label>
                    </div>
                    
                    <div className="flex items-center justify-center gap-4">
                      <div className="text-center">
                        <Label htmlFor="homeScore" className="block text-sm font-medium mb-2">
                          {editingMatch.homeTeam?.name || 'Home'}
                        </Label>
                        <Input
                          id="homeScore"
                          type="number"
                          min="0"
                          max="20"
                          placeholder="0"
                          className="w-16 h-12 text-center text-xl font-bold"
                          value={formData.homeScore}
                          onChange={(e) => setFormData({ ...formData, homeScore: e.target.value })}
                        />
                      </div>
                      
                      <div className="text-2xl font-bold text-gray-400 mt-6">-</div>
                      
                      <div className="text-center">
                        <Label htmlFor="awayScore" className="block text-sm font-medium mb-2">
                          {editingMatch.awayTeam?.name || 'Away'}
                        </Label>
                        <Input
                          id="awayScore"
                          type="number"
                          min="0"
                          max="20"
                          placeholder="0"
                          className="w-16 h-12 text-center text-xl font-bold"
                          value={formData.awayScore}
                          onChange={(e) => setFormData({ ...formData, awayScore: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="status" className="block text-sm font-medium mb-2">Match Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {MATCH_STATUSES.map(status => (
                          <SelectItem key={status} value={status}>
                            <span className="capitalize">{status.toLowerCase().replace('_', ' ')}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      Update Match
                    </Button>
                  </div>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </ProtectedRoute>
  );
}