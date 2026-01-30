"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Users } from 'lucide-react';

interface Athlete {
  id: string;
  firstName: string;
  lastName: string;
  team: { name: string };
}

interface Squad {
  id: string;
  name: string;
  description: string;
  athletes: Athlete[];
}

export default function NationalSquadManagement() {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchSquads();
    fetchAthletes();
  }, []);

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
      }
    } catch (error) {
      console.error('Failed to fetch athletes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/national-squads', {
        method: 'POST',
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
        setIsDialogOpen(false);
        setFormData({ name: '', description: '' });
        setSelectedAthletes([]);
      }
    } catch (error) {
      console.error('Failed to create squad:', error);
    }
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
        <CardTitle>National Squad Management</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Squad
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create National Squad</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div>
                <Label>Select Athletes</Label>
                <div className="max-h-60 overflow-y-auto border rounded p-4 space-y-2">
                  {athletes.map((athlete) => (
                    <div key={athlete.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={athlete.id}
                        checked={selectedAthletes.includes(athlete.id)}
                        onCheckedChange={() => toggleAthlete(athlete.id)}
                      />
                      <label htmlFor={athlete.id} className="text-sm">
                        {athlete.firstName} {athlete.lastName} ({athlete.team.name})
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Squad</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {squads.map((squad) => (
            <Card key={squad.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {squad.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">{squad.description}</p>
                <div className="flex flex-wrap gap-2">
                  {squad.athletes.map((athlete) => (
                    <span key={athlete.id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {athlete.firstName} {athlete.lastName}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}