'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, ArrowLeft, Search } from "lucide-react";
import Footer from "@/components/layout/Footer";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState([]);
  const [filteredLeagues, setFilteredLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLeagues();
  }, []);

  useEffect(() => {
    const filtered = leagues.filter((league: any) => 
      league.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      league.country?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLeagues(filtered);
  }, [searchTerm, leagues]);

  const fetchLeagues = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/leagues`);
      if (response.ok) {
        const data = await response.json();
        console.log('Leagues data:', data);
        setLeagues(data || []);
        setFilteredLeagues(data || []);
      }
    } catch (error) {
      console.error('Error fetching leagues');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Trophy className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">BIFA</span>
          </Link>
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Football Leagues</h1>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by league or country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : filteredLeagues.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLeagues.map((league: any, index: number) => (
              <Link href={`/leagues/${league.id}`} key={index}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      {league.logo && (
                        <img src={league.logo} alt={league.name} className="h-12 w-12 object-contain" />
                      )}
                      <div>
                        <CardTitle className="text-lg">{league.name}</CardTitle>
                        <p className="text-sm text-gray-500">{league.country}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Type: {league.type}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Season: {league.season}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              {searchTerm ? 'No leagues found matching your search.' : 'No leagues available at the moment.'}
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
