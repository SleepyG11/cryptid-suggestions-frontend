import { useConfig, useUpdateConfigMutation } from '@/lib/configs/hooks';
import { Controller, useForm } from 'react-hook-form';
import Modal from '../Modal';

export default function DashboardEditConfigModal({
    configKey,
    onClose,
    onError,
    onSave,
}: {
    configKey: string | null;
    onClose: () => void;
    onSave: (value: string) => void;
    onError: (error: any) => void;
}) {
    const { data } = useConfig(configKey);
    const { trigger, isMutating } = useUpdateConfigMutation(configKey);

    const { control, getValues } = useForm({
        values: {
            value: data?.value,
        },
        defaultValues: {
            value: '',
        },
    });

    function saveConfig() {
        const values = getValues();
        trigger(values.value)
            .then(() => {
                onSave(values.value);
            })
            .catch((error) => {
                onError(error);
            });
    }

    return (
        <Modal
            isOpen={configKey != null && data}
            onClose={() => {
                if (isMutating) return;
                onClose();
            }}
        >
            <Modal.Header>Edit Config</Modal.Header>
            <Modal.Content>
                <Controller
                    control={control}
                    name="value"
                    render={({ field }) => <input type="text" {...field} />}
                />
                <button onClick={saveConfig} disabled={isMutating}>
                    {isMutating ? 'Saving...' : 'Save'}
                </button>
            </Modal.Content>
        </Modal>
    );
}
