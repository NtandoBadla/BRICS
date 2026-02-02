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
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                {editingSquad ? 'Edit National Squad' : 'Create New National Squad'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-4">Squad Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">Squad Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., BRICS U-23 National Team"
                      className="mt-1"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of the squad..."
                      className="mt-1"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Select Athletes</h3>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {selectedAthletes.length} selected
                  </Badge>
                </div>
                
                <div className="border rounded-lg">
                  <div className="p-3 border-b bg-gray-50">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by athlete name or team..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white"
                      />
                    </div>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    {filteredAthletes.length > 0 ? (
                      <div className="divide-y">
                        {filteredAthletes.map((athlete) => (
                          <div key={athlete.id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Checkbox
                                  id={athlete.id}
                                  checked={selectedAthletes.includes(athlete.id)}
                                  onCheckedChange={() => toggleAthlete(athlete.id)}
                                  className="h-5 w-5"
                                />
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">
                                    {athlete.firstName} {athlete.lastName}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {athlete.team.name}
                                    </Badge>
                                    {athlete.position && (
                                      <Badge variant="secondary" className="text-xs">
                                        {athlete.position}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {athlete.age && (
                                <span className="text-sm text-gray-500 font-medium">
                                  Age: {athlete.age}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No athletes found matching your search</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
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
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">National Squads</h3>
                <p className="text-sm text-gray-600">Manage your national team squads and athlete selections</p>
              </div>
              
              {squads.map((squad) => (
                <Card key={squad.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{squad.name}</CardTitle>
                          <p className="text-sm text-gray-500 mt-1">
                            Created: {new Date(squad.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditSquad(squad)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteSquad(squad.id)}>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {squad.description && (
                      <p className="text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-lg">
                        {squad.description}
                      </p>
                    )}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">Squad Members</h4>
                        <Badge variant="secondary">{squad.athletes.length} athletes</Badge>
                      </div>
                      {squad.athletes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {squad.athletes.map((athlete) => (
                            <div key={athlete.id} className="flex items-center gap-2 p-2 bg-white border rounded-lg">
                              <UserPlus className="h-4 w-4 text-blue-500" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {athlete.firstName} {athlete.lastName}
                                </p>
                                <p className="text-xs text-gray-500 truncate">{athlete.team.name}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No athletes assigned to this squad</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
              }
              {squads.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No squads created yet</h3>
                    <p className="text-gray-500 mb-4">Create your first national squad to get started</p>
                    <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Squad
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="athletes" className="space-y-4">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Available Athletes</h3>
                <p className="text-sm text-gray-600">Browse and search through all available athletes</p>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by athlete name, team, or position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              
              <div className="grid gap-3">
                {filteredAthletes.length > 0 ? (
                  filteredAthletes.map((athlete) => (
                    <Card key={athlete.id} className="hover:shadow-sm transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-full">
                              <UserPlus className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {athlete.firstName} {athlete.lastName}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {athlete.team.name}
                                </Badge>
                                {athlete.position && (
                                  <Badge variant="secondary" className="text-xs">
                                    {athlete.position}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            {athlete.age && (
                              <span className="text-sm text-gray-500 font-medium">
                                Age: {athlete.age}
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Search className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No athletes found</h3>
                      <p className="text-gray-500">Try adjusting your search terms</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}