import {Loader, Stack, TextInput} from "@mantine/core";
import {IconExclamationCircle} from "@tabler/icons-react";
import {useEffect, useState} from "react";
import CustomerResultCard from "src/forms/CustomerResultCard.tsx";
import {useDebouncedValue} from "@mantine/hooks";
import useApi from "src/hooks/useApi.tsx";
import customersApi from "src/services/customersApi.tsx";
import {CustomerSearchResult} from "src/models/types.tsx";

interface props {
    onSelect?: (customer: CustomerSearchResult) => void;
    onSelectCreate?: (firstName: string, lastName: string) => void;
}

const CustomerSearch  = ({onSelect, onSelectCreate}: props) => {
    const [searchString, setSearchString] = useState('');

    const [debouncedSearch] = useDebouncedValue(searchString, 300);
    const searchCustomersApi = useApi(customersApi.search);

    const handleCreateNew = () => {
        const [first, ...rest] = searchString.split(" ")
        const last = rest.length > 0? rest.join(" ") : '';
        onSelectCreate && onSelectCreate(first, last);
    }

    const handleCustomerSelect = (c: CustomerSearchResult) => {
        onSelect && onSelect(c);
    }


    useEffect(() => {
        if (debouncedSearch) {
            searchCustomersApi.request(debouncedSearch);
        }
    }, [debouncedSearch, searchCustomersApi.request]);

        return (<Stack>
            <TextInput
                label=""
                id={'customerSearchInput'}
                placeholder="Search for Customer"
                rightSection={searchCustomersApi.loading ? <Loader size="sm" /> : searchCustomersApi.error ? <IconExclamationCircle color={'orange'}/> : null}
                value={searchString}
                size={'lg'}
                onChange={(event) => setSearchString(event.currentTarget.value)}
            />

            <Stack gap="xs" style={{ maxHeight: 400}}>

                { onSelectCreate && searchString && <CustomerResultCard key={'newUser'} useAlternateStyle={true} text={'Create "' + searchString + '"'} onClick={handleCreateNew}/> }
                {(
                    searchString && searchCustomersApi.data && searchCustomersApi.data?.map((c: CustomerSearchResult) =>
                        <CustomerResultCard key={c.uuid}
                                            flagged={c.flagged}
                                            text={`${c.firstName || ''} ${c.lastName || ''}`.trim()}
                                            onClick={() => handleCustomerSelect(c)}
                        />)
                )}
            </Stack>
        </Stack>
        );
}

export default CustomerSearch;
