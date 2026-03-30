import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const filiereId = searchParams.get('filiere_id');
  const sem = searchParams.get('semestre'); // numeric
  if (!filiereId) return NextResponse.json({ error: 'filiere_id required' }, { status: 400 });

  let query = 'SELECT * FROM modules WHERE filiere_id = ?';
  const params = [filiereId];
  if (sem) {
    query += ' AND semestre = ?';
    params.push(parseInt(sem));
  }
  query += ' ORDER BY nom';
  const [rows] = await pool.query(query, params);
  return NextResponse.json(rows);
}
