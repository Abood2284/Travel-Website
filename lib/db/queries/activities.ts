import { db } from '../client';
import { activities } from '../schema';
import { eq } from 'drizzle-orm';

export async function getActivityById(id: string) {
  const [activity] = await db
    .select()
    .from(activities)
    .where(eq(activities.id, id))
    .limit(1);
  
  return activity;
}

export async function getActivitiesByDestination(destinationId: string) {
  return await db
    .select()
    .from(activities)
    .where(eq(activities.destinationId, destinationId));
}

export async function getAllActivities() {
  return await db
    .select()
    .from(activities);
}
