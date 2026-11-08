import {useAuth0} from "@auth0/auth0-react";

export const getRolesFromAuth0User: (user: any) => string[] = (user: any) => {
    return user?.['https://mosaic.miles-smiles.us/roles']?.map((role: string) => role.toLowerCase()) || [];
}

/** True when the signed-in user has the admin role. UI hint only; the API enforces it. */
export const useIsAdmin = (): boolean => {
    const {user} = useAuth0();
    return getRolesFromAuth0User(user).includes('admin');
}
