//this middleware protects the app, if the user is not signed in, then they can only
//see the signin page

import {convexAuthNextjsMiddleware, 
        createRouteMatcher,
        isAuthenticatedNextjs,
        nextjsMiddlewareRedirect} from "@convex-dev/auth/nextjs/server";
const isPublicPage = createRouteMatcher(["/auth"]);


export default convexAuthNextjsMiddleware((request) => {
    //redirect user to auth page if not authenticated
    if(!isPublicPage(request) && !isAuthenticatedNextjs()){
        return nextjsMiddlewareRedirect(request, "/auth");
    }

    //redirect user from the authscreen if they're logged in
    if(isPublicPage(request) && isAuthenticatedNextjs()) {
        return nextjsMiddlewareRedirect(request, "/");
    }
});

export const config = {
    // The following matcher runs middleware on all routes
    // except static assets.
    matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
