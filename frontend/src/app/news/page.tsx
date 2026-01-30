"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, TrendingUp, ArrowRightLeft } from 'lucide-react';
import Footer from '@/components/layout/Footer';

export default function NewsPage() {
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [topScorers, setTopScorers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fixturesRes, transfersRes, scorersRes] = await Promise.all([
          fetch('http://localhost:5000/api/football/fixtures?league=39&season=2024').catch(() => null),
          fetch('http://localhost:5000/api/football/transfers?team=33').catch(() => null),
          fetch('http://localhost:5000/api/football/topscorers?league=39&season=2024').catch(() => null)
        ]);

        if (fixturesRes?.ok) {
          const data = await fixturesRes.json();
          setFixtures(data.response?.slice(0, 10) || []);
        } else {
          // Fallback data for fixtures
          setFixtures([
            {
              fixture: { date: '2024-02-15T15:00:00Z' },
              league: { name: 'BRICS Championship' },
              teams: {
                home: { name: 'Brazil', logo: 'https://placehold.co/40x40/png?text=BRA' },
                away: { name: 'Russia', logo: 'https://placehold.co/40x40/png?text=RUS' }
              }
            },
            {
              fixture: { date: '2024-02-16T18:00:00Z' },
              league: { name: 'BRICS Championship' },
              teams: {
                home: { name: 'India', logo: 'https://placehold.co/40x40/png?text=IND' },
                away: { name: 'China', logo: 'https://placehold.co/40x40/png?text=CHN' }
              }
            }
          ]);
        }

        if (transfersRes?.ok) {
          const data = await transfersRes.json();
          setTransfers(data.response?.slice(0, 8) || []);
        } else {
          // Fallback data for transfers
          setTransfers([
            {
              player: { name: 'João Silva', photo: 'https://placehold.co/48x48/png?text=JS' },
              transfers: [{
                teams: { out: { name: 'São Paulo' }, in: { name: 'Flamengo' } },
                date: '2024-01-15'
              }]
            },
            {
              player: { name: 'Dmitri Petrov', photo: 'https://placehold.co/48x48/png?text=DP' },
              transfers: [{
                teams: { out: { name: 'CSKA Moscow' }, in: { name: 'Spartak Moscow' } },
                date: '2024-01-20'
              }]
            }
          ]);
        }

        if (scorersRes?.ok) {
          const data = await scorersRes.json();
          setTopScorers(data.response?.slice(0, 5) || []);
        } else {
          // Fallback data for top scorers
          setTopScorers([
            {
              player: { name: 'Neymar Jr', photo: 'https://placehold.co/48x48/png?text=NJ' },
              statistics: [{ team: { name: 'Brazil NT' }, goals: { total: 15 } }]
            },
            {
              player: { name: 'Artem Dzyuba', photo: 'https://placehold.co/48x48/png?text=AD' },
              statistics: [{ team: { name: 'Russia NT' }, goals: { total: 12 } }]
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Set fallback data on error
        setFixtures([
          {
            fixture: { date: '2024-02-15T15:00:00Z' },
            league: { name: 'BRICS Championship' },
            teams: {
              home: { name: 'Brazil', logo: 'https://placehold.co/40x40/png?text=BRA' },
              away: { name: 'Russia', logo: 'https://placehold.co/40x40/png?text=RUS' }
            }
          }
        ]);
        setTransfers([]);
        setTopScorers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Latest News & Updates</h1>
              <p className="text-gray-600 mt-2">Fixtures, transfers, and top scorers</p>
            </div>
            <a href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              ← Back to Home
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 flex-1">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Fixtures Section */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Upcoming Fixtures
            </h2>
            {fixtures.map((fixture, i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{fixture.league?.name}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(fixture.fixture?.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(fixture.fixture?.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {fixture.teams?.home?.logo && (
                        <img src={fixture.teams.home.logo} alt="Home" className="h-10 w-10" />
                      )}
                      <span className="font-semibold">{fixture.teams?.home?.name}</span>
                    </div>
                    <div className="px-4">
                      <span className="text-gray-500 font-bold">VS</span>
                    </div>
                    <div className="flex items-center gap-3 flex-1 justify-end">
                      <span className="font-semibold">{fixture.teams?.away?.name}</span>
                      {fixture.teams?.away?.logo && (
                        <img src={fixture.teams.away.logo} alt="Away" className="h-10 w-10" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Latest Signings */}
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <ArrowRightLeft className="h-6 w-6" />
                Latest Signings
              </h2>
              <div className="space-y-3">
                {transfers.map((transfer, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        {transfer.player?.photo && (
                          <img src={transfer.player.photo} alt="Player" className="h-12 w-12 rounded-full" />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{transfer.player?.name}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <span>{transfer.transfers?.[0]?.teams?.out?.name || 'Free'}</span>
                            <ArrowRightLeft className="h-3 w-3" />
                            <span>{transfer.transfers?.[0]?.teams?.in?.name}</span>
                          </div>
                          <p className="text-xs text-gray-500">{transfer.transfers?.[0]?.date}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Top Scorers */}
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="h-6 w-6" />
                Top Scorers
              </h2>
              <div className="space-y-3">
                {topScorers.map((scorer, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        {scorer.player?.photo && (
                          <img src={scorer.player.photo} alt="Player" className="h-12 w-12 rounded-full" />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{scorer.player?.name}</p>
                          <p className="text-xs text-gray-600">{scorer.statistics?.[0]?.team?.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">{scorer.statistics?.[0]?.goals?.total}</p>
                          <p className="text-xs text-gray-500">goals</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
