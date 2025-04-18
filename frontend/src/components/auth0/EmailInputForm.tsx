import { useForm } from '@mantine/form';
import { TextInput, Button, Group, Box } from '@mantine/core';

interface EmailInputFormProps {
    onSubmit: (email: string, name: string) => void
    loading: boolean
}

interface EmailInputValues {
    email: string,
    name: string
}
const EmailInputForm = ({ onSubmit, loading }: EmailInputFormProps) => {
    const form = useForm<EmailInputValues>({
        initialValues: {
            email: '',
            name: '',
        },
        validate: {
            name: (value) => (value ?? '').length > 0 ? null : 'Name is required',
            email: (value) =>
                /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(value)
                    ? null
                    : 'Invalid email',
        },
    });
    const handleSubmit = (values: EmailInputValues) => {
        if (form.isValid()) {
            onSubmit(values.email, values.name)
        }
    };

    return (
        <Box  mx="auto">
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <TextInput
                    label="Name"
                    placeholder="Bob Smith"
                    {...form.getInputProps('name')}
                    required
                />
                <TextInput
                    label="Email Address"
                    placeholder="user@domain.com"
                    {...form.getInputProps('email')}
                    type={'email'}
                    required
                />
                <Group justify={'flex-end'} mt="md">
                    <Button loading={loading} type="submit">Send Invitation</Button>
                </Group>
            </form>
        </Box>
    );
};

export default EmailInputForm;
