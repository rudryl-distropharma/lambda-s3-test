import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET() {
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db('pharmacy');
    const collection = db.collection('inventory');

    // Get all drugs from the inventory collection
    const drugs = await collection.find({}).sort({ processedAt: -1 }).toArray();

    await client.close();

    return NextResponse.json({ 
      status: 'success',
      drugs 
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      { error: 'Error fetching inventory data' },
      { status: 500 }
    );
  }
} 