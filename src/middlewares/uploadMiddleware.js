import multer from 'multer';
import cloudinary from '../config/cloudinary.js';

// Guarda o ficheiro na memória RAM temporariamente para processar o buffer
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Aceita apenas imagens
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Formato de ficheiro inválido. Envie apenas imagens (JPG, PNG, WEBP, etc).'), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // Limite por foto
  fileFilter,
});

// Middleware auxiliar para enviar o buffer do Multer direto ao Cloudinary
export const uploadToCloudinary = (req, res, next) => {
  if (!req.file) {
    return next(); // Se não enviou imagem, segue o fluxo normal (ex: manter a foto antiga ou usar placeholder)
  }

  const uploadStream = cloudinary.uploader.upload_stream(
    {
      folder: 'pratudo_receitas', // Nome da pasta que será criada automaticamente no seu Cloudinary
      transformation: [
        { width: 800, height: 600, crop: 'limit' }, // Redimensiona imagens muito grandes para otimizar espaço
        { quality: 'auto' }, // Compressão automática sem perda perceptível
      ],
    },
    (error, result) => {
      if (error) {
        return res.status(500).json({ message: 'Erro ao fazer upload da imagem no Cloudinary.', error: error.message });
      }

      // Adiciona a URL gerada pelo Cloudinary ao req.body.img
      req.body.img = result.secure_url;
      next();
    }
  );

  // Envia os dados do ficheiro para a stream do Cloudinary
  uploadStream.end(req.file.buffer);
};