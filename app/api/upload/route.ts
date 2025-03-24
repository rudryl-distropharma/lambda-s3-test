import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Log environment variables (without secrets)
console.log('AWS_REGION:', process.env.AWS_REGION);
console.log('AWS_BUCKET_NAME:', process.env.AWS_BUCKET_NAME);
console.log('AWS_ACCESS_KEY_ID exists:', !!process.env.AWS_ACCESS_KEY_ID);
console.log('AWS_SECRET_ACCESS_KEY exists:', !!process.env.AWS_SECRET_ACCESS_KEY);

// Create S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  console.log('Upload endpoint called');
  
  try {
    // Parse form data
    console.log('Parsing form data...');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    // Validate file
    if (!file) {
      console.error('No file provided in request');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    console.log('File received:', {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // Check configuration
    if (!process.env.AWS_BUCKET_NAME) {
      console.error('AWS_BUCKET_NAME environment variable not set');
      return NextResponse.json(
        { error: 'Server configuration error: Missing bucket name' },
        { status: 500 }
      );
    }

    // Upload to S3
    try {
      console.log('Converting file to buffer...');
      const buffer = Buffer.from(await file.arrayBuffer());
      const key = `inventory/${Date.now()}-${file.name}`;
      
      console.log('Uploading to S3...', {
        bucket: process.env.AWS_BUCKET_NAME,
        key,
        fileSize: buffer.length,
      });
      
      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: key,
          Body: buffer,
        })
      );
      
      console.log('S3 upload successful');
      
      return NextResponse.json({ 
        status: 'success', 
        message: 'File uploaded to S3 successfully',
        key: key
      });
    } catch (s3Error) {
      console.error('S3 upload error:', s3Error);
      return NextResponse.json(
        { 
          error: 'Error uploading file to S3',
          details: s3Error instanceof Error ? s3Error.message : String(s3Error)
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('General error in upload endpoint:', error);
    return NextResponse.json(
      { 
        error: 'Error processing upload request',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 