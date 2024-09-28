import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request) {
  return NextResponse.json({ message: 'This API route is no longer in use. Data is fetched directly in the component.' });
}