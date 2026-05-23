import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../../utils/queryHelpers';
import { User, UserPublic, SignupBody, LoginBody } from '../../types';

const SALT_ROUNDS = 10;

export const registerUser = async (body: SignupBody): Promise<UserPublic> => {
  const { name, email, password, role } = body;

  if (!['contributor', 'maintainer'].includes(role)) {
    throw new Error('INVALID_ROLE');
  }

  const existing = await query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );
  if (existing.rows.length > 0) {
    throw new Error('EMAIL_EXISTS');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const result = await query(
    `INSERT INTO users (name, email, password, role, created_at, updated_at)
     VALUES ($1, $2, $3, $4, NOW(), NOW())
     RETURNING id, name, email, role, created_at, updated_at`,
    [name, email, hashedPassword, role]
  );

  return result.rows[0] as UserPublic;
};

export const loginUser = async (
  body: LoginBody
): Promise<{ token: string; user: UserPublic }> => {
  const { email, password } = body;

  const result = await query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const user = result.rows[0] as User;

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const token = jwt.sign(
    { id: user.id, name: user.name, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  );

  const userPublic: UserPublic = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at
  };

  return { token, user: userPublic };
};