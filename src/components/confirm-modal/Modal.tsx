'use client';

import classNames from 'classnames';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import styles from './Modal.module.scss';

function replaceWithNull<T>(oldValue: T | null, newValue?: T | null): T | null {
    if (newValue === undefined) return oldValue;
    if (newValue === null) return null;
    return newValue;
}

const context = createContext<{
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
    onConfirm: (() => void) | null;
    onCancel: (() => void) | null;
    update: (
        newState: Partial<{
            isOpen: boolean;
            onConfirm?: (() => void) | null;
            onCancel?: (() => void) | null;
            isDisabled?: boolean;
            isLoading?: boolean;
        }>
    ) => void;
    clear: () => void;
    checkIsTaken: (noShake?: boolean) => boolean;
    isShaking: boolean;
    setIsShaking: (isShaking: boolean) => void;
    isDisabled: boolean;
    setIsDisabled: (isDisabled: boolean) => void;
}>({
    isOpen: false,
    setIsOpen: () => {},
    isLoading: false,
    setIsLoading: () => {},
    onConfirm: null,
    onCancel: null,
    update: () => {},
    clear: () => {},
    checkIsTaken: () => false,
    isShaking: false,
    setIsShaking: () => {},
    isDisabled: false,
    setIsDisabled: () => {},
});

export function ConfirmModalProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [onConfirm, setOnConfirm] = useState<(() => void) | null>(null);
    const [onCancel, setOnCancel] = useState<(() => void) | null>(null);
    const [isShaking, setIsShaking] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false);

    const updateState = useCallback(
        (
            newState: Partial<{
                isOpen: boolean;
                isLoading: boolean;
                onConfirm: (() => void) | null;
                onCancel: (() => void) | null;
                isDisabled: boolean;
            }>
        ) => {
            setIsOpen((s) => newState.isOpen ?? s);
            setIsLoading((s) => newState.isLoading ?? s);
            setIsDisabled((s) => newState.isDisabled ?? s);
            setOnConfirm((s) => replaceWithNull(s, newState.onConfirm));
            setOnCancel((s) => replaceWithNull(s, newState.onCancel));
        },
        []
    );

    const clearState = useCallback(() => {
        setIsOpen(false);
        setOnConfirm(() => {});
        setOnCancel(() => {});
        setIsDisabled(false);
        setIsLoading(false);
        setIsShaking(false);
    }, []);

    const checkIsTaken = useCallback(
        (noShake?: boolean) => {
            if (isOpen) {
                if (!noShake) {
                    setIsShaking(true);
                }
                return true;
            }
            return false;
        },
        [isOpen]
    );

    return (
        <context.Provider
            value={{
                isOpen,
                setIsOpen,
                isLoading,
                setIsLoading,
                onConfirm,
                onCancel,
                update: updateState,
                clear: clearState,
                checkIsTaken,
                isShaking,
                setIsShaking,
                isDisabled,
                setIsDisabled,
            }}
        >
            {children}
        </context.Provider>
    );
}

export function useConfirmModal() {
    return useContext(context);
}

export function ConfirmModal() {
    const modalRef = useRef<HTMLDivElement>(null);
    const {
        isOpen,
        onConfirm,
        onCancel,
        isLoading,
        isShaking,
        setIsShaking,
        isDisabled,
    } = useConfirmModal();

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

    const canBeOpen = isOpen && onCancel && onConfirm;

    return (
        <div
            className={classNames(styles.Container, {
                [styles.Opened]: canBeOpen,
                [styles.Loading]: isLoading,
            })}
        >
            <div
                className={classNames(styles.Modal, {
                    [styles.Shaking]: isShaking && canBeOpen,
                })}
                ref={modalRef}
            >
                <div className={styles.Text}>You have unsaved changes!</div>
                <div className={styles.Actions}>
                    <button
                        onClick={() => canBeOpen && onCancel()}
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => canBeOpen && onConfirm()}
                        disabled={isLoading || isDisabled}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}
