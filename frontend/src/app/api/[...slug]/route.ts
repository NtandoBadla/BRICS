import { NextRequest, NextResponse } from 'next/server';

const app = require('../../../../../backend/src/index.js');

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
  const path = url.pathname;
  
  const req = {
    method: request.method,
    url: path,
    headers: Object.fromEntries(request.headers.entries()),
    body: request.method !== 'GET' ? await request.json().catch(() => ({})) : undefined,
    query: Object.fromEntries(url.searchParams.entries())
  };

  return new Promise((resolve) => {
    const res = {
      status: (code: number) => ({ json: (data: any) => resolve(NextResponse.json(data, { status: code })) }),
      json: (data: any) => resolve(NextResponse.json(data)),
      send: (data: any) => resolve(new NextResponse(data)),
      sendStatus: (code: number) => resolve(new NextResponse(null, { status: code }))
    };

    app(req, res, () => {});
  });
}