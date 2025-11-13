'use client';

import { useEffect, useState } from 'react';
import { TemplateEditor } from '@/components/templates/TemplateEditor';
import type { ReminderType } from '@/lib/email/templates';

interface EmailTemplate {
  id: string;
  user_id: string;
  template_type: ReminderType;
  subject: string;
  body: string;
  created_at: string;
  updated_at: string;
}

const TEMPLATE_TYPES: ReminderType[] = ['day_7', 'day_14', 'day_21', 'pre_reminder'];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('[Templates] Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (type: ReminderType, subject: string, body: string) => {
    const response = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        template_type: type,
        subject,
        body,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save template');
    }

    // Refresh templates
    await fetchTemplates();
  };

  const handleReset = async (type: ReminderType) => {
    const response = await fetch(`/api/templates?type=${type}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to reset template');
    }

    // Refresh templates
    await fetchTemplates();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Email Templates</h1>
          <p className="text-sm text-slate-500">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Email Templates</h1>
        <p className="text-sm text-slate-500">
          Customize the email messages sent to your clients for each reminder type
        </p>
      </div>

      <div className="space-y-6">
        {TEMPLATE_TYPES.map((type) => {
          const template = templates.find((t) => t.template_type === type);
          return (
            <TemplateEditor
              key={type}
              type={type}
              initialSubject={template?.subject}
              initialBody={template?.body}
              onSave={handleSave}
              onReset={handleReset}
            />
          );
        })}
      </div>
    </div>
  );
}

