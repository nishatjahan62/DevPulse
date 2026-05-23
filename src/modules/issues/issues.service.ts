import { query } from '../../utils/queryHelpers';
import {
  Issue,
  IssueWithReporter,
  CreateIssueBody,
  UpdateIssueBody,
  IssueQueryParams
} from '../../types';

//  HELPER: Attach reporters to issues WITHOUT using JOINs

const attachReporters = async (issues: Issue[]): Promise<IssueWithReporter[]> => {
  if (issues.length === 0) return [];


  const reporterIds = [...new Set(issues.map((i) => i.reporter_id))];

  const reportersResult = await query(
    'SELECT id, name, role FROM users WHERE id = ANY($1)',
    [reporterIds]
  );

  const reporterMap: Record<number, { id: number; name: string; role: string }> = {};
  for (const r of reportersResult.rows) {
    reporterMap[r.id] = r;
  }

  return issues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: reporterMap[issue.reporter_id] || null,
    created_at: issue.created_at,
    updated_at: issue.updated_at
  }));
};

//  CREATE ISSUE 

export const createIssue = async (
  body: CreateIssueBody,
  reporterId: number
): Promise<Issue> => {
  const { title, description, type } = body;

  if (!title || !description || !type) {
    throw new Error('MISSING_FIELDS');
  }

  if (title.length > 150) {
    throw new Error('TITLE_TOO_LONG');
  }

  if (description.length < 20) {
    throw new Error('DESCRIPTION_TOO_SHORT');
  }

  if (!['bug', 'feature_request'].includes(type)) {
    throw new Error('INVALID_TYPE');
  }

  const userCheck = await query('SELECT id FROM users WHERE id = $1', [reporterId]);
  if (userCheck.rows.length === 0) {
    throw new Error('REPORTER_NOT_FOUND');
  }

  const result = await query(
    `INSERT INTO issues (title, description, type, status, reporter_id, created_at, updated_at)
     VALUES ($1, $2, $3, 'open', $4, NOW(), NOW())
     RETURNING *`,
    [title, description, type, reporterId]
  );

  return result.rows[0] as Issue;
};

//  GET ALL ISSUES

export const getAllIssues = async (
  params: IssueQueryParams
): Promise<IssueWithReporter[]> => {
  const { sort = 'newest', type, status } = params;

 
  const conditions: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1; 

  if (type) {
    conditions.push(`type = $${paramIndex}`);
    values.push(type);
    paramIndex++;
  }

  if (status) {
    conditions.push(`status = $${paramIndex}`);
    values.push(status);
    paramIndex++;
  }

  
  const whereClause = conditions.length > 0
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  
  const orderBy = sort === 'oldest' ? 'ASC' : 'DESC';

  const result = await query(
    `SELECT * FROM issues ${whereClause} ORDER BY created_at ${orderBy}`,
    values
  );


  return attachReporters(result.rows as Issue[]);
};

// GET SINGLE ISSUE

export const getIssueById = async (id: number): Promise<IssueWithReporter> => {
  const result = await query('SELECT * FROM issues WHERE id = $1', [id]);

  if (result.rows.length === 0) {
    throw new Error('ISSUE_NOT_FOUND');
  }

  const issuesWithReporters = await attachReporters(result.rows as Issue[]);
  return issuesWithReporters[0];
};

// UPDATE ISSUE

export const updateIssue = async (
  id: number,
  body: UpdateIssueBody,
  requesterId: number,
  requesterRole: string
): Promise<Issue> => {
  
  const existingResult = await query('SELECT * FROM issues WHERE id = $1', [id]);
  if (existingResult.rows.length === 0) {
    throw new Error('ISSUE_NOT_FOUND');
  }

  const issue = existingResult.rows[0] as Issue;

  //  Permission checks
  if (requesterRole === 'contributor') {
   
    if (issue.reporter_id !== requesterId) {
      throw new Error('FORBIDDEN');
    }

    if (issue.status !== 'open') {
      throw new Error('ISSUE_NOT_OPEN');
    }
  }

  const { title, description, type } = body;

  if (title !== undefined) {
    if (title.length > 150) throw new Error('TITLE_TOO_LONG');
  }

  if (description !== undefined) {
    if (description.length < 20) throw new Error('DESCRIPTION_TOO_SHORT');
  }

  if (type !== undefined) {
    if (!['bug', 'feature_request'].includes(type)) throw new Error('INVALID_TYPE');
  }

  
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (title !== undefined) {
    updates.push(`title = $${paramIndex}`);
    values.push(title);
    paramIndex++;
  }

  if (description !== undefined) {
    updates.push(`description = $${paramIndex}`);
    values.push(description);
    paramIndex++;
  }

  if (type !== undefined) {
    updates.push(`type = $${paramIndex}`);
    values.push(type);
    paramIndex++;
  }


  updates.push(`updated_at = NOW()`);

  
  if (updates.length === 1) { 
    throw new Error('NO_FIELDS_TO_UPDATE');
  }


  values.push(id);

  const result = await query(
    `UPDATE issues SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  return result.rows[0] as Issue;
};

//  DELETE ISSUE 

export const deleteIssue = async (id: number): Promise<void> => {
  const result = await query('DELETE FROM issues WHERE id = $1 RETURNING id', [id]);

  if (result.rows.length === 0) {
    throw new Error('ISSUE_NOT_FOUND');
  }
};