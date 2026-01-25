import { useEffect, useRef, useState } from 'react';
import { Modal, Textarea, Button, Group, TextInput } from '@mantine/core';
import posthog from 'posthog-js';
import bugReportApi from '../../services/bugReportApi';
// import html2canvas from 'html2canvas';

type Props = {
    opened: boolean;
    onClose: () => void;
    appVersion?: string;
};

const recentConsoleErrors: string[] = [];
const MAX_ERRORS = 5;

// Monkey-patch console.error
if (typeof window !== 'undefined' && !(console as any)._patchedForPostHog) {
    const original = console.error;
    console.error = (...args) => {
        if (recentConsoleErrors.length >= MAX_ERRORS) recentConsoleErrors.shift();
        recentConsoleErrors.push(args.map(String).join(' '));
        original(...args);
    };
    (console as any)._patchedForPostHog = true;
}

export function BugReportModal({ opened, onClose, appVersion }: Props) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (opened) {
            posthog.startSessionRecording?.();
        }
    }, [opened]);

    const handleSubmit = async () => {
        setSubmitting(true);

        try {
            // Step 1: Create bug report in backend first
            const response = await bugReportApi.createBugReport({
                title,
                description,
            });

            const bugUuid = response.data.uuid;

            // Step 2: Submit to PostHog with bug UUID reference
            posthog.capture('bug_report_submitted', {
                bugUuid,
                title,
                description,
                page: window.location.href,
                userAgent: navigator.userAgent,
                screenSize: `${window.innerWidth}x${window.innerHeight}`,
                consoleErrors: [...recentConsoleErrors],
                appVersion: appVersion || 'unknown',
            });

            setTimeout(() => {
                setSubmitting(false);
                setTitle('');
                setDescription('');
                onClose();
            }, 800);
        } catch (error) {
            console.error('Failed to submit bug report:', error);
            setSubmitting(false);
        }
    };

    return (
        <Modal opened={opened} onClose={onClose} title="Report a Bug" centered ref={modalRef}>
            <TextInput
                label="Bug title"
                placeholder="Brief summary of the issue..."
                value={title}
                onChange={(e) => setTitle(e.currentTarget.value)}
                required
                mb="md"
            />
            <Textarea
                label="What went wrong?"
                placeholder="Describe the issue..."
                value={description}
                onChange={(e) => setDescription(e.currentTarget.value)}
                autosize
                minRows={4}
                required
            />
            <Group mt="md" justify="flex-end">
                <Button variant="default" onClick={onClose} disabled={submitting}>
                    Cancel
                </Button>
                <Button onClick={handleSubmit} loading={submitting} disabled={!title || !description}>
                    Submit
                </Button>
            </Group>
        </Modal>
    );
}
