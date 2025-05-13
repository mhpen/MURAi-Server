export const validateRoute = (req, res, next) => {
  if (req.path.includes('https://') || req.path.includes('http://')) {
    return res.status(400).json({ 
      error: 'Invalid route path. URLs should not contain protocols.' 
    });
  }
  next();
}; 