import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sem = searchParams.get('semestre');
  if (sem) {
    // For automne: fetch filieres with semestre=sem
    // For printemps: sem is even (2,4,6), base is odd (1,3,5)
    const s = parseInt(sem);
    const base = s % 2 === 0 ? s - 1 : s;
    const [rows] = await pool.query(
      'SELECT * FROM filieres WHERE semestre = ? ORDER BY short_base',
      [base]
    );
    // Attach the correct short for this semestre
    const result = rows.map(f => ({
      ...f,
      short_display: getShortForSem(f.short_base, s)
    }));
    return NextResponse.json(rows);
  }
  const [rows] = await pool.query('SELECT * FROM filieres ORDER BY semestre, short_base');
  return NextResponse.json(rows);
}

function getShortForSem(shortBase, targetSem) {
  // PC1 with targetSem=2 -> PC2
  const base = shortBase.replace(/\d+$/, '');
  return base + targetSem;
}
