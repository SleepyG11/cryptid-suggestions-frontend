'use client';

import { createRole } from '@/lib/roles/actions';
import useMutation from 'swr/mutation';

export default function CreateRole() {
    const { trigger, isMutating } = useMutation(
        '/roles',
        (key: string, { arg }: { arg: any }) => createRole(arg.name, arg.color),
        {
            populateCache: false,
            revalidate: true,
        }
    );

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);

                console.log(formData.get('name'), formData.get('color'));

                trigger({
                    name: formData.get('name') as string,
                    color: parseInt(
                        (formData.get('color') as string).slice(1),
                        16
                    ),
                });
            }}
            style={{
                opacity: isMutating ? 0.5 : 1,
                pointerEvents: isMutating ? 'none' : 'auto',
            }}
        >
            <h2>Create Role</h2>
            <input type="text" name="name" />
            <input type="color" name="color" />
            <button type="submit" disabled={isMutating}>
                {isMutating ? 'Creating...' : 'Create'}
            </button>
        </form>
    );
}
