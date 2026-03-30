import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const annee = searchParams.get('annee');
  if (!annee) return NextResponse.json({ error: 'annee required' }, { status: 400 });
  await pool.query(
    `INSERT IGNORE INTO sessions (nom, type, annee) VALUES (?, 'automne', ?), (?, 'printemps', ?)`,
    [`Automne ${annee}`, annee, `Printemps ${annee}`, annee]
  );
  const [rows] = await pool.query('SELECT * FROM sessions WHERE annee = ? ORDER BY id', [annee]);
  return NextResponse.json(rows);
}
