// @ts-nocheck - Supabase generic types cause issues with type inference
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: templates, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    console.error('[Templates API] Error fetching templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }

  return NextResponse.json({ templates: templates || [] });
}

export async function POST(request: Request) {
  const supabase = createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { template_type, subject, body: templateBody } = body;

    if (!template_type || !subject || !templateBody) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Upsert template (insert or update if exists)
    const { data, error } = await supabase
      .from('email_templates')
      .upsert(
        {
          user_id: user.id,
          template_type,
          subject,
          body: templateBody,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,template_type',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('[Templates API] Error saving template:', error);
      return NextResponse.json({ error: 'Failed to save template' }, { status: 500 });
    }

    return NextResponse.json({ template: data });
  } catch (error) {
    console.error('[Templates API] Error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const supabase = createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const template_type = searchParams.get('type');

    if (!template_type) {
      return NextResponse.json(
        { error: 'Missing template type' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('user_id', user.id)
      .eq('template_type', template_type);

    if (error) {
      console.error('[Templates API] Error deleting template:', error);
      return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Templates API] Error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

