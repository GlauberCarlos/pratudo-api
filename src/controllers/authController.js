import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import Recipe from '../models/Recipe.js';

export const register = async (req, res) => {
  try {
    const { name, lastName, email, password, birthDate, role } = req.body;

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

    // Comparar senha digitada com o hash salvo
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

    const { name, lastName, email, password } = req.body;

    user.name = name || user.name;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;

    // Se informou uma nova senha, gera o hash
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await user.save();

    return res.status(200).json({
      id: updatedUser._id,
      name: updatedUser.name,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
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

    // Remove as receitas associadas
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