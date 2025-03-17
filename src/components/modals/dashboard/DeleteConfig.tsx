'use client';

import { useDeleteConfigMutation } from '@/lib/configs/hooks';
import Modal from '../Modal';

export default function DashboardEditConfigModal({
    configKey,
    onClose,
    onError,
    onDelete,
}: {
    configKey: string | null;
    onClose: () => void;
    onDelete: () => void;
    onError: (error: any) => void;
}) {
    const { trigger, isMutating } = useDeleteConfigMutation(configKey);

    function deleteConfig() {
        trigger()
            .then(() => {
                onDelete();
            })
            .catch((error) => {
                onError(error);
            });
    }

    return (
        <Modal
            isOpen={configKey != null}
            onClose={() => {
                if (isMutating) return;
                onClose();
            }}
        >
            <Modal.Header>Delete Config</Modal.Header>
            <Modal.Content>
                <p>
                    Are you sure you want to delete config{' '}
                    <code>{configKey}</code>?
                </p>
                <button onClick={deleteConfig} disabled={isMutating}>
                    {isMutating ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => onClose()} disabled={isMutating}>
                    Cancel
                </button>
            </Modal.Content>
        </Modal>
    );
}
