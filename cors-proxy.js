// CORS Proxy Middleware
// This middleware ensures that CORS headers are properly set for all responses

export const corsProxy = (req, res, next) => {
  // Allow requests from any origin in development
  const allowedOrigins = ['https://murai.vercel.app', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // For requests without an origin header or from non-allowed origins
    res.setHeader('Access-Control-Allow-Origin', 'https://murai.vercel.app');
  }
  
  // Allow credentials
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Allow specific headers
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Allow specific methods
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  
  // Allow the Authorization header to be exposed to the client
  res.setHeader('Access-Control-Expose-Headers', 'Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
};
