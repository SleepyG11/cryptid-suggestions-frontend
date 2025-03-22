'use client';

import styles from './Sidebar.module.scss';
import { usePathname } from 'next/navigation';
import classNames from 'classnames';

// -----------

const SidebarRoot: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    className,
    ...props
}) => {
    return <div className={classNames(styles.Root, className)} {...props} />;
};
SidebarRoot.displayName = 'Sidebar.Root';

const SidebarColumn: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    className,
    ...props
}) => {
    return <div className={classNames(styles.Column, className)} {...props} />;
};
SidebarColumn.displayName = 'Sidebar.Column';

// -----------

const SidebarSeparator: React.FC<React.HTMLAttributes<HTMLHRElement>> = ({
    className,
    ...props
}) => {
    return (
        <hr className={classNames(styles.Separator, className)} {...props} />
    );
};
SidebarSeparator.displayName = 'Sidebar.Separator';

// -----------

const SidebarTop: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    className,
    ...props
}) => {
    return <div className={classNames(styles.Top, className)} {...props} />;
};
SidebarTop.displayName = 'Sidebar.Top';

// -----------

const SidebarCenter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    className,
    ...props
}) => {
    return <div className={classNames(styles.Center, className)} {...props} />;
};
SidebarCenter.displayName = 'Sidebar.Center';
// -----------

const SidebarBottom: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    className,
    ...props
}) => {
    return <div className={classNames(styles.Bottom, className)} {...props} />;
};
SidebarBottom.displayName = 'Sidebar.Bottom';
// -----------

const SidebarGroup: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    className,
    ...props
}) => {
    return <div className={classNames(styles.Group, className)} {...props} />;
};
SidebarGroup.displayName = 'Sidebar.Group';

const SidebarGroupTitle: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    className,
    ...props
}) => {
    return (
        <div className={classNames(styles.GroupTitle, className)} {...props} />
    );
};
SidebarGroupTitle.displayName = 'Sidebar.GroupTitle';

const SidebarGroupItems: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    className,
    ...props
}) => {
    return (
        <div className={classNames(styles.GroupItems, className)} {...props} />
    );
};
SidebarGroupItems.displayName = 'Sidebar.GroupItems';

const SidebarGroupItem: React.FC<
    React.HTMLAttributes<HTMLSpanElement> & {
        activePathnameRegex?: RegExp;
    }
> = ({ activePathnameRegex, className, ...props }) => {
    const pathname = usePathname();
    const isActive = activePathnameRegex && pathname.match(activePathnameRegex);

    return (
        <span
            className={classNames(
                styles.GroupItem,
                isActive && styles.Active,
                className
            )}
            {...props}
        />
    );
};
SidebarGroupItem.displayName = 'Sidebar.GroupItem';

// -----------

export {
    SidebarRoot as Root,
    SidebarColumn as Column,
    SidebarSeparator as Separator,
    SidebarTop as Top,
    SidebarCenter as Center,
    SidebarGroup as Group,
    SidebarGroupTitle as GroupTitle,
    SidebarGroupItems as GroupItems,
    SidebarGroupItem as GroupItem,
    SidebarBottom as Bottom,
};
