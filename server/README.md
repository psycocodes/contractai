# Contract.ai Backend Server

Enterprise-grade contract lifecycle platform backend built with Express.js and TypeScript.

## Features Implemented

### Step 1 - Backend Skeleton ✅
- TypeScript-based Express server
- MongoDB connection with graceful failure handling
- Environment variable loading
- Health check endpoint
- Clean modular architecture

### Step 2 - Contract Ingestion ✅
- File upload support (PDF, DOCX, TXT)
- Text extraction from uploaded files
- Contract versioning system
- MongoDB models for Contract and ContractVersion

### Step 2.5 - Canonicalization ✅
- Proper text extraction using pdf-parse and mammoth
- Deterministic text normalization
- Whitespace and line break normalization
- UTF-8 encoding enforcement
- Immutable canonical text storage

### Step 3 - AI Pipeline ✅
- On-demand AI analysis (not automatic)
- Gemini AI integration
- Contract summarization
- Clause extraction
- Risk flag detection
- AIAnalysis model for storing results

### Step 4 - Frontend Viewer Support ✅
- Backend APIs for canonical text retrieval
- API to trigger AI analysis
- API to fetch AI analysis results

## Project Structure

```
server/
├── src/
│   ├── db/              # Database connection and models
│   │   ├── connection.ts
│   │   └── models/
│   │       ├── Contract.ts
│   │       ├── ContractVersion.ts
│   │       ├── AIAnalysis.ts
│   │       └── index.ts
│   ├── api/             # Route definitions
│   │   └── routes.ts
│   ├── contracts/       # Contract business logic
│   │   ├── contractService.ts
│   │   ├── contractController.ts
│   │   └── aiController.ts
│   ├── utils/           # Utilities
│   │   ├── errors.ts
│   │   ├── logger.ts
│   │   ├── asyncHandler.ts
│   │   ├── canonicalization.ts
│   │   └── index.ts
│   ├── ai/              # AI analysis logic
│   │   ├── geminiClient.ts
│   │   ├── prompts.ts
│   │   └── aiService.ts
│   └── server.ts        # Entry point
├── .env                 # Environment variables
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies
```

## API Endpoints

### Health Check
- **GET** `/api/health`
- Returns server status

### Contract Upload
- **POST** `/api/contracts/upload`
- Upload a contract file (PDF, DOCX, or TXT)
- Form-data with `file` field
- Optional: `contractId` to upload a new version

### Get Contract
- **GET** `/api/contracts/:contractId`
- Retrieve contract details

### Get Contract Versions

### Get Canonical Text
- **GET** `/api/versions/:versionId/canonical`
- Retrieve the canonical (normalized) text for a version

### Trigger AI Analysis
- **POST** `/api/versions/:versionId/analyze`
- Trigger AI analysis for a contract version
- Returns analysis ID

### Get AI Analysis Results
- **GET** `/api/versions/:versionId/analysis`
GEMINI_API_KEY=your_gemini_api_key
- Retrieve AI analysis results (summary, clauses, risk flags)
- **GET** `/api/contracts/:contractId/versions`
- List all versions of a contract

### Get Specific Version
- **GET** `/api/versions/:versionId`
- Retrieve details of a specific version

## Environment Variables

Create a `.env` file with:
```
MONGO_URI=your_mongodb_uri
PORT=5000
NODE_ENV=development
```
