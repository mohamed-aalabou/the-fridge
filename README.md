This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Spotify Integration Setup

To enable the Spotify music player functionality, you'll need to:

1. **Create a Spotify App:**

   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - Note down your Client ID

2. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory with:

   ```
   NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
   ```

3. **Configure Redirect URI:**

   - In your Spotify app settings, add `http://localhost:3000` as a redirect URI
   - For production, add your production domain

4. **Required Spotify Scopes:**
   The app requests these scopes:
   - `user-read-currently-playing` - To get the currently playing track
   - `user-read-playback-state` - To get playback state information
   - `user-read-private` - To access user profile information

### Running the Development Server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
