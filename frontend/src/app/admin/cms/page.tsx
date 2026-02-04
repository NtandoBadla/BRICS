"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Globe, ArrowLeft } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function CMSAdminPage() {
  const router = useRouter();
  const [pages, setPages] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, [selectedLanguage]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [pagesRes, newsRes] = await Promise.all([
        fetch(`${API_URL}/api/cms/pages?language=${selectedLanguage}`, { headers }),
        fetch(`${API_URL}/api/cms/news?language=${selectedLanguage}`, { headers })
      ]);

      if (pagesRes.ok) {
        const pagesData = await pagesRes.json();
        setPages(pagesData);
      }

      if (newsRes.ok) {
        const newsData = await newsRes.json();
        setNews(newsData.data || newsData);
      }

      setMessage('Data loaded successfully');
    } catch (error) {
      setMessage('Failed to fetch data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePage = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/cms/pages`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.get('title'),
          slug: formData.get('slug'),
          content: formData.get('content'),
          language: selectedLanguage,
          status: 'PUBLISHED'
        })
      });

      if (response.ok) {
        setMessage('Page created successfully');
        fetchData();
        e.target.reset();
      } else {
        const error = await response.json();
        setMessage('Error: ' + error.error);
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    }
  };

  const handleCreateNews = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/cms/news`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.get('title'),
          content: formData.get('content'),
          excerpt: formData.get('excerpt'),
          language: selectedLanguage,
          status: 'PUBLISHED',
          category: formData.get('category')
        })
      });

      if (response.ok) {
        setMessage('News created successfully');
        fetchData();
        e.target.reset();
      } else {
        const error = await response.json();
        setMessage('Error: ' + error.error);
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">CMS Administration</h1>
          </div>
          <div className="flex items-center gap-4">
            <select 
              value={selectedLanguage} 
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="en">English</option>
              <option value="fr">French</option>
            </select>
            <Globe className="h-4 w-4" />
          </div>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded-md">
            {message}
          </div>
        )}

        <Tabs defaultValue="pages" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pages">Pages</TabsTrigger>
            <TabsTrigger value="news">News</TabsTrigger>
          </TabsList>

          <TabsContent value="pages">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Page</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreatePage} className="space-y-4">
                    <Input name="title" placeholder="Page Title" required />
                    <Input name="slug" placeholder="page-slug" required />
                    <Textarea name="content" placeholder="Page content..." rows={6} required />
                    <Button type="submit" className="w-full">Create Page</Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pages ({pages.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {pages.map((page) => (
                      <div key={page.id} className="p-3 border rounded-lg">
                        <h3 className="font-semibold">{page.title}</h3>
                        <p className="text-sm text-gray-600">/{page.slug}</p>
                        <Badge variant={page.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                          {page.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="news">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create News Article</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateNews} className="space-y-4">
                    <Input name="title" placeholder="Article Title" required />
                    <Input name="category" placeholder="Category" />
                    <Textarea name="excerpt" placeholder="Brief excerpt..." rows={3} />
                    <Textarea name="content" placeholder="Article content..." rows={6} required />
                    <Button type="submit" className="w-full">Create Article</Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>News Articles ({news.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {news.map((article) => (
                      <div key={article.id} className="p-3 border rounded-lg">
                        <h3 className="font-semibold">{article.title}</h3>
                        <p className="text-sm text-gray-600">{article.excerpt}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant={article.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                            {article.status}
                          </Badge>
                          {article.category && (
                            <Badge variant="outline">{article.category}</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}