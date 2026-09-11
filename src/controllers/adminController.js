import User from '../models/User.js';

// 1. Listar todos os usuários
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar usuários', error: error.message });
  }
};

// 2. Aprovar Admin Pendente (muda role de 'admin_pending' para 'admin')
export const approveAdmin = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    user.role = 'admin';
    await user.save();

    return res.status(200).json({
      message: `Usuário ${user.name} promovido a Administrador com sucesso!`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao aprovar administrador', error: error.message });
  }
};

// 3. Alterar Status do Usuário (Ativar / Inativar)
export const toggleUserStatus = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Impede que um admin desative a si próprio
    if (userId == req.user.id) {
      return res.status(400).json({ message: 'Você não pode desativar sua própria conta.' });
    }

    user.status = user.status === 'active' ? 'inactive' : 'active';
    await user.save();

    return res.status(200).json({
      message: `Status do usuário ${user.name} alterado para ${user.status}.`,
      status: user.status,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao alterar status do usuário', error: error.message });
  }
};