import { NextResponse } from 'next/server';
import { PRESET_USERS, UserSession } from '@/lib/auth/security';
import { confirm_action } from '@/lib/tools';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action_id, decision, user_preset } = body;

    if (!action_id || !decision) {
      return NextResponse.json({ error: 'Action ID and decision required' }, { status: 400 });
    }

    const session: UserSession = PRESET_USERS[user_preset] || PRESET_USERS.support_agent;
    const result = confirm_action(action_id, decision as 'CONFIRM' | 'CANCEL', session);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API /api/actions/confirm error:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error?.message || 'Failed to process action confirmation',
      },
      { status: 500 }
    );
  }
}
