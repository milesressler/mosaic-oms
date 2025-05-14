import { withAuthenticationRequired, useAuth0 } from "@auth0/auth0-react";
import { LoadingOverlay } from "@mantine/core";
import { Navigate } from "react-router-dom";

interface AuthenticationGuardProps {
    component: React.ComponentType<any>;
}
export const AuthenticationGuard: React.FC<AuthenticationGuardProps> = ({
                                                                            component: ProtectedComponent,
                                                                        }) => {

    const { user } = useAuth0();
    // wrap an inline component in the HOC so we can pull user out of context
    const Wrapped = withAuthenticationRequired(
        ({ ...props }) => {
            // adjust the claim name to whatever you configured in Auth0
            const roles: string[] = user?.["https://mosaic.miles-smiles.us/roles"] ?? [];

            console.log(roles);
            // if they’re authenticated but have no roles, kick them to /access
            if (roles.length === 0) {
                return <Navigate to="/access" replace />;
            }

            // otherwise render the thing they actually wanted
            return <ProtectedComponent {...props} />;
        },
        {
            onRedirecting: () => (
                <div className="page-layout">
                    <LoadingOverlay visible />
                </div>
            ),
        }
    );

    return <Wrapped />;
};
