import { withAuthenticationRequired } from "@auth0/auth0-react";
import {LoadingOverlay} from "@mantine/core";

interface AuthenticationGuardProps {
    component: React.ComponentType<any>;
}
export const AuthenticationGuard: React.FC<AuthenticationGuardProps>  = ({ component }) => {
    const Component = withAuthenticationRequired(component, {
        onRedirecting: () => (
            <div className="page-layout">
                <LoadingOverlay></LoadingOverlay>
            </div>
        ),
    });

    return <Component />;
};
