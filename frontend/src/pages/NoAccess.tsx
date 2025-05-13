import {useNavigate} from "react-router-dom";
import {useAuth0} from "@auth0/auth0-react";
import {Stack, Text, Title, Tooltip} from "@mantine/core";
import {useEffect} from "react";
import {IconAt, IconBrandGoogleFilled} from "@tabler/icons-react";

function NoAccessPage() {
    const navigate = useNavigate();
    const { user } = useAuth0();


    useEffect(() => {
        const roles: string[] = user?.["https://mosaic.miles-smiles.us/roles"] ?? [];
        console.log(user);
        if (roles?.length > 0) {
            navigate("/dashboard/taker");
        }
    }, [user]);




    return (
        <>
            <Stack align={'center'}>
                <Title>
                    🚫 No access
                </Title>
                <Text c={'dimmed'}>
                    Sorry, you don’t have any roles assigned yet.
                    Contact administrator to get access to at least one user role
                </Text>
                <Text fw={500}>
                    You’re signed in as {user?.name ?? user?.email} {user?.sub?.startsWith("google") ?
                    <Tooltip label="Google" withArrow><IconBrandGoogleFilled size={'16'}/></Tooltip> :
                    <Tooltip label="Username/password" withArrow><IconAt  size={'16'}/></Tooltip>}
                </Text>
            </Stack>
        </>)}

export default NoAccessPage;
