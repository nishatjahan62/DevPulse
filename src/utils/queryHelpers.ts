import pool from '../config/db';
import { QueryResult } from 'pg';

export const query = async (
  text: string,
  params?: unknown[]
): Promise<QueryResult> => {
  const result = await pool.query(text, params);
  return result;
};