import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://brics-platform.onrender.com';

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/competitions/matches`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}