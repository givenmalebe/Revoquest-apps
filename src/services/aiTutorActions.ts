/**
 * AI Tutor can perform these actions from chat. Actions are parsed from the model
 * response (e.g. <<ACTIONS>>[...]<</ACTIONS>>) and executed on the frontend.
 */

export type CreateEventAction = {
  type: 'create_event';
  title: string;
  startTime: string; // ISO
  endTime: string;
  description?: string;
  eventType?: 'event' | 'class' | 'meeting' | 'assignment' | 'exam' | 'deadline';
};

export type AddTodoAction = {
  type: 'add_todo';
  title: string;
  description?: string;
  dueDate?: string; // YYYY-MM-DD
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: 'study' | 'assignment' | 'exam' | 'personal' | 'meeting' | 'project' | 'review';
};

export type SwitchTabAction = {
  type: 'switch_tab';
  tab: 'calendar' | 'overview' | 'courses' | 'todos';
};

export type AITutorAction = CreateEventAction | AddTodoAction | SwitchTabAction;

const ACTIONS_REGEX = /<<ACTIONS>>\s*(\[[\s\S]*?\])\s*<<\/ACTIONS>>/;

export function parseActionsFromResponse(response: string): {
  text: string;
  actions: AITutorAction[];
} {
  const match = response.match(ACTIONS_REGEX);
  if (!match) return { text: response.trim(), actions: [] };
  let actions: AITutorAction[] = [];
  try {
    actions = JSON.parse(match[1]) as AITutorAction[];
    if (!Array.isArray(actions)) actions = [];
  } catch {
    // invalid JSON, ignore
  }
  const text = response.replace(ACTIONS_REGEX, '').trim();
  return { text, actions };
}
