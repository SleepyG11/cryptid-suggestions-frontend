'use client';

import { useConfirmModal } from '@/components/confirm-modal/Modal';
import Link from 'next/link';
import { ComponentProps } from 'react';

export default function ConfirmProtectedLink(
    props: ComponentProps<typeof Link> & { force?: boolean }
) {
    const { isOpen, setIsShaking } = useConfirmModal();

    return (
        <Link
            {...props}
            onClick={(e) => {
                if (props.force || !isOpen) {
                    props?.onClick?.(e);
                } else {
                    e.preventDefault();
                    setIsShaking(true);
                }
            }}
        />
    );
}
