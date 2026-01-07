import { useState } from 'react';
import {
    Container,
    Group,
    Select,
    Text,
    Badge,
} from '@mantine/core';
import ReportingPOC from '../ReportingPOC';
import ReportingPOC2 from '../ReportingPOC2';
import ReportingPOC3 from '../ReportingPOC3';
import ReportingPOC4 from '../ReportingPOC4';
import ReportingPOC5 from '../ReportingPOC5';

const pocVersions = [
    { value: 'v1', label: 'v1 - Classic Analysis', description: 'Multi-dimensional with attribute filtering' },
    { value: 'v2', label: 'v2 - Datadog Style', description: 'Progressive disclosure with tree views' },
    { value: 'v3', label: 'v3 - Time Series', description: 'Trend analysis with period comparison' },
    { value: 'v4', label: 'v4 - System Operations', description: 'System-wide operational metrics' },
    { value: 'v5', label: 'v5 - Advanced Analytics', description: 'ML/predictive analytics dashboard' },
];

export function ReportsNext() {
    const [selectedVersion, setSelectedVersion] = useState('v1');

    const renderPOC = () => {
        switch (selectedVersion) {
            case 'v1':
                return <ReportingPOC />;
            case 'v2':
                return <ReportingPOC2 />;
            case 'v3':
                return <ReportingPOC3 />;
            case 'v4':
                return <ReportingPOC4 />;
            case 'v5':
                return <ReportingPOC5 />;
            default:
                return <ReportingPOC />;
        }
    };

    const currentPOC = pocVersions.find(p => p.value === selectedVersion);

    return (
        <>
            {/* Minimal version selector */}
            <Container size="xl" py="xs">
                <Group justify="flex-end" mb="sm">
                    <Group gap="xs">
                        <Text size="sm" c="dimmed">Version:</Text>
                        <Select
                            size="sm"
                            value={selectedVersion}
                            onChange={(value) => setSelectedVersion(value || 'v1')}
                            data={pocVersions}
                            w={200}
                        />
                        <Badge size="sm" variant="light" color="gray">
                            {currentPOC?.description}
                        </Badge>
                    </Group>
                </Group>
            </Container>
            
            {/* Render selected POC */}
            {renderPOC()}
        </>
    );
}

export default ReportsNext;