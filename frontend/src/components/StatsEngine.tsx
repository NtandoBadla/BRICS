"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Target, Calendar } from 'lucide-react';

interface Match {
  id: string;
  homeTeam: { name: string };
  awayTeam: { name: string };
  homeScore?: number;
  awayScore?: number;
  status: string;
  scheduledAt: string;
}

interface Standing {
  position: number;
  team: { name: string };
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
}

interface TopScorer {
  firstName: string;
  lastName: string;
  team: { name: string };
  goals: number;
}

export default function StatsEngine() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [topScorers, setTopScorers] = useState<TopScorer[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [resultData, setResultData] = useState({
    homeScore: '',
    awayScore: ''
  });

  useEffect(() => {
    fetchMatches();
    fetchTopScorers();
  }, []);

  const fetchMatches = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/matches', {
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

  const fetchTopScorers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/top-scorers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTopScorers(data);
      }
    } catch (error) {
      console.error('Failed to fetch top scorers:', error);
    }
  };

  const handleUpdateResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/matches/result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          matchId: selectedMatch.id,
          homeScore: parseInt(resultData.homeScore),
          awayScore: parseInt(resultData.awayScore)
        })
      });

      if (response.ok) {
        await fetchMatches();
        await fetchTopScorers();
        setIsDialogOpen(false);
        setSelectedMatch(null);
        setResultData({ homeScore: '', awayScore: '' });
      }
    } catch (error) {
      console.error('Failed to update result:', error);
    }
  };

  const openResultDialog = (match: Match) => {
    setSelectedMatch(match);
    setResultData({
      homeScore: match.homeScore?.toString() || '',
      awayScore: match.awayScore?.toString() || ''
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Match Results Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {matches.slice(0, 5).map((match) => (
              <div key={match.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">
                    {match.homeTeam.name} vs {match.awayTeam.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(match.scheduledAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {match.homeScore !== null && match.awayScore !== null ? (
                    <span className="font-bold">
                      {match.homeScore} - {match.awayScore}
                    </span>
                  ) : (
                    <span className="text-gray-500">No result</span>
                  )}
                  <Button size="sm" onClick={() => openResultDialog(match)}>
                    {match.status === 'FULL_TIME' ? 'Edit' : 'Add Result'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="scorers" className="w-full">
        <TabsList>
          <TabsTrigger value="scorers">Top Scorers</TabsTrigger>
          <TabsTrigger value="standings">Standings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="scorers">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Top Scorers Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Goals</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topScorers.map((scorer, index) => (
                    <TableRow key={`${scorer.firstName}-${scorer.lastName}`}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{scorer.firstName} {scorer.lastName}</TableCell>
                      <TableCell>{scorer.team.name}</TableCell>
                      <TableCell className="font-bold">{scorer.goals}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="standings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                League Standings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pos</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>P</TableHead>
                    <TableHead>W</TableHead>
                    <TableHead>D</TableHead>
                    <TableHead>L</TableHead>
                    <TableHead>GF</TableHead>
                    <TableHead>GA</TableHead>
                    <TableHead>GD</TableHead>
                    <TableHead>Pts</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {standings.map((standing) => (
                    <TableRow key={standing.team.name}>
                      <TableCell>{standing.position}</TableCell>
                      <TableCell className="font-medium">{standing.team.name}</TableCell>
                      <TableCell>{standing.played}</TableCell>
                      <TableCell>{standing.won}</TableCell>
                      <TableCell>{standing.drawn}</TableCell>
                      <TableCell>{standing.lost}</TableCell>
                      <TableCell>{standing.goalsFor}</TableCell>
                      <TableCell>{standing.goalsAgainst}</TableCell>
                      <TableCell>{standing.goalDiff}</TableCell>
                      <TableCell className="font-bold">{standing.points}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Match Result</DialogTitle>
          </DialogHeader>
          {selectedMatch && (
            <form onSubmit={handleUpdateResult} className="space-y-4">
              <div className="text-center">
                <p className="font-medium">
                  {selectedMatch.homeTeam.name} vs {selectedMatch.awayTeam.name}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="homeScore">{selectedMatch.homeTeam.name}</Label>
                  <Input
                    id="homeScore"
                    type="number"
                    min="0"
                    value={resultData.homeScore}
                    onChange={(e) => setResultData({ ...resultData, homeScore: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="awayScore">{selectedMatch.awayTeam.name}</Label>
                  <Input
                    id="awayScore"
                    type="number"
                    min="0"
                    value={resultData.awayScore}
                    onChange={(e) => setResultData({ ...resultData, awayScore: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Result</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}