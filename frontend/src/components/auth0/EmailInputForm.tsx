import { useForm } from '@mantine/form';
import { TextInput, Button, Group, Box } from '@mantine/core';

interface EmailInputFormProps {
    onSubmit: (email: string) => void
    loading: boolean
}
const EmailInputForm = ({ onSubmit, loading }: EmailInputFormProps) => {
    const form = useForm({
        initialValues: {
            email: '',
        },
        validate: {
            email: (value) =>
                /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(value)
                    ? null
                    : 'Invalid email',
        },
    });
    const handleSubmit = (values) => {
        if (form.isValid()) {
            onSubmit(values.email)
        }
    };

    return (
        <Box sx={{ maxWidth: 300 }} mx="auto">
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <TextInput
                    label="Email Address"
                    placeholder="user@domain.com"
                    {...form.getInputProps('email')}
                />
                <Group position="right" mt="md">
                    <Button loading={loading} type="submit">Send Invitation</Button>
                </Group>
            </form>
        </Box>
    );
};

export default EmailInputForm;
