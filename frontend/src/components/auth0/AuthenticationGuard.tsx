import { withAuthenticationRequired } from "@auth0/auth0-react";

interface AuthenticationGuardProps {
    component: React.ComponentType<any>;
}
export const AuthenticationGuard: React.FC<AuthenticationGuardProps>  = ({ component }) => {
    const Component = withAuthenticationRequired(component, {
        onRedirecting: () => (
            <div className="page-layout">
                <div>Loading...</div>
            </div>
        ),
    });

    return <Component />;
};
