import { NextRequest, NextResponse } from 'next/server';

// API proxy to handle backend requests
export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}

export async function PUT(request: NextRequest) {
  return handleRequest(request);
}

export async function DELETE(request: NextRequest) {
  return handleRequest(request);
}

async function handleRequest(request: NextRequest) {
  const url = new URL(request.url);
  const apiPath = url.pathname.replace('/api/', '');
  
  // In production, this should point to your deployed backend
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  const targetUrl = `${backendUrl}/${apiPath}${url.search}`;
  
  try {
    const headers: Record<string, string> = {};
    
    // Copy relevant headers
    request.headers.forEach((value, key) => {
      if (!key.startsWith('host') && !key.startsWith('x-forwarded')) {
        headers[key] = value;
      }
    });
    
    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
    };
    
    // Add body for non-GET requests
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const body = await request.text();
      if (body) {
        fetchOptions.body = body;
      }
    }
    
    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.text();
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Backend service unavailable' },
      { status: 503 }
    );
  }
}