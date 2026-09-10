import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'O nome é obrigatório'],
      trim: true,
    },
    lastName: {
      type: String,      
      trim: true,
      default: true
    },
    email: {
      type: String,
      required: [true, 'O e-mail é obrigatório'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'A senha é obrigatória'],
      select: false, // Evita que a senha seja retornada em buscas por padrão
    },
    birthDate: {
        type: Date,
        default: null
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'admin_pending'],
      default: 'user',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true, // Cria automaticamente os campos createdAt e updatedAt
  }
);

export default mongoose.model('User', userSchema);