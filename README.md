# Patient Experience Hub

A Next.js TypeScript application for managing patient journeys, feedback, and compliance.

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/` - Next.js App Router pages and layouts
- `components/` - Reusable React components (create as needed)
- `config/` - Configuration files and dummy data
- `types/` - TypeScript type definitions (create as needed)
- `lib/` - Utility functions and helpers (create as needed)

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Check TypeScript types without emitting files
- `npm run test-build` - Run comprehensive build test (linting, type checking, and build)
- `npm run ci` - CI-friendly build test (lint, type-check, and build)

## Build Testing

To test that the application builds successfully:

```bash
# Interactive version with colored output
./test-build.sh

# Or using npm script
npm run test-build

# CI-friendly version (minimal output)
./test-build-ci.sh

# Or use the npm ci script
npm run ci
```

The build test script will:
1. Check Node.js and npm installation
2. Install dependencies if needed
3. Run ESLint
4. Check TypeScript types
5. Clean previous builds
6. Build the application
7. Verify build output

## Development Notes

- This is a prototype with no backend initially
- Dummy data is stored in `config/dummyData.ts`
- Once the frontend vision is finalized, we'll build out the backend

## GitHub Repository Setup

To push this code to GitHub:

1. **Create a new repository on GitHub:**
   - Go to https://github.com/new
   - Repository name: `patient-experience-hub`
   - Choose Public or Private
   - **Do NOT** initialize with README, .gitignore, or license (we already have these)
   - Click "Create repository"

2. **Connect and push:**
   ```bash
   # Add the remote (replace YOUR_USERNAME with your GitHub username)
   git remote add origin https://github.com/YOUR_USERNAME/patient-experience-hub.git
   
   # Push to GitHub
   git push -u origin main
   ```

   Or use the provided setup script:
   ```bash
   ./setup-github.sh
   ```

