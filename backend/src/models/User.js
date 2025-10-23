import { query } from '../config/database.js';
import bcrypt from 'bcryptjs';

class User {
  static async create({ username, email, password }) {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const { rows } = await query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
      [username, email, password_hash]
    );
    return rows[0];
  }

  static async findByEmail(email) {
    const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0];
  }

  static async findById(id) {
    const { rows } = await query('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0];
  }

  static async comparePassword(candidatePassword, password_hash) {
    return await bcrypt.compare(candidatePassword, password_hash);
  }

  static getPublicProfile(user) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      is_admin: user.is_admin,
      created_at: user.created_at,
    };
  }
}

export default User;