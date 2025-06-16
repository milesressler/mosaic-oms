import {
    Modal,
    Box,
} from "@mantine/core";
import useApi from "src/hooks/useApi";
import showersApi from "src/services/showersApi";
import { CustomerSearchResult } from "src/models/types";
import CustomerSearch from "src/components/customer/CustomerSearch.tsx";

interface Props {
    opened: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const AddToShowerQueueModal = ({ opened, onClose, onSuccess }: Props) => {
    const createReservationApi = useApi(showersApi.createReservation);

    const handleCustomerSelect = async (c: CustomerSearchResult) => {
        const result = await createReservationApi.request({ customerUuid: c.uuid });
        if (result) {
            onSuccess();
            onClose();
        }
    };

    return (
        <Modal opened={opened} onClose={onClose} title="Add to Shower Queue" centered>
           <Box p={'xs'}>
            <CustomerSearch
                onSelect={handleCustomerSelect}
            />
           </Box>
        </Modal>
    );
};

export default AddToShowerQueueModal;
