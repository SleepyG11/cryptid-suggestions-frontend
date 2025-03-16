'use client';

import { createContext, useContext, useMemo } from 'react';
import styles from './Modal.module.scss';
import ReactModal from 'react-modal';

const context = createContext<{
    isOpen: boolean;
    onClose: () => void;
}>({
    isOpen: false,
    onClose: () => {},
});

export default function Modal({
    children,
    isOpen,
    onClose,
}: {
    children: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
}) {
    const contextValue = useMemo(
        () => ({ isOpen, onClose }),
        [isOpen, onClose]
    );

    return (
        <context.Provider value={contextValue}>
            <ReactModal
                isOpen={isOpen}
                onRequestClose={() => {
                    onClose();
                }}
                overlayClassName={styles.Overlay}
                style={{
                    content: {
                        top: '50%',
                        left: '50%',
                        right: 'auto',
                        bottom: 'auto',
                        marginRight: '-50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: 'transparent',
                        border: 'none',
                    },
                }}
                shouldCloseOnOverlayClick={false}
                ariaHideApp={false}
            >
                <div className={styles.Modal}>{children}</div>
            </ReactModal>
        </context.Provider>
    );
}
Modal.Header = function ModalHeader({
    children,
}: {
    children: React.ReactNode;
}) {
    const { onClose } = useContext(context);

    return (
        <div className={styles.Header}>
            <div className={styles.HeaderContent}>{children}</div>
            <button className={styles.Close} onClick={onClose}>
                x
            </button>
        </div>
    );
};
Modal.Content = function ModalContent({
    children,
}: {
    children: React.ReactNode;
}) {
    return <div className={styles.Content}>{children}</div>;
};
