'use client';

import Link from 'next/link';
import { ComponentProps } from 'react';
import { useConfirmState } from '@/lib/confirm-queue/context';

export default function ConfirmProtectedLink(
    props: ComponentProps<typeof Link> & { force?: boolean }
) {
    const { isEmpty } = useConfirmState();

    return (
        <Link
            {...props}
            onClick={(e) => {
                if (props.force || isEmpty()) {
                    props?.onClick?.(e);
                } else {
                    e.preventDefault();
                }
            }}
        />
    );
}
