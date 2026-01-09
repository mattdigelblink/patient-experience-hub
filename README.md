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

