'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Calendar, MapPin, Clock } from "lucide-react";
import Footer from "@/components/layout/Footer";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Mock data for when backend is not available
const mockMatches = [
  { id: 1, homeTeam: "Brazil", awayTeam: "Russia", date: "2024-02-15", time: "15:00", venue: "Stadium A" },
  { id: 2, homeTeam: "India", awayTeam: "China", date: "2024-02-16", time: "18:00", venue: "Stadium B" }
];

const mockCompetitions = [
  { id: 1, name: "BRICS Cup 2024", season: "2024", teams: [] },
  { id: 2, name: "Championship League", season: "2024", teams: [] }
];

export default function App() {
  const [matches, setMatches] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      if (!API_BASE_URL) {
        // Use mock data when no backend URL is configured
        setMatches(mockMatches);
        setCompetitions(mockCompetitions);
        setLoading(false);
        return;
      }

      const [matchesRes, competitionsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/competitions/matches`).catch(() => null),
        fetch(`${API_BASE_URL}/api/competitions`).catch(() => null)
      ]);

      if (matchesRes?.ok) {
        const data = await matchesRes.json();
        setMatches(data.slice(0, 6));
      } else {
        setMatches(mockMatches);
      }

      if (competitionsRes?.ok) {
        const data = await competitionsRes.json();
        setCompetitions(data.slice(0, 4));
      } else {
        setCompetitions(mockCompetitions);
      }
    } catch (error) {
      console.error('Error fetching data, using mock data');
      setMatches(mockMatches);
      setCompetitions(mockCompetitions);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Trophy className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">BIFA</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium">Home</Link>
            <Link href="/news" className="text-gray-700 hover:text-blue-600 font-medium">News</Link>
            <Link href="/teams" className="text-gray-700 hover:text-blue-600 font-medium">Teams</Link>
            <Link href="/matches" className="text-gray-700 hover:text-blue-600 font-medium">Matches</Link>
            <Link href="/competitions" className="text-gray-700 hover:text-blue-600 font-medium">Competitions</Link>
            <Link href="/leagues" className="text-gray-700 hover:text-blue-600 font-medium">Leagues</Link>
          </nav>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">BRICS Football Association</h1>
          <p className="text-xl text-blue-100">Your gateway to football competitions and matches</p>
        </div>
      </section>

      {/* Upcoming Matches Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Upcoming Matches</h2>
            <Button variant="outline" asChild>
              <Link href="/matches">View All</Link>
            </Button>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : matches.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((match: any) => (
                <Card key={match.id}>
                  <CardHeader>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(match.date).toLocaleDateString()}</span>
                      <Clock className="h-4 w-4 ml-2" />
                      <span>{match.time}</span>
                    </div>
                    <CardTitle className="text-lg">
                      {match.homeTeam} vs {match.awayTeam}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{match.venue}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                No upcoming matches at the moment. Check back soon!
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Upcoming Competitions Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Upcoming Competitions</h2>
            <Button variant="outline" asChild>
              <Link href="/competitions">View All</Link>
            </Button>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : competitions.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {competitions.map((competition: any) => (
                <Card key={competition.id}>
                  <CardHeader>
                    <Trophy className="h-10 w-10 text-blue-600 mb-3" />
                    <CardTitle>{competition.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-2">{competition.season}</p>
                    <p className="text-sm text-gray-500">{competition.teams?.length || 0} Teams</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                No upcoming competitions at the moment. Check back soon!
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
