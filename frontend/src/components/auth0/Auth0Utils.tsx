export const getRolesFromAuth0User: (user: any) => string[] = (user: any) => {
    return user?.['https://mosaic.miles-smiles.us/roles']?.map((role: string) => role.toLowerCase()) || [];
}
