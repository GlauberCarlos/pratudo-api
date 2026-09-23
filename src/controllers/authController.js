import User from '../models/User.js';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import Recipe from '../models/Recipe.js';

export const validateUserData = ({ name, lastName, email, birthDate, password, isUpdate = false }) => {
  if (name && name.trim().length <= 2) {
    return 'O Nome deve ter mais de 2 caracteres.';
  }
  if (lastName && lastName.trim().length <= 2) {
    return 'O Apelido deve ter mais de 2 caracteres.';
  }
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Formato de e-mail inválido.';
    }
  }
  if (birthDate) {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    if (isNaN(age) || age < 16) {
      return 'O utilizador deve ter pelo menos 16 anos.';
    }
  }

  if (isUpdate && !password) {
    return null;
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!password || !passwordRegex.test(password)) {
    return 'A senha deve ter no mínimo 8 caracteres, com 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial.';
  }

  return null;
};

export const register = async (req, res) => {
  try {
    const { name, lastName, email, password, birthDate, role } = req.body;

    if (!name || !lastName || !email || !birthDate || !password) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    const validationError = validateUserData({ name, lastName, email, birthDate, password });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Este e-mail já está cadastrado.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const UserRole = role === 'admin_pending' ? 'admin_pending' : 'user';

    const newUser = await User.create({
      name,
      lastName,
      email,
      password: hashedPassword,
      birthDate,
      status: 'active',
      role: UserRole,
    });

    return res.status(201).json({
      message: 'Usuário cadastrado com sucesso!',
      user: {
        id: newUser._id,
        name: newUser.name,
        lastName: newUser.lastName,
        email: newUser.email,
        birthDate: newUser.birthDate,
        role: newUser.role,
        status: newUser.status,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao registrar usuário', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(400).json({ message: 'E-mail ou senha incorretos.' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ message: 'Sua conta foi desativada pelo administrador.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'E-mail ou senha incorretos.' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret_fallback',
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: 'Login realizado com sucesso!',
      token,
      user: {
        id: user._id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        birthDate: user.birthDate,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao realizar login', error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const { name, lastName, password, birthDate } = req.body;

    const validationError = validateUserData({ name, lastName, birthDate, password, isUpdate: true });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    user.name = name || user.name;
    user.lastName = lastName || user.lastName;
    user.birthDate = birthDate || user.birthDate;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await user.save();

    return res.status(200).json({
      id: updatedUser._id,
      name: updatedUser.name,
      lastName: updatedUser.lastName,
      birthDate: updatedUser.birthDate,
      role: updatedUser.role,
      status: updatedUser.status,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao atualizar perfil.', error: error.message });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    await Recipe.deleteMany({ author: userId });

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    return res.status(200).json({ message: 'Conta e dados associados excluídos com sucesso.' });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao excluir conta.', error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'O e-mail é obrigatório.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({ message: 'Nenhum utilizador encontrado com este e-mail.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; 
    await user.save();

    // URL do frontend com o token em texto limpo
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    // Configurar o transporter do Nodemailer (Mailtrap)
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const message = `
      <h1>Recuperação de Senha - Pratudo</h1>
      <p>Recebemos um pedido para redefinir a sua senha.</p>
      <p>Clique no link abaixo para criar uma nova senha:</p>
      <a href="${resetUrl}" target="_blank">${resetUrl}</a>
      <p>Este link é válido por 1 hora.</p>
      <p>Se não solicitou esta alteração, ignore este e-mail.</p>
    `;

    await transporter.sendMail({
      from: `"Pratudo Suporte" <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: 'Recuperação de Senha - Pratudo',
      html: message,
    });

    return res.status(200).json({ message: 'E-mail de recuperação enviado com sucesso!' });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao enviar e-mail de recuperação.', error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'A nova senha é obrigatória.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Token inválido ou expirado.' });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!\%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: 'A senha deve ter no mínimo 8 caracteres, com 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).json({ message: 'Senha alterada com sucesso! Faça login com a nova senha.' });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao redefinir a senha.', error: error.message });
  }
};