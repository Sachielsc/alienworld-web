// The site is served under a base path (`base` in vite.config.js). nginx strips that
// prefix before Express sees the request, so URLs must be built with it and the server
// keeps mounting its routes at the root.
export const apiUrl = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
