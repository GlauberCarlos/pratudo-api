// adminController
import User from '../models/User.js';
import { validateUserData } from './authController.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar usuários.' });
  }
};

export const approveAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select('-password');
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao atualizar papel do usuário.' });
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    user.status = user.status === 'active' ? 'inactive' : 'active';
    await user.save();

    return res.json({ id: user._id, status: user.status });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao alterar status.' });
  }
};

export const deleteUserByAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndDelete(userId);
    res.json({ message: 'Usuário removido com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir usuário.' });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Utilizador não encontrado' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao procurar utilizador' });
  }
};

export const updateUserByAdmin = async (req, res) => {
  try {
    const { name, lastName, birthDate, role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Utilizador não encontrado' });
    }

    const validationError = validateUserData({ 
      name, 
      lastName, 
      birthDate, 
      isUpdate: true 
    });

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    user.name = name || user.name;
    user.lastName = lastName || user.lastName;
    user.birthDate = birthDate || user.birthDate;
    if (role) user.role = role;

    await user.save();

    return res.json({ 
      message: 'Utilizador atualizado com sucesso', 
      user 
    });
  } catch (error) {
    return res.status(500).json({ 
      message: 'Erro ao atualizar utilizador', 
      error: error.message 
    });
  }
};