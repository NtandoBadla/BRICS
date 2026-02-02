"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, Edit, Trash2, UserPlus, Search } from 'lucide-react';

interface Athlete {
  id: string;
  firstName: string;
  lastName: string;
  position?: string;
  team: { name: string };
  age?: number;
}

interface Squad {
  id: string;
  name: string;
  description: string;
  athletes: Athlete[];
  createdAt: string;
}

export default function NationalSquadManagement() {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [filteredAthletes, setFilteredAthletes] = useState<Athlete[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSquad, setEditingSquad] = useState<Squad | null>(null);
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchSquads();
    fetchAthletes();
  }, []);

  useEffect(() => {
    const filtered = athletes.filter(athlete => 
      `${athlete.firstName} ${athlete.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      athlete.team.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAthletes(filtered);
  }, [athletes, searchTerm]);

  const fetchSquads = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/national-squads', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSquads(data);
      }
    } catch (error) {
      console.error('Failed to fetch squads:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAthletes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/athletes/available', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAthletes(data);
        setFilteredAthletes(data);
      }
    } catch (error) {
      console.error('Failed to fetch athletes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingSquad ? `/api/national-squads/${editingSquad.id}` : '/api/national-squads';
      const method = editingSquad ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          athleteIds: selectedAthletes
        })
      });

      if (response.ok) {
        await fetchSquads();
        resetForm();
      }
    } catch (error) {
      console.error('Failed to save squad:', error);
    }
  };

  const handleDeleteSquad = async (squadId: string) => {
    if (!confirm('Are you sure you want to delete this squad?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/national-squads/${squadId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        await fetchSquads();
      }
    } catch (error) {
      console.error('Failed to delete squad:', error);
    }
  };

  const handleEditSquad = (squad: Squad) => {
    setEditingSquad(squad);
    setFormData({ name: squad.name, description: squad.description });
    setSelectedAthletes(squad.athletes.map(a => a.id));
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setIsDialogOpen(false);
    setEditingSquad(null);
    setFormData({ name: '', description: '' });
    setSelectedAthletes([]);
    setSearchTerm('');
  };

  const toggleAthlete = (athleteId: string) => {
    setSelectedAthletes(prev => 
      prev.includes(athleteId) 
        ? prev.filter(id => id !== athleteId)
        : [...prev, athleteId]
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          National Squad Management
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingSquad(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Squad
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSquad ? 'Edit Squad' : 'Create National Squad'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Squad Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Select Athletes</Label>
                <div className="mt-2">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search athletes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto border rounded p-4 space-y-3">
                    {filteredAthletes.map((athlete) => (
                      <div key={athlete.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={athlete.id}
                            checked={selectedAthletes.includes(athlete.id)}
                            onCheckedChange={() => toggleAthlete(athlete.id)}
                          />
                          <div>
                            <p className="font-medium">{athlete.firstName} {athlete.lastName}</p>
                            <p className="text-sm text-gray-600">{athlete.team.name}</p>
                            {athlete.position && (
                              <Badge variant="outline" className="text-xs">{athlete.position}</Badge>
                            )}
                          </div>
                        </div>
                        {athlete.age && (
                          <span className="text-sm text-gray-500">Age: {athlete.age}</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {selectedAthletes.length} athletes selected
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingSquad ? 'Update Squad' : 'Create Squad'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading squads...</div>
        ) : (
          <Tabs defaultValue="squads" className="w-full">
            <TabsList>
              <TabsTrigger value="squads">Active Squads ({squads.length})</TabsTrigger>
              <TabsTrigger value="athletes">Available Athletes ({athletes.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="squads" className="space-y-4">
              {squads.map((squad) => (
                <Card key={squad.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          {squad.name}
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                          Created: {new Date(squad.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditSquad(squad)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteSquad(squad.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{squad.description}</p>
                    <div className="space-y-2">
                      <p className="font-medium text-sm">Athletes ({squad.athletes.length}):</p>
                      <div className="flex flex-wrap gap-2">
                        {squad.athletes.map((athlete) => (
                          <Badge key={athlete.id} variant="secondary" className="flex items-center gap-1">
                            <UserPlus className="h-3 w-3" />
                            {athlete.firstName} {athlete.lastName}
                            <span className="text-xs opacity-75">({athlete.team.name})</span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {squads.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No squads created yet. Create your first national squad!
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="athletes" className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search athletes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="grid gap-3">
                {filteredAthletes.map((athlete) => (
                  <Card key={athlete.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{athlete.firstName} {athlete.lastName}</p>
                          <p className="text-sm text-gray-600">{athlete.team.name}</p>
                          {athlete.position && (
                            <Badge variant="outline" className="text-xs mt-1">{athlete.position}</Badge>
                          )}
                        </div>
                        {athlete.age && (
                          <span className="text-sm text-gray-500">Age: {athlete.age}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}