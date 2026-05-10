import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import oracledb from 'oracledb';

export async function GET(request: Request) {
  try {
    // Ambil parameter URL untuk paginasi
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Kalkulasi offset (data yang dilewati)
    const offset = (page - 1) * limit;

    const conn = await getConnection();

    // Query untuk menghitung total seluruh data NCAGE_RECORDS
    const countResult: any = await conn.execute(
      `SELECT COUNT(*) AS TOTAL FROM "SYSTEM"."NCAGE_RECORDS"`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const totalRecords = countResult.rows[0].TOTAL;
    const totalPages = Math.ceil(totalRecords / limit);

    // Query untuk mengambil data dengan Paginasi
    const dataResult: any = await conn.execute(
      `SELECT "NCAGE_CODE", "ENTITY_NAME" 
       FROM "SYSTEM"."NCAGE_RECORDS" 
       ORDER BY "NCAGE_CODE" ASC 
       OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
      {
        offset: offset,
        limit: limit
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    await conn.close();

    // Transformasi nama kolom dari Oracle (biasanya uppercase) ke camelCase yang diharapkan Frontend
    const formattedData = dataResult.rows.map((row: any) => ({
      ncageCode: row.NCAGE_CODE,
      entityName: row.ENTITY_NAME
    }));

    return NextResponse.json({
      success: true,
      data: formattedData,
      currentPage: page,
      totalPages: totalPages,
      totalRecords: totalRecords
    });

  } catch (err) {
    console.error("Error ncage-list:", err);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat mengambil daftar NCAGE" },
      { status: 500 }
    );
  }
}