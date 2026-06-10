import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
    request: Request,
    { params }: { params: { roomCode: string } }
) {
    try {
        const { roomCode } = params;

        const meeting = await prisma.meeting.findUnique({
            where: { roomCode },
        });

        if (!meeting) {
            return NextResponse.json(
                { success: false, error: 'Meeting not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            meeting: {
                id: meeting.id,
                roomCode: meeting.roomCode,
                createdAt: meeting.createdAt,
            },
        });
    } catch (error) {
        console.error('Error fetching meeting:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch meeting' },
            { status: 500 }
        );
    }
}
