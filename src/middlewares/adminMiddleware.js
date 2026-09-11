export const isAdmin = (req, res, next) => {
  // O req.user é preenchido pelo protect middleware antes deste
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  return res.status(403).json({
    message: 'Rota restrita para administradores.',
  });
};