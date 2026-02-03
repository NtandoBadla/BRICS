"use client";

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, FileText, Eye, Calendar, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MatchReport {
  id: string;
  match: {
    homeTeam: { name: string };
    awayTeam: { name: string };
    scheduledDate: string;
    competition: { name: string };
  };
  referee: {
    firstName: string;
    lastName: string;
    email: string;
  };
  homeScore: number;
  awayScore: number;
  incidents: string[];
  notes: string;
  yellowCards: string[];
  redCards: string[];
  status: string;
  createdAt: string;
}

export default function AdminMatchReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<MatchReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<MatchReport | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchReports();
  }, []);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return 'bg-blue-100 text-blue-800';
      case 'REVIEWED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true;
    return report.status === filter.toUpperCase();
  });

  const handleViewReport = (report: MatchReport) => {
    setSelectedReport(report);
    setIsDialogOpen(true);
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
            <h1 className="text-2xl font-bold text-gray-900">Match Reports Management</h1>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8 flex-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                All Match Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={filter} onValueChange={setFilter} className="mb-6">
                <TabsList>
                  <TabsTrigger value="all">All Reports ({reports.length})</TabsTrigger>
                  <TabsTrigger value="submitted">
                    Submitted ({reports.filter(r => r.status === 'SUBMITTED').length})
                  </TabsTrigger>
                  <TabsTrigger value="reviewed">
                    Reviewed ({reports.filter(r => r.status === 'REVIEWED').length})
                  </TabsTrigger>
                  <TabsTrigger value="pending">
                    Pending ({reports.filter(r => r.status === 'PENDING').length})
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {loading ? (
                <div className="text-center py-8">Loading reports...</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Match</TableHead>
                        <TableHead>Referee</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReports.map((report) => (
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
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium">
                                  {report.referee.firstName} {report.referee.lastName}
                                </p>
                                <p className="text-xs text-gray-500">{report.referee.email}</p>
                              </div>
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
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewReport(report)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredReports.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p>No reports found for the selected filter.</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Report Details Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Match Report Details</DialogTitle>
              </DialogHeader>
              {selectedReport && (
                <div className="space-y-6">
                  {/* Match Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">
                      {selectedReport.match.homeTeam.name} vs {selectedReport.match.awayTeam.name}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Competition:</span>
                        <p className="font-medium">{selectedReport.match.competition.name}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Date:</span>
                        <p className="font-medium">{new Date(selectedReport.match.scheduledDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Referee:</span>
                        <p className="font-medium">
                          {selectedReport.referee.firstName} {selectedReport.referee.lastName}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <Badge className={getStatusColor(selectedReport.status)}>
                          {selectedReport.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Final Score */}
                  <div>
                    <h4 className="font-medium mb-3">Final Score</h4>
                    <div className="flex items-center justify-center gap-4 p-4 bg-blue-50 rounded-lg">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">{selectedReport.match.homeTeam.name}</p>
                        <p className="text-3xl font-bold text-blue-600">{selectedReport.homeScore}</p>
                      </div>
                      <div className="text-2xl font-bold text-gray-400">-</div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">{selectedReport.match.awayTeam.name}</p>
                        <p className="text-3xl font-bold text-blue-600">{selectedReport.awayScore}</p>
                      </div>
                    </div>
                  </div>

                  {/* Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Yellow Cards</h4>
                      <div className="bg-yellow-50 p-3 rounded-lg min-h-[60px]">
                        {selectedReport.yellowCards.length > 0 ? (
                          <ul className="space-y-1">
                            {selectedReport.yellowCards.map((card, index) => (
                              <li key={index} className="text-sm">{card}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500">No yellow cards</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Red Cards</h4>
                      <div className="bg-red-50 p-3 rounded-lg min-h-[60px]">
                        {selectedReport.redCards.length > 0 ? (
                          <ul className="space-y-1">
                            {selectedReport.redCards.map((card, index) => (
                              <li key={index} className="text-sm">{card}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500">No red cards</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Incidents */}
                  <div>
                    <h4 className="font-medium mb-2">Match Incidents</h4>
                    <div className="bg-gray-50 p-3 rounded-lg min-h-[100px]">
                      {selectedReport.incidents.length > 0 ? (
                        <ul className="space-y-2">
                          {selectedReport.incidents.map((incident, index) => (
                            <li key={index} className="text-sm border-l-2 border-blue-200 pl-3">
                              {incident}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">No incidents reported</p>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <h4 className="font-medium mb-2">Additional Notes</h4>
                    <div className="bg-gray-50 p-3 rounded-lg min-h-[80px]">
                      {selectedReport.notes ? (
                        <p className="text-sm whitespace-pre-wrap">{selectedReport.notes}</p>
                      ) : (
                        <p className="text-sm text-gray-500">No additional notes</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t">
                    <Button onClick={() => setIsDialogOpen(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </ProtectedRoute>
  );
}