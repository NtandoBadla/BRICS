'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Calendar, MapPin, Clock } from "lucide-react";
import Footer from "@/components/layout/Footer";
import { LanguageToggle } from "@/components/LanguageToggle";
import { api, getErrorMessage } from "@/lib/api";
import '@/i18n';

export default function App() {
  const { t } = useTranslation();
  const [matches, setMatches] = useState<any[]>([]);
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Mock data fallback
  const mockMatches = [
    {
      id: 1,
      homeTeam: "Brazil",
      homeTeamLogo: "https://placehold.co/60x60/png?text=BRA",
      awayTeam: "Russia",
      awayTeamLogo: "https://placehold.co/60x60/png?text=RUS",
      date: "2024-02-15",
      time: "15:00",
      venue: "Stadium A"
    },
    {
      id: 2,
      homeTeam: "India",
      homeTeamLogo: "https://placehold.co/60x60/png?text=IND",
      awayTeam: "China",
      awayTeamLogo: "https://placehold.co/60x60/png?text=CHN",
      date: "2024-02-16",
      time: "18:00",
      venue: "Stadium B"
    }
  ];

  const mockCompetitions = [
    { id: 1, name: "BRICS Cup 2024", season: "2024", teams: [] },
    { id: 2, name: "Championship League", season: "2024", teams: [] }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError('');

      const [matchesData, competitionsData] = await Promise.all([
        api.getMatches().catch(() => []),
        api.getCompetitions().catch(() => [])
      ]);

      setMatches(Array.isArray(matchesData) ? matchesData.slice(0, 6) : mockMatches);
      setCompetitions(Array.isArray(competitionsData) ? competitionsData.slice(0, 4) : mockCompetitions);
    } catch (error) {
      console.error('Error fetching data:', error);
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
            <Trophy className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
            <span className="text-xl md:text-2xl font-bold text-gray-900">BIFA</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium">{t('nav.home')}</Link>
            <Link href="/news" className="text-gray-700 hover:text-blue-600 font-medium">{t('nav.news')}</Link>
            <Link href="/teams" className="text-gray-700 hover:text-blue-600 font-medium">{t('nav.teams')}</Link>
            <Link href="/matches" className="text-gray-700 hover:text-blue-600 font-medium">{t('nav.matches')}</Link>
            <Link href="/competitions" className="text-gray-700 hover:text-blue-600 font-medium">Competitions</Link>
            <Link href="/leagues" className="text-gray-700 hover:text-blue-600 font-medium">Leagues</Link>
          </nav>
          <div className="flex gap-2 md:gap-3">
            <LanguageToggle />
            <Button variant="outline" size="sm" className="text-xs md:text-sm" asChild>
              <Link href="/login">{t('common.login')}</Link>
            </Button>
            <Button size="sm" className="text-xs md:text-sm" asChild>
              <Link href="/signup">{t('auth.signUp')}</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-4 mt-4 rounded">
          <p className="text-yellow-800 text-sm md:text-base">{error}</p>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-8 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4">{t('public.heroTitle')}</h1>
          <p className="text-lg md:text-xl text-blue-100">{t('public.heroSubtitle')}</p>
        </div>
      </section>

      {/* Upcoming Matches Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">{t('public.upcomingMatches')}</h2>
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
                    <CardTitle className="text-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {match.homeTeamLogo && (
                          <img
                            src={match.homeTeamLogo}
                            alt={match.homeTeam}
                            className="w-8 h-8 object-contain rounded-full bg-gray-100"
                          />
                        )}
                        <span>{match.homeTeam}</span>
                      </div>
                      <span className="text-gray-400 text-sm">vs</span>
                      <div className="flex items-center gap-2">
                        <span>{match.awayTeam}</span>
                        {match.awayTeamLogo && (
                          <img
                            src={match.awayTeamLogo}
                            alt={match.awayTeam}
                            className="w-8 h-8 object-contain rounded-full bg-gray-100"
                          />
                        )}
                      </div>
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
