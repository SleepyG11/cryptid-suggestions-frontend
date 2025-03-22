'use client';

import { faXmark } from '@fortawesome/pro-regular-svg-icons';
import styles from './SidePanel.module.scss';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ConfirmProtectedLink from './ConfirmProtectedLink';
import { ComponentProps } from 'react';

type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

const SidePanelRoot: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    className,
    ...props
}) => {
    return <div className={classNames(styles.Root, className)} {...props} />;
};
SidePanelRoot.displayName = 'SidePanel.Root';

const SidePanelTitle: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    className,
    ...props
}) => {
    return <div className={classNames(styles.Title, className)} {...props} />;
};
SidePanelTitle.displayName = 'SidePanel.Title';

const SidePanelContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    className,
    ...props
}) => {
    return <div className={classNames(styles.Content, className)} {...props} />;
};
SidePanelContent.displayName = 'SidePanel.Content';

const SidePanelCloseButton: React.FC<
    Optional<ComponentProps<typeof Link>, 'href'>
> = ({ className, href, ...props }) => {
    const router = useRouter();
    return (
        <ConfirmProtectedLink
            href={href ?? '.'}
            className={classNames(styles.CloseButton, className)}
            {...props}
            onClick={(e) => {
                e.preventDefault();
                router.back();
            }}
        >
            <FontAwesomeIcon icon={faXmark} />
        </ConfirmProtectedLink>
    );
};
SidePanelCloseButton.displayName = 'SidePanel.CloseButton';

export {
    SidePanelRoot as Root,
    SidePanelContent as Content,
    SidePanelTitle as Title,
    SidePanelCloseButton as CloseButton,
};
