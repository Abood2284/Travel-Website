import 'server-only';

import { eq } from 'drizzle-orm';

import { db } from '../client';
import { tripRequests, type NewTripRequest, type TripRequest } from '../schema';

type CreateTripRequestInput = Omit<NewTripRequest, 'id' | 'createdAt' | 'updatedAt'>;

export async function createTripRequest(
  data: CreateTripRequestInput
): Promise<TripRequest> {
  console.info('[TripRequests Query] Inserting trip request', data);
  const [record] = await db.insert(tripRequests).values(data).returning();
  console.info('[TripRequests Query] Inserted trip request', {
    id: record.id,
    createdAt: record.createdAt,
  });
  return record;
}

export async function getTripRequestById(id: string): Promise<TripRequest | null> {
  console.info('[TripRequests Query] Fetching trip request', { id });
  const [record] = await db
    .select()
    .from(tripRequests)
    .where(eq(tripRequests.id, id))
    .limit(1);

  if (!record) {
    console.warn('[TripRequests Query] Trip request not found', { id });
    return null;
  }

  return record;
}
