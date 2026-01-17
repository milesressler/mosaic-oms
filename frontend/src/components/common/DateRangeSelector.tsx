import React from 'react';
import { Group, Select, Button } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';

export interface DateRangeParams {
    range?: string;
    startDate?: string;
    endDate?: string;
}

interface DateRangeSelectorProps {
    dateRange: string;
    customDateRange: [Date | null, Date | null];
    onDateRangeChange: (range: string) => void;
    onCustomDateRangeChange: (dates: [Date | null, Date | null]) => void;
    onRefresh?: () => void;
    showRefreshButton?: boolean;
}

export function DateRangeSelector({
    dateRange,
    customDateRange,
    onDateRangeChange,
    onCustomDateRangeChange,
    onRefresh,
    showRefreshButton = true
}: DateRangeSelectorProps) {
    const thisYear = new Date().getFullYear();
    
    // Helper function to get the most recent Sunday
    const getMostRecentSunday = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const diff = d.getDate() - day;
        return new Date(d.setDate(diff));
    };
    
    // Helper function to format date for display
    const formatDateRange = (startDate: Date) => {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${monthNames[startDate.getMonth()]} ${startDate.getDate()}`;
    };
    
    // Get available date range options
    const getDateRangeOptions = () => {
        const today = new Date();
        const thisWeekStart = getMostRecentSunday(today);
        const lastWeekStart = new Date(thisWeekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);
        
        return [
            { value: 'thisweek', label: `This Week (${formatDateRange(thisWeekStart)})` },
            { value: 'lastweek', label: `Last Week (${formatDateRange(lastWeekStart)})` },
            { value: '6weeks', label: '6 Weeks' },
            { value: '3months', label: '3 Months' },
            { value: '6months', label: '6 Months' },
            { value: '1year', label: '1 Year (12 months)' },
            { value: `thisyear`, label: `This year (${thisYear})` },
            { value: `lastyear`, label: `Last Year (${thisYear-1})` },
            { value: 'custom', label: 'Custom Range' },
        ];
    };

    // Helper function to convert current state to API params
    const getDateRangeParams = (): DateRangeParams => {
        const params: DateRangeParams = { range: dateRange };
        
        if (dateRange === 'custom' && customDateRange[0] && customDateRange[1]) {
            params.startDate = customDateRange[0].toISOString().split('T')[0];
            params.endDate = customDateRange[1].toISOString().split('T')[0];
        }
        
        return params;
    };

    return (
        <>
            <Group align="flex-end">
                <Select
                    value={dateRange}
                    onChange={(value) => onDateRangeChange(value || '6weeks')}
                    data={getDateRangeOptions()}
                    w={200}
                />
                {showRefreshButton && onRefresh && (
                    <Button variant="light" size="sm" onClick={onRefresh}>
                        Refresh
                    </Button>
                )}
            </Group>

            {/* Custom Date Range (only when needed) */}
            {dateRange === 'custom' && (
                <Group mb="lg" justify="flex-end">
                    <DatePickerInput
                        type="range"
                        label="Custom Date Range"
                        value={customDateRange}
                        onChange={onCustomDateRangeChange}
                        clearable
                        w={250}
                    />
                </Group>
            )}
        </>
    );
}

// Export the utility function for getting params
export { DateRangeSelector as default };

// Helper hook for managing date range state
export function useDateRangeState(defaultRange: string = '6weeks') {
    const [dateRange, setDateRange] = React.useState<string>(defaultRange);
    const [customDateRange, setCustomDateRange] = React.useState<[Date | null, Date | null]>([null, null]);
    
    const getDateRangeParams = (): DateRangeParams => {
        const params: DateRangeParams = { range: dateRange };
        
        if (dateRange === 'custom' && customDateRange[0] && customDateRange[1]) {
            params.startDate = customDateRange[0].toISOString().split('T')[0];
            params.endDate = customDateRange[1].toISOString().split('T')[0];
        }
        
        return params;
    };
    
    return {
        dateRange,
        customDateRange,
        setDateRange,
        setCustomDateRange,
        getDateRangeParams
    };
}