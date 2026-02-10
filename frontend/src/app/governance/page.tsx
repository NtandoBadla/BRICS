"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileText, Users, CheckCircle, XCircle, Clock } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function GovernancePage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      const [docsRes, teamsRes, logsRes] = await Promise.all([
        fetch(`${API_URL}/api/governance/documents`, { headers }),
        fetch(`${API_URL}/api/governance/teams`, { headers }),
        fetch(`${API_URL}/api/governance/audit-logs`, { headers })
      ]);

      if (docsRes.ok) setDocuments(await docsRes.json());
      if (teamsRes.ok) setTeams(await teamsRes.json());
      if (logsRes.ok) setAuditLogs(await logsRes.json());
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleApprove = async (id) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/api/governance/documents/${id}/approve`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) fetchData();
  };

  const handleReject = async (id) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/api/governance/documents/${id}/reject`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Does not meet requirements' })
    });
    if (res.ok) fetchData();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8">Governance Portal</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Documents</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documents.filter(d => d.status === 'PENDING_APPROVAL').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Teams</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Audit Logs</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditLogs.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="documents">
        <TabsList>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="documents">
          <Card>
            <CardHeader><CardTitle>Documents</CardTitle></CardHeader>
            <CardContent>
              {documents.map((doc) => (
                <div key={doc.id} className="border rounded p-4 mb-3">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-semibold">{doc.name}</h3>
                      <p className="text-sm text-gray-600">{doc.type}</p>
                    </div>
                    <Badge>{doc.status}</Badge>
                  </div>
                  {doc.status === 'PENDING_APPROVAL' && (
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" onClick={() => handleApprove(doc.id)}>Approve</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleReject(doc.id)}>Reject</Button>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams">
          <Card>
            <CardHeader><CardTitle>Teams</CardTitle></CardHeader>
            <CardContent>
              {teams.map((team) => (
                <div key={team.id} className="border rounded p-4 mb-3">
                  <h3 className="font-semibold">{team.name}</h3>
                  <p className="text-sm">{team.federation} - {team.country}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader><CardTitle>Audit Logs</CardTitle></CardHeader>
            <CardContent>
              {auditLogs.map((log) => (
                <div key={log.id} className="border-b pb-2 mb-2">
                  <p className="text-sm font-medium">{log.action}</p>
                  <p className="text-xs text-gray-600">{log.entityType}</p>
                  <p className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
