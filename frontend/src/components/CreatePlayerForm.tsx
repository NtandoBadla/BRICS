'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus, Users } from 'lucide-react';

export default function CreatePlayerForm() {
  const [players, setPlayers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'MALE',
    email: '',
    password: '',
    agentId: ''
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchPlayers();
    fetchAgents();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await fetch('/api/players', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setPlayers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching players:', error);
      setPlayers([]);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setAgents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      setAgents([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Player created successfully!');
        setFormData({
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          gender: 'MALE',
          email: '',
          password: '',
          agentId: ''
        });
        setIsOpen(false);
        fetchPlayers();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating player:', error);
      alert('Failed to create player');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Team Players</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Create Player
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Player</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="email">Email (Login)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="agent">Assigned Agent (Optional)</Label>
                <Select value={formData.agentId} onValueChange={(value) => setFormData({...formData, agentId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Agent</SelectItem>
                    {agents.map(agent => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.firstName} {agent.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full">Create Player</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {players.map(player => (
          <Card key={player.id}>
            <CardContent className="p-4">
              <div className="space-y-2">
                <h4 className="font-semibold">{player.firstName} {player.lastName}</h4>
                <p className="text-sm text-gray-600">Team: {player.team?.name}</p>
                <p className="text-sm text-gray-600">
                  Agent: {player.agent ? `${player.agent.firstName} ${player.agent.lastName}` : 'No agent'}
                </p>
                <p className="text-sm text-gray-600">
                  Age: {new Date().getFullYear() - new Date(player.dateOfBirth).getFullYear()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}