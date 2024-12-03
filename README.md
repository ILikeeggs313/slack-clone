This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

This is a Slack clone project that utilizes Nextjs, React, Tailwind CSS and Auth.js.

1. Create the sign-in and sign-up UI with state, setState and validation/auth
    a. allowing users to input email and password value to sign-in and sign-up
    b. Add authentication by setting up a Convex back-end database
        i. In the Convex back-end database, I set up a few routes and middleware to protect the app
        ii. if not signed-in, only see the signin page. @middleware.ts
        iii. if logged-in, added button to sign-out and go back to auth page. Added github login
        iv. bugged if use the same github and google account, could result in a single user with multiple accounts.
    c. Convex has pre-defined rules for signing-up, so a capital uppercase letter and a set length is required
        i. Creating a new user won't have a name in Convex db, modified sign-up-card.tsx to fill in name in the database by using setState and the signIn method.
2. Creating a work-space:
    a. creating a work-space modal, users have to create a workspace, if not redirect back to workspace creation --- refer to page.tsx
    b. Preventing a hydration problem with useEffect in modals.tsx, if there's no mounted element then return null to prevent hydraton issues for users. This ensures all modals added will show on client-side rendering.
    c. After creating workspace in convex/workspaces.ts, create hooks to get/create the workspace in the components.
    d. Routing users to the workspaceId, using router.replace in src/app/page.tsx to replace the current history
3. Workspace functionality and styling with Tailwind:
    a. Adding sidebar, toolbar, and modifying workspace layout 
    b. adding roles to workspaces so only members of a specific workspace can see it, modified schema.ts to add roles and optimized ways of looking for users
    c. Building work-space header in layout.tsx, building workspace header [workspaceId]
    d. Build workspace preferences: build channels and members so we can invite people to the channels and spaces.
    e. Building & Rendering Channels 
4. Invitations to workspaces:
    a. only invites may come in, non-invites may go back to home page.
    b. Building individual channel information
    c. Adding editor component
    
        
        

## Getting Started

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
