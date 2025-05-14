import { useState } from 'react';
import { Button, Modal, Textarea, Group } from '@mantine/core';
import { useForm } from '@mantine/form';

const CancelOrderButton = ({ onCancel }: any) => {
    const [modalOpened, setModalOpened] = useState(false);
    const form = useForm({
        initialValues: {
            comment: '',
        },
    });

    const handleCancel = (values) => {
        // Call the onCancel function passed as a prop with the comment
        onCancel(values.comment);
        // Close the modal
        setModalOpened(false);
        // Reset the form
        form.reset();
    };

    return (
        <div>
            <Button color="red" onClick={() => setModalOpened(true)}>
                Cancel Order
            </Button>

            <Modal
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                title="Cancel Order"
            >
                <form onSubmit={form.onSubmit(handleCancel)}>
                    <Textarea
                        label="Optional Comment"
                        placeholder="Enter a comment (optional)"
                        {...form.getInputProps('comment')}
                    />

                    <Group justify="right" mt="md">
                        <Button type="submit" color="red">
                            Confirm Cancel
                        </Button>
                        <Button variant="outline" onClick={() => setModalOpened(false)}>
                            Cancel
                        </Button>
                    </Group>
                </form>
            </Modal>
        </div>
    );
};

export default CancelOrderButton;
