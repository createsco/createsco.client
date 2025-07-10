# Setting Up Local MongoDB for Testing

This guide will help you set up a local MongoDB instance for testing the search functionality.

## Option 1: Using Docker (Recommended)

### 1. Install Docker
Download and install Docker from [docker.com](https://www.docker.com/)

### 2. Run MongoDB Container
\`\`\`bash
docker run -d --name mongodb-pixisphere -p 27017:27017 mongo:latest
\`\`\`

### 3. Set Environment Variables
Create `.env.local` file:
\`\`\`
MONGODB_URI=mongodb://localhost:27017/pixisphere
MONGODB_DB_NAME=pixisphere
\`\`\`

### 4. Test Connection
\`\`\`bash
npm run test-db
\`\`\`

### 5. Populate Data
\`\`\`bash
npm run populate-db
\`\`\`

## Option 2: Using MongoDB Community Edition

### 1. Install MongoDB Community Edition
- **Windows**: Download from [mongodb.com](https://www.mongodb.com/try/download/community)
- **macOS**: `brew install mongodb-community`
- **Linux**: Follow [official installation guide](https://docs.mongodb.com/manual/installation/)

### 2. Start MongoDB Service
- **Windows**: MongoDB runs as a service automatically
- **macOS**: `brew services start mongodb-community`
- **Linux**: `sudo systemctl start mongod`

### 3. Set Environment Variables
Create `.env.local` file:
\`\`\`
MONGODB_URI=mongodb://localhost:27017/pixisphere
MONGODB_DB_NAME=pixisphere
\`\`\`

### 4. Test Connection
\`\`\`bash
npm run test-db
\`\`\`

### 5. Populate Data
\`\`\`bash
npm run populate-db
\`\`\`

## Option 3: Using MongoDB Atlas (Cloud)

### 1. Create MongoDB Atlas Account
Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a free account

### 2. Create Cluster
- Choose "Free" tier
- Select your preferred cloud provider and region
- Create cluster

### 3. Get Connection String
- Click "Connect" on your cluster
- Choose "Connect your application"
- Copy the connection string

### 4. Set Environment Variables
Create `.env.local` file:
\`\`\`
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pixisphere?retryWrites=true&w=majority
MONGODB_DB_NAME=pixisphere
\`\`\`

Replace `username`, `password`, and `cluster` with your actual values.

### 5. Test Connection
\`\`\`bash
npm run test-db
\`\`\`

### 6. Populate Data
\`\`\`bash
npm run populate-db
\`\`\`

## Troubleshooting

### Connection Refused
- Ensure MongoDB is running
- Check if port 27017 is available
- Verify firewall settings

### Authentication Failed
- Check username and password in connection string
- Ensure user has proper permissions
- Verify database name is correct

### Network Error
- Check internet connection (for Atlas)
- Verify network security settings
- Ensure IP address is whitelisted (for Atlas)
