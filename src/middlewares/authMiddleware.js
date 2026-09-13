import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
  let token;

  // Verifica se o Header 'Authorization' existe e começa com 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extrai o token descartando a palavra 'Bearer '
      token = req.headers.authorization.split(' ')[1];

      // Decodifica o token usando a chave secreta
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_fallback');

      // Anexa os dados do usuário decodificado à requisição
      req.user = decoded;

      return next(); // Libera para o próximo passo (controller)
    } catch (error) {
      return res.status(401).json({ message: 'Não autorizado, token inválido ou expirado.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Não autorizado, nenhum token fornecido.' });
  }
};

