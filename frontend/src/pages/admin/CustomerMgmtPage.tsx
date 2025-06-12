import {
    Center,
    Group,
    LoadingOverlay,
    Pagination,
    Table,
    TextInput,
    Select,
    Badge
} from '@mantine/core';
import {IconSearch, IconFlag, IconX} from '@tabler/icons-react';
import { useDebouncedValue } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useApi from 'src/hooks/useApi.tsx';
import customersApi from 'src/services/customersApi.tsx';
import { Customer } from 'src/models/types.tsx';
import { DateTime } from 'luxon';

export default function CustomerManagementPage() {
    const getCustomers = useApi(customersApi.getCustomers);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    /* ---------- query‑param state ---------- */
    const page       = Number(searchParams.get('page')) || 1;
    const nameFilter = searchParams.get('name') || '';
    const flaggedStr = searchParams.get('flagged');        // "true" | "false" | null
    const flagged    = flaggedStr === null ? null : flaggedStr === 'true';

    const [nameSearch, setNameSearch] = useState(nameFilter);
    const [debouncedName] = useDebouncedValue(nameSearch, 500);

    /* ---------- fetch whenever filters change ---------- */
    useEffect(() => {
        getCustomers.request(
            page - 1,
            10,
        {
            name: debouncedName || null,
            flagged
        });
    }, [page, debouncedName, flagged]);

    /* ---------- param helpers ---------- */
    const setPage = (p: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', p.toString());
        setSearchParams(params, { replace: true });
    };

    const setNameParam = (val: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('name', val);
        params.set('page', '1');
        setSearchParams(params, { replace: true });
    };

    const setFlaggedParam = (val: string | null) => {
        const params = new URLSearchParams(searchParams);
        if (val === null) params.delete('flagged');
        else params.set('flagged', val);
        params.set('page', '1');
        setSearchParams(params, { replace: true });
    };

    /* ---------- table rows ---------- */
    const rows = getCustomers.data?.content?.map((c: Customer) => (
        <Table.Tr
            key={c.uuid}
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/customer/${c.uuid}`)}
        >
            <Table.Td>{c.firstName}</Table.Td>
            <Table.Td>{c.lastName}</Table.Td>
            <Table.Td>{c.flagged && <IconFlag color="red" />}</Table.Td>
            <Table.Td>{DateTime.fromMillis(c.created).toLocaleString(DateTime.DATETIME_SHORT)}</Table.Td>
        </Table.Tr>
    ));

    return (
        <>
            <Group m="xs" justify="space-between" wrap="wrap">
                <Group gap="sm">
                    <TextInput
                        placeholder="Search customer name"
                        leftSection={<IconSearch size={16} />}
                        value={nameSearch}
                        onChange={(e) => {
                            setNameSearch(e.currentTarget.value);
                            setNameParam(e.currentTarget.value);
                        }}
                    />

                    <Select
                        data={[
                            { value: 'true',  label: 'Flagged only' },
                            { value: 'false', label: 'Not flagged' }
                        ]}
                        placeholder="Flagged?"
                        clearable
                        value={flaggedStr}
                        onChange={(v) => setFlaggedParam(v)}
                    />

                    {flaggedStr && (
                        <Badge
                            rightSection={
                                <IconX
                                    size={12}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setFlaggedParam(null)}
                                />
                            }
                            variant="outline"
                        >
                            {flaggedStr === 'true' ? 'Flagged only' : 'Not flagged'}
                        </Badge>
                    )}
                </Group>
            </Group>

            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>First</Table.Th>
                        <Table.Th>Last</Table.Th>
                        <Table.Th><IconFlag /></Table.Th>
                        <Table.Th>Created</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
            </Table>

            {1 < (getCustomers.data?.totalPages || 0) && (
                <Center>
                    <Pagination value={page}
                                withEdges={true}
                                onChange={setPage}
                                total={getCustomers.data?.totalPages || 0} />
                </Center>
            )}

            <LoadingOverlay visible={getCustomers.loading} />
        </>
    );
}
