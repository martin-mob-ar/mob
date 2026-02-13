import { NextResponse } from 'next/server';
import { matchLocation } from '@/lib/google-maps/location-matcher';
import type { PlaceAddressComponents, RawAddressComponent } from '@/lib/google-maps/places';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { addressComponents, lat, lng, rawAddressComponents } = body as {
      addressComponents: PlaceAddressComponents;
      lat: number;
      lng: number;
      rawAddressComponents?: RawAddressComponent[];
    };

    if (!addressComponents || typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json(
        { error: 'Missing addressComponents, lat, or lng' },
        { status: 400 }
      );
    }

    const result = await matchLocation({ addressComponents, lat, lng, rawAddressComponents });
    return NextResponse.json(result);
  } catch (e) {
    console.error('[locations/match]', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Match failed' },
      { status: 500 }
    );
  }
}
