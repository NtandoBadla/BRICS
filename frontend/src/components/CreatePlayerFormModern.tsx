'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus, Users, Mail, Calendar, User, Shield } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          agentId: formData.agentId === 'none' ? null : formData.agentId
        })
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Team Players</h2>
          <p className="text-gray-600 mt-1">Manage your team roster and player profiles</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
              <UserPlus className="h-4 w-4 mr-2" />
              Add New Player
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-6">
              <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center">
                <User className="h-6 w-6 mr-2 text-blue-600" />
                Create New Player Profile
              </DialogTitle>
              <p className="text-gray-600">Fill in the player details to create their profile and login credentials</p>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-bold text-black flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-bold text-black">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-sm font-bold text-black flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Date of Birth
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-bold text-black">
                    Gender
                  </Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
                    <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-green-600" />
                  Login Credentials
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-bold text-black flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="player@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-bold text-black">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Create secure password"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="agent" className="text-sm font-bold text-black">
                  Assigned Agent (Optional)
                </Label>
                <Select value={formData.agentId} onValueChange={(value) => setFormData({...formData, agentId: value})}>
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Select an agent or leave unassigned" />
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

              <div className="flex gap-3 pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isLoading ? 'Creating...' : 'Create Player'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {players.map(player => (
          <Card key={player.id} className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {player.firstName} {player.lastName}
                  </h4>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {player.firstName[0]}{player.lastName[0]}
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span className="font-medium">Team:</span>
                    <span className="ml-1">{player.team?.name || 'Unassigned'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    <span className="font-medium">Agent:</span>
                    <span className="ml-1">
                      {player.agent ? `${player.agent.firstName} ${player.agent.lastName}` : 'No agent'}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="font-medium">Age:</span>
                    <span className="ml-1">
                      {new Date().getFullYear() - new Date(player.dateOfBirth).getFullYear()} years
                    </span>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <Button variant="outline" size="sm" className="w-full">
                    View Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {players.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No players yet</h3>
            <p className="text-gray-600 mb-4">Start building your team by adding your first player</p>
            <Button 
              onClick={() => setIsOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add First Player
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}