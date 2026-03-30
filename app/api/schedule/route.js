import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');
  const filiereId = searchParams.get('filiere_id');
  if (!sessionId || !filiereId) return NextResponse.json({ error: 'params required' }, { status: 400 });
  const [rows] = await pool.query(
    `SELECT p.id, p.jour, p.periode, m.code as module_code, m.nom as module_nom
     FROM planning p JOIN modules m ON p.module_id = m.id
     WHERE p.session_id = ? AND m.filiere_id = ? ORDER BY p.jour, p.periode`,
    [sessionId, filiereId]
  );
  return NextResponse.json(rows);
}

export async function POST(request) {
  try {
    const { session_id, filiere_id, schedule } = await request.json();
    await pool.query(
      `DELETE p FROM planning p JOIN modules m ON p.module_id = m.id WHERE p.session_id = ? AND m.filiere_id = ?`,
      [session_id, filiere_id]
    );
    if (schedule && schedule.length > 0) {
      const values = schedule.map(s => [s.module_id, session_id, s.jour, s.periode]);
      await pool.query('INSERT INTO planning (module_id, session_id, jour, periode) VALUES ?', [values]);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
