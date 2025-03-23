# Pharmacy Inventory Management System

A comprehensive solution for managing pharmacy inventory through automated file processing. This system allows pharmacy staff to upload inventory files in various formats (CSV, Excel, PDF), processes them in the background, and provides a clean interface to view and search the medication inventory.

## Features

- **File Upload**: Upload pharmacy inventory files in CSV, Excel, or PDF formats
- **Automatic File Processing**: Files are automatically processed after upload using an S3-triggered webhook
- **Intelligent Column Detection**: The system automatically detects columns containing medication names, quantities, and prices
- **Real-time Status Updates**: Monitor the status of file processing in real-time
- **Searchable Inventory**: View and search through the complete medication inventory

## Intelligent Medication Detection

The system uses advanced techniques to identify medication names in uploaded files, regardless of column headers or file format:

- Detects common medication prefixes and suffixes in both English and French
- Identifies medication-related terms and formulations
- Recognizes strength units and dosage formats
- Works with various file structures and formatting

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB database
- AWS S3 bucket for file storage
- AWS Lambda (for event-driven processing)

### Environment Setup

Create a `.env.local` file with the following configuration:

```
MONGODB_URI=your_mongodb_connection_string
AWS_REGION=your_aws_region
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=your_bucket_name
```

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## File Requirements

The system can process files in the following formats:

- **CSV files**: Standard comma-separated values
- **Excel files**: .xlsx or .xls formats
- **PDF files**: Text-based PDFs with tabular data

The system will automatically identify:

- The column containing medication names
- The column containing quantities (numeric values)
- The column containing prices (numeric values)

No specific column order or naming convention is required.

## Processing Pipeline

1. User uploads a file through the web interface
2. File is stored in the S3 bucket
3. S3 event triggers the webhook
4. File is processed based on its format
5. Processed data is stored in MongoDB
6. UI displays real-time status updates

## Development

### Project Structure

- `/app` - Next.js application
  - `/api` - API routes
  - `/utils` - Utility functions
- `/components` - React components
- `/public` - Static assets

### Adding Support for New File Formats

To add support for additional file formats, extend the file processing logic in `app/api/s3-webhook/route.ts`.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Next.js for the React framework
- MongoDB for the database
- AWS S3 for file storage
- TailwindCSS for styling
