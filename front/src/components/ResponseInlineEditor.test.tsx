import { fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import { type InboxResponse } from '../types/inbox';
import ResponseInlineEditor from './ResponseInlineEditor';

const response: InboxResponse = {
  Code: 200,
  CodeTemplate: '',
  Body: 'original body',
  Headers: { 'content-type': 'text/plain' },
  IsDynamic: false,
};

const renderEditor = (onSave = vi.fn()) => {
  const view = render(
    <MemoryRouter>
      <ResponseInlineEditor response={response} onSave={onSave} readonly={false} />
    </MemoryRouter>
  );
  const form = view.container.querySelector<HTMLFormElement>('form[toolname="update_request_inbox"]');
  if (!form) throw new Error('Declarative response form was not rendered.');
  return { ...view, form };
};

const invokeTool = (form: HTMLFormElement) => {
  let responsePromise: Promise<unknown> | undefined;
  const submitEvent = new Event('submit', { bubbles: true, cancelable: true }) as SubmitEvent;
  Object.defineProperties(submitEvent, {
    agentInvoked: { value: true },
    respondWith: { value: vi.fn((value: Promise<unknown>) => { responsePromise = value; }) },
  });
  fireEvent(form, submitEvent);
  return responsePromise;
};

test('exposes response editing as a declarative WebMCP form while visually closed', () => {
  const { form } = renderEditor();

  expect(form).toHaveAttribute('toolname', 'update_request_inbox');
  expect(form).toHaveAttribute('tooltitle', 'Update Request Inbox Response');
  expect(form).toHaveAttribute('toolautosubmit');
  expect(form).toHaveAttribute('tooldescription', expect.stringContaining('persists the status code'));
  expect(form.querySelector('[name="code"]')).toHaveAttribute('toolparamdescription');
  expect(form.querySelector('[name="codeTemplate"]')).toHaveAttribute('toolparamdescription');
  expect(form.querySelector('[name="headers"]')).toHaveAttribute('toolparamdescription');
  expect(form.querySelector('[name="body"]')).toHaveAttribute('toolparamdescription');
  expect(form.querySelector('[name="isDynamic"]')).toHaveAttribute('toolparamdescription');
  expect(form.elements.namedItem('codeTemplate')).toHaveValue('200');
  expect(form).toHaveStyle({ display: 'none' });
});

test('saves and returns values supplied by an agent invocation', async () => {
  const onSave = vi.fn().mockResolvedValue(undefined);
  const { form } = renderEditor(onSave);
  const code = form.elements.namedItem('code') as HTMLInputElement;
  const codeTemplate = form.elements.namedItem('codeTemplate') as HTMLTextAreaElement;
  const headers = form.elements.namedItem('headers') as HTMLTextAreaElement;
  const body = form.elements.namedItem('body') as HTMLTextAreaElement;
  const isDynamic = form.elements.namedItem('isDynamic') as HTMLInputElement;

  code.value = '201';
  codeTemplate.value = '{{ if .Request.Body }}201{{ else }}202{{ end }}';
  headers.value = '{"content-type":"text/html","x-inbox":"hello"}';
  body.value = '<h1>Hello</h1>';
  isDynamic.checked = true;

  const toolResponse = invokeTool(form);

  const expectedResponse: InboxResponse = {
    Code: 201,
    CodeTemplate: '{{ if .Request.Body }}201{{ else }}202{{ end }}',
    Headers: { 'content-type': 'text/html', 'x-inbox': 'hello' },
    Body: '<h1>Hello</h1>',
    IsDynamic: true,
  };
  await expect(toolResponse).resolves.toEqual({
    code: 201,
    codeTemplate: expectedResponse.CodeTemplate,
    headers: expectedResponse.Headers,
    body: expectedResponse.Body,
    isDynamic: true,
  });
  expect(onSave).toHaveBeenCalledWith(expectedResponse);
});

test('does not expose the update tool when the inbox is read-only', () => {
  const view = render(
    <MemoryRouter>
      <ResponseInlineEditor response={response} onSave={vi.fn()} readonly />
    </MemoryRouter>
  );

  expect(view.container.querySelector('form[toolname="update_request_inbox"]')).not.toBeInTheDocument();
});
