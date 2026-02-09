"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Edit, Trash2, Search, User, Award, Mail, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function RefereeAdminPage() {
  const router = useRouter();
  const [referees, setReferees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingReferee, setEditingReferee] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchReferees();
  }, []);

  const fetchReferees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/referees`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setReferees(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch referees",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReferee = async (data) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/referees`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Referee created successfully"
        });
        setShowForm(false);
        fetchReferees();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create referee');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleUpdateReferee = async (id, data) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/referees/${id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Referee updated successfully"
        });
        setShowForm(false);
        setEditingReferee(null);
        fetchReferees();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update referee",
        variant: "destructive"
      });
    }
  };

  const handleDeleteReferee = async (id) => {
    if (!confirm('Are you sure you want to delete this referee?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/referees/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Referee deleted successfully"
        });
        fetchReferees();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete referee",
        variant: "destructive"
      });
    }
  };

  const RefereeForm = ({ onSubmit, initialData, onCancel }) => {
    const [formData, setFormData] = useState({
      firstName: initialData?.user?.firstName || '',
      lastName: initialData?.user?.lastName || '',
      email: initialData?.user?.email || '',
      licenseNumber: initialData?.licenseNumber || '',
      certification: initialData?.certification || '',
      experience: initialData?.experience || 0
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setSubmitting(true);
      try {
        if (initialData) {
          await onSubmit(initialData.id, formData);
        } else {
          await onSubmit(formData);
        }
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle>{initialData ? 'Edit Referee' : 'Add New Referee'}</CardTitle>
              <CardDescription>Fill in the referee details below</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Enter first name"
                  required
                  disabled={!!initialData}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Enter last name"
                  required
                  disabled={!!initialData}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="referee@example.com"
                required
                disabled={!!initialData}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenseNumber" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                License Number
              </Label>
              <Input
                id="licenseNumber"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                placeholder="REF-2024-001"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="certification" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Certification Level
              </Label>
              <Select value={formData.certification} onValueChange={(value) => setFormData({ ...formData, certification: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select certification level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIFA Level 1">FIFA Level 1</SelectItem>
                  <SelectItem value="FIFA Level 2">FIFA Level 2</SelectItem>
                  <SelectItem value="FIFA Level 3">FIFA Level 3</SelectItem>
                  <SelectItem value="National Level">National Level</SelectItem>
                  <SelectItem value="Regional Level">Regional Level</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                type="number"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {initialData ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  initialData ? 'Update Referee' : 'Create Referee'
                )}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  };

  const filteredReferees = referees.filter(referee => {
    const fullName = `${referee.user?.firstName} ${referee.user?.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) ||
           referee.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
           referee.certification.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <RefereeForm 
          onSubmit={editingReferee ? handleUpdateReferee : handleCreateReferee} 
          initialData={editingReferee}
          onCancel={() => {
            setShowForm(false);
            setEditingReferee(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push('/admin')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Referee Registry</h1>
              <p className="text-gray-600">Manage referee profiles and certifications</p>
            </div>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Referee
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, license number, or certification..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Referees ({filteredReferees.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredReferees.map((referee) => (
                <div key={referee.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {referee.user?.firstName} {referee.user?.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{referee.user?.email}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline">
                          License: {referee.licenseNumber}
                        </Badge>
                        <Badge variant="secondary">
                          <Award className="h-3 w-3 mr-1" />
                          {referee.certification}
                        </Badge>
                        <Badge variant="outline">
                          {referee.experience} years
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingReferee(referee);
                        setShowForm(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteReferee(referee.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {filteredReferees.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No referees found matching your search criteria.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}