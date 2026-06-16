import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

function getPrisma() {
    if ((globalThis as any).__prisma) return (globalThis as any).__prisma as PrismaClient;
    (globalThis as any).__prisma = new PrismaClient();
    return (globalThis as any).__prisma as PrismaClient;
}

export async function POST() {
    try {
        const prisma = getPrisma();
        const roomCode = crypto.randomUUID().substring(0, 8).toUpperCase();

        const meeting = await prisma.meeting.create({
            data: {
                roomCode,
            },
        });

        return NextResponse.json({
            success: true,
            meeting: {
                id: meeting.id,
                roomCode: meeting.roomCode,
            },
        });
    } catch (error) {
        console.error('Error creating meeting:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create meeting' },
            { status: 500 }
        );
    }
}
