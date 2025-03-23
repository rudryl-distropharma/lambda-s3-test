import { NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { MongoClient } from 'mongodb';
import * as XLSX from 'xlsx';
import { parse } from 'csv-parse';
import * as pdfParse from 'pdf-parse';
import { findMedicationColumn } from '@/app/utils/medicationDetector';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Verify this is an S3 event
    if (!body.Records || !body.Records[0].eventSource || body.Records[0].eventSource !== 'aws:s3') {
      return NextResponse.json({ error: 'Invalid event source' }, { status: 400 });
    }

    const record = body.Records[0];
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    console.log(`Processing file: ${key} from bucket: ${bucket}`);

    // Only process files in the inventory directory
    // if (!key.startsWith('inventory/')) {
    //   return NextResponse.json({ message: 'Skipping non-inventory file' });
    // }

    // Get the file from S3
    const getObjectCommand = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    console.log('Fetching file from S3...');
    const response = await s3Client.send(getObjectCommand);
    
    if (!response.Body) {
      throw new Error('Empty response body from S3');
    }
    
    console.log('Converting S3 response to buffer...');
    const buffer = await response.Body.transformToByteArray().then(ab => Buffer.from(ab));

    if (!buffer) {
      throw new Error('Failed to read file from S3');
    }

    // Process the file based on its type
    const fileExtension = key.split('.').pop()?.toLowerCase();
    let drugData: any[] = [];

    console.log(`Processing file with extension: ${fileExtension}`);
    switch (fileExtension) {
      case 'csv':
        drugData = await processCSV(buffer);
        break;
      case 'xlsx':
      case 'xls':
        drugData = await processExcel(buffer);
        break;
      // case 'pdf':
      //   drugData = await processPDF(buffer);
      //   break;
      default:
        throw new Error(`Unsupported file format: ${fileExtension}`);
    }

    console.log(`Processed ${drugData.length} records from file`);

    // Store in MongoDB
    console.log('Connecting to MongoDB...');
    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db('pharmacy');
    const collection = db.collection('inventory');

    console.log('Storing data in MongoDB...');
    await collection.insertMany(
      drugData.map(drug => ({
        ...drug,
        sourceFile: key,
        processedAt: new Date(),
        processedBy: 's3-webhook',
      }))
    );

    await client.close();
    console.log('MongoDB connection closed');

    return NextResponse.json({ 
      status: 'success', 
      message: 'File processed successfully',
      processedRecords: drugData.length 
    });
  } catch (error) {
    console.error('Error processing S3 event:', error);
    return NextResponse.json(
      { error: `Error processing S3 event: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

async function processCSV(buffer: Buffer): Promise<any[]> {
  return new Promise((resolve, reject) => {
    parse(buffer, {
      columns: false, // Don't use headers
      skip_empty_lines: true,
    }, (err, records: string[][]) => {
      if (err) reject(err);
      
      // Find the medication column
      const medicationColumn = findMedicationColumn(records);
      if (medicationColumn === -1) {
        throw new Error('Could not identify medication column in CSV file');
      }
      
      // Find quantity and price columns (assuming they're numeric)
      const quantityColumn = findNumericColumn(records, medicationColumn);
      const priceColumn = findNumericColumn(records, medicationColumn, quantityColumn);
      
      resolve(records.slice(1).map((record: string[]) => ({
        name: record[medicationColumn]?.trim(),
        quantity: parseInt(record[quantityColumn] || '0'),
        price: parseFloat(record[priceColumn] || '0'),
      })));
    });
  });
}

async function processExcel(buffer: Buffer): Promise<any[]> {
  const workbook = XLSX.read(buffer);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const records = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
  
  // Find the medication column
  const medicationColumn = findMedicationColumn(records);
  if (medicationColumn === -1) {
    throw new Error('Could not identify medication column in Excel file');
  }
  
  // Find quantity and price columns
  const quantityColumn = findNumericColumn(records, medicationColumn);
  const priceColumn = findNumericColumn(records, medicationColumn, quantityColumn);
  
  return records.slice(1).map((record: string[]) => ({
    name: record[medicationColumn]?.trim(),
    quantity: parseInt(record[quantityColumn] || '0'),
    price: parseFloat(record[priceColumn] || '0'),
  }));
}

// async function processPDF(buffer: Buffer): Promise<any[]> {
//   try {
//     console.log('Parsing PDF content...');
//     const data = await pdfParse(buffer);
    
//     // Check if data is valid
//     if (!data || !data.text) {
//       throw new Error('Invalid PDF content');
//     }
    
//     console.log('Extracting lines from PDF text...');
//     const lines = data.text.split('\n')
//       .filter(line => line.trim().length > 0) // Remove empty lines
//       .map(line => {
//         // Handle different delimiters (comma, tab, or space)
//         if (line.includes(',')) {
//           return line.split(',').map(cell => cell.trim());
//         } else if (line.includes('\t')) {
//           return line.split('\t').map(cell => cell.trim());
//         } else {
//           // For space-delimited files, we need a more careful approach
//           // to avoid splitting text that should be together
//           const parts = [];
//           let currentPart = '';
//           let inQuotes = false;
          
//           for (let i = 0; i < line.length; i++) {
//             const char = line[i];
            
//             if (char === '"') {
//               inQuotes = !inQuotes;
//               currentPart += char;
//             } else if (char === ' ' && !inQuotes) {
//               if (currentPart) {
//                 parts.push(currentPart.trim());
//                 currentPart = '';
//               }
//             } else {
//               currentPart += char;
//             }
//           }
          
//           if (currentPart) {
//             parts.push(currentPart.trim());
//           }
          
//           return parts;
//         }
//       });
    
//     console.log(`Extracted ${lines.length} lines from PDF`);
    
//     // Ensure we have at least one row of data
//     if (lines.length < 2) {
//       console.log('Not enough data in PDF file');
//       return [];
//     }
    
//     // Find the medication column
//     console.log('Identifying medication column...');
//     const medicationColumn = findMedicationColumn(lines);
//     if (medicationColumn === -1) {
//       console.log('Could not identify medication column in PDF file, using first column as default');
//       // Default to first column if we can't identify the medication column
//       const result = lines.slice(1).map(line => ({
//         name: line[0]?.trim() || 'Unknown',
//         quantity: parseInt(line[1] || '0'),
//         price: parseFloat(line[2] || '0'),
//       }));
//       console.log(`Extracted ${result.length} records with default columns`);
//       return result;
//     }
    
//     // Find quantity and price columns
//     console.log('Finding numeric columns...');
//     const quantityColumn = findNumericColumn(lines, medicationColumn);
//     const priceColumn = findNumericColumn(lines, medicationColumn, quantityColumn);
    
//     console.log(`Using columns: medication=${medicationColumn}, quantity=${quantityColumn}, price=${priceColumn}`);
    
//     const result = lines.slice(1).map((line: string[]) => ({
//       name: line[medicationColumn]?.trim() || 'Unknown',
//       quantity: parseInt(line[quantityColumn] || '0'),
//       price: parseFloat(line[priceColumn] || '0'),
//     }));
    
//     console.log(`Extracted ${result.length} records from PDF`);
//     return result;
//   } catch (error) {
//     console.error('Error processing PDF:', error);
//     throw new Error(`PDF processing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
//   }
// }

function findNumericColumn(rows: string[][], excludeColumn: number, excludeColumn2?: number): number {
  if (!rows || rows.length < 2 || !rows[0].length) return -1;
  
  const numColumns = rows[0].length;
  const columnScores = new Array(numColumns).fill(0);
  
  // Skip header row and analyze each column
  for (let col = 0; col < numColumns; col++) {
    if (col === excludeColumn || col === excludeColumn2) continue;
    
    let numericCount = 0;
    let totalValues = 0;
    
    for (let row = 1; row < rows.length; row++) {
      const value = rows[row][col];
      if (value && typeof value === 'string') {
        totalValues++;
        if (/^\d+(?:\.\d+)?$/.test(value.trim())) {
          numericCount++;
        }
      }
    }
    
    // Calculate score based on percentage of numeric values
    if (totalValues > 0) {
      columnScores[col] = numericCount / totalValues;
    }
  }
  
  // Find column with highest score
  const maxScore = Math.max(...columnScores);
  const numericColumn = columnScores.indexOf(maxScore);
  
  // Return -1 if no column has a significant number of numeric values
  return maxScore > 0.5 ? numericColumn : -1;
} 