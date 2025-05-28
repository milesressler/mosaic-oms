import { useEffect, useRef, useState } from 'react';
import { Modal, Textarea, Button, Group } from '@mantine/core';
import posthog from 'posthog-js';
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

        // let screenshotDataUrl: string | undefined;
        if (modalRef.current) {
            // try {
            //     const canvas = await html2canvas(document.body);
            //     screenshotDataUrl = canvas.toDataURL('image/png');
            // } catch (e) {
            //     console.warn('Screenshot failed', e);
            // }
        }

        posthog.capture('bug_report_submitted', {
            description,
            page: window.location.href,
            userAgent: navigator.userAgent,
            screenSize: `${window.innerWidth}x${window.innerHeight}`,
            consoleErrors: [...recentConsoleErrors],
            appVersion: appVersion || 'unknown',
            // screenshot: screenshotDataUrl,
        });

        setTimeout(() => {
            setSubmitting(false);
            setDescription('');
            onClose();
        }, 800);
    };

    return (
        <Modal opened={opened} onClose={onClose} title="Report a Bug" centered ref={modalRef}>
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
                <Button onClick={handleSubmit} loading={submitting} disabled={!description}>
                    Submit
                </Button>
            </Group>
        </Modal>
    );
}
