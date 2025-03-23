import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'No key provided' }, { status: 400 });
    }

    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db('pharmacy');
    const collection = db.collection('inventory');

    const record = await collection.findOne({ sourceFile: key });

    await client.close();

    if (!record) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    return NextResponse.json({ status: record.status });
  } catch (error) {
    console.error('Error checking file status:', error);
    return NextResponse.json(
      { error: 'Error checking file status' },
      { status: 500 }
    );
  }
} 