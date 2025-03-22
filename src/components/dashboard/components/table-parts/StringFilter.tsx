'use client';

import { useState } from 'react';
import { Popover } from 'radix-ui';
import styles from './StringFilter.module.scss';

export default function StringFilter({
    defaultValue = '',
    children,
    placeholder = 'Search',
    onChange = () => {},
}: {
    defaultValue?: string;
    children?: React.ReactNode;
    onChange?: (filter: string) => void;
    placeholder?: string;
}) {
    const [search, setSearch] = useState(defaultValue);

    return (
        <Popover.Root
            onOpenChange={(open) => {
                if (!open) {
                    onChange(search);
                }
            }}
        >
            <Popover.Trigger asChild>{children}</Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    align="start"
                    className={styles.PopoverContent}
                >
                    <div className={styles.SearchContainer}>
                        <input
                            value={search}
                            className={styles.SearchInput}
                            type="text"
                            placeholder={placeholder}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button
                            className={styles.ResetButton}
                            onClick={() => {
                                setSearch('');
                            }}
                        >
                            Reset
                        </button>
                    </div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
