const FRONTEND_URL = process.env.FRONTEND_URL || 'https://murai.vercel.app';

export const corsMiddleware = (req, res, next) => {
    // Get the origin from the request headers
    const origin = req.headers.origin;

    // Check if the origin is allowed
    if (origin === FRONTEND_URL || origin === 'https://murai.vercel.app') {
        res.header('Access-Control-Allow-Origin', origin);
    } else {
        // For production, only allow the specified origins
        res.header('Access-Control-Allow-Origin', FRONTEND_URL);
    }

    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Expose-Headers', 'Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
};