# Search Functionality Setup Guide

This guide will help you set up the search functionality for the Pixisphere application.

## Prerequisites

1. MongoDB database connection
2. Environment variables configured
3. Node.js and npm installed

## Environment Variables

1. Copy the example environment file:
\`\`\`bash
cp env.example .env.local
\`\`\`

2. Edit `.env.local` and set your MongoDB connection string:

\`\`\`
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB_NAME=pixisphere
\`\`\`

**Examples:**
- **MongoDB Atlas**: `mongodb+srv://username:password@cluster.mongodb.net/pixisphere`
- **Local MongoDB**: `mongodb://localhost:27017/pixisphere`
- **MongoDB Atlas (with auth)**: `mongodb+srv://username:password@cluster.mongodb.net/pixisphere?retryWrites=true&w=majority`

## Database Setup

### Step 1: Test Database Connection

First, test if your database connection is working:

\`\`\`bash
npm run test-db
\`\`\`

This will:
- Connect to your MongoDB database
- Check if the `partners` collection exists
- Show sample data structure
- Test basic search queries

### Step 2: Populate Database

If the database is empty or you need to populate it with sample data:

\`\`\`bash
npm run populate-db
\`\`\`

This will:
- Read the partners data from `Supporting files/Pythonscripts/partners_dataset.json`
- Clear existing data in the `partners` collection
- Insert all partner records
- Create indexes for better search performance

### Step 3: Verify Data

Run the test again to verify the data was populated:

\`\`\`bash
npm run test-db
\`\`\`

You should see:
- Total documents count > 0
- Sample document structure
- Search query results

## Testing the Search Functionality

### 1. Start the Development Server

\`\`\`bash
npm run dev
\`\`\`

### 2. Test Search API

You can test the search API directly:

\`\`\`
GET /api/search?location=Mumbai&shootType=Wedding&limit=10
\`\`\`

### 3. Test Search Page

Navigate to the search page with parameters:

\`\`\`
http://localhost:3000/search?location=Mumbai&shootType=Wedding
\`\`\`

## Troubleshooting

### No Results Showing

1. **Check Database Connection**: Run `npm run test-db` to verify connection
2. **Check Data Exists**: Ensure the database has partner records
3. **Check Console Logs**: Look for MongoDB query logs in the browser console
4. **Check Network Tab**: Verify API calls are successful

### Common Issues

1. **MongoDB Connection Failed**
   - Verify `MONGODB_URI` is correct
   - Check if MongoDB service is running
   - Ensure network connectivity

2. **No Data in Database**
   - Run `npm run populate-db` to add sample data
   - Check if the JSON file exists and is valid

3. **Search Not Working**
   - Check browser console for errors
   - Verify API endpoint is accessible
   - Check if search parameters are being passed correctly

### Debug Information

The search functionality includes extensive logging:

- MongoDB queries are logged to console
- Sample documents are shown
- Result counts are displayed
- Error messages are detailed

## Data Structure

The search expects partners with the following key fields:

- `serving_locations`: Array of cities the partner serves
- `specializations`: Array of photography types
- `verified`: Boolean indicating if partner is verified
- `avg_rating`: Number for partner rating
- `location_pricing`: Object with city-based pricing
- `experience_years`: Number of years of experience

## Fallback Mechanism

If the database connection fails, the search will automatically fall back to mock data to ensure users can still see results. 

const city = location.split(',')[0].trim();
