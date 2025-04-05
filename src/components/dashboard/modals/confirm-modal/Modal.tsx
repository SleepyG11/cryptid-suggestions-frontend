'use client';

import classNames from 'classnames';
import { useEffect, useRef } from 'react';
import styles from './Modal.module.scss';
import { useConfirmState } from '@/lib/confirm-queue/context';

export function ConfirmModal() {
    const {
        isDisabled,
        isLoading,
        isOpen,
        isShaking,
        setIsShaking,
        confirm,
        cancel,
    } = useConfirmState();
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleAnimationEnd = () => {
            setIsShaking(false);
        };
        modalRef.current?.addEventListener('animationend', handleAnimationEnd);
        return () => {
            modalRef.current?.removeEventListener(
                'animationend',
                handleAnimationEnd
            );
        };
    }, [setIsShaking]);

    return (
        <div
            className={classNames(styles.Container, {
                [styles.Opened]: isOpen,
                [styles.Loading]: isLoading,
            })}
        >
            <div
                className={classNames(styles.Modal, {
                    [styles.Shaking]: isShaking,
                })}
                ref={modalRef}
            >
                <div className={styles.Text}>You have unsaved changes!</div>
                <div className={styles.Actions}>
                    <button onClick={() => cancel()} disabled={isLoading}>
                        Cancel
                    </button>
                    <button
                        onClick={() => confirm()}
                        disabled={isLoading || isDisabled}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}
