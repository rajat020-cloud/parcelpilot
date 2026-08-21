import { NextResponse } from 'next/server';
import { PRESET_USERS, UserSession } from '@/lib/auth/security';
import { processAgentQuery } from '@/lib/agent/orchestrator';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query, user_preset } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query parameters missing or invalid' }, { status: 400 });
    }

    const session: UserSession = PRESET_USERS[user_preset] || PRESET_USERS.northstar;
    const response = await processAgentQuery(query, session);

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('API /api/agent/chat error:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error?.message || 'Agent pipeline processing failed',
      },
      { status: 500 }
    );
  }
}
