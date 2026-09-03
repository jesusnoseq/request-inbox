import { fireEvent, render } from '@testing-library/react';
import { vi } from 'vitest';

import { type InboxCallback } from '../../types/inbox';
import CallbackList from './CallbackList';

const callback: InboxCallback = {
    IsEnabled: true,
    IsDynamic: false,
    ToURL: 'https://example.com/original',
    Method: 'POST',
    Headers: { Authorization: 'original' },
    Body: 'original body',
    IsForwardingHeaders: false,
};

const submitAsAgent = (form: HTMLFormElement) => {
    let response: Promise<unknown> | undefined;
    const event = new Event('submit', { bubbles: true, cancelable: true });
    Object.defineProperties(event, {
        agentInvoked: { value: true },
        respondWith: { value: vi.fn((value: Promise<unknown>) => { response = value; }) },
    });
    form.dispatchEvent(event);
    return response;
};

const renderList = (readonly = false) => {
    const props = {
        callbacks: [callback],
        onEdit: vi.fn(),
        onDelete: vi.fn(),
        onUpdate: vi.fn().mockResolvedValue(undefined),
        onDeleteImmediately: vi.fn().mockResolvedValue(undefined),
        onToggleEnabled: vi.fn(),
        readonly,
    };
    return { ...render(<CallbackList {...props} />), props };
};

test('exposes a declarative form that updates the complete callback', async () => {
    const view = renderList();
    const form = view.container.querySelector<HTMLFormElement>('form[toolname="update_request_inbox_callback_0"]');

    expect(form).not.toBeNull();
    expect(form).toHaveAttribute('tooltitle', 'Update Request Inbox Callback 1');
    expect(form).toHaveAttribute('tooldescription');
    expect(form).toHaveAttribute('toolautosubmit');
    for (const name of ['toURL', 'method', 'headers', 'body', 'isEnabled', 'isDynamic', 'isForwardingHeaders']) {
        expect(form!.elements.namedItem(name)).toHaveAttribute('toolparamdescription');
    }

    (form!.elements.namedItem('toURL') as HTMLInputElement).value = 'https://example.com/updated';
    (form!.elements.namedItem('method') as HTMLInputElement).value = 'PUT';
    (form!.elements.namedItem('headers') as HTMLTextAreaElement).value = '{"X-Test":"yes"}';
    (form!.elements.namedItem('body') as HTMLTextAreaElement).value = 'updated body';
    (form!.elements.namedItem('isDynamic') as HTMLInputElement).checked = true;
    (form!.elements.namedItem('isForwardingHeaders') as HTMLInputElement).checked = true;

    const result = await submitAsAgent(form!);

    expect(view.props.onUpdate).toHaveBeenCalledWith(0, {
        IsEnabled: true,
        IsDynamic: true,
        ToURL: 'https://example.com/updated',
        Method: 'PUT',
        Headers: { 'X-Test': 'yes' },
        Body: 'updated body',
        IsForwardingHeaders: true,
    });
    expect(result).toEqual({
        callbackIndex: 0,
        callback: expect.objectContaining({ ToURL: 'https://example.com/updated' }),
    });
});

test('exposes declarative deletion while preserving the confirmation button', async () => {
    const view = renderList();
    const form = view.container.querySelector<HTMLFormElement>('form[toolname="delete_request_inbox_callback_0"]');

    expect(form).not.toBeNull();
    expect(form).toHaveAttribute('tooltitle', 'Delete Request Inbox Callback 1');
    expect(form).toHaveAttribute('tooldescription');
    expect(form).toHaveAttribute('toolautosubmit');

    fireEvent.click(form!.querySelector('button')!);
    expect(view.props.onDelete).toHaveBeenCalledWith(0);
    expect(view.props.onDeleteImmediately).not.toHaveBeenCalled();

    await expect(submitAsAgent(form!)).resolves.toEqual({
        deletedCallbackIndex: 0,
        deletedCallback: callback,
    });
    expect(view.props.onDeleteImmediately).toHaveBeenCalledWith(0);
});

test('does not expose callback mutation tools in readonly mode', () => {
    const view = renderList(true);

    expect(view.container.querySelector('form[toolname^="update_request_inbox_callback_"]')).not.toBeInTheDocument();
    expect(view.container.querySelector('form[toolname^="delete_request_inbox_callback_"]')).not.toBeInTheDocument();
});
