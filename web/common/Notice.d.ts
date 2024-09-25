// toto.d.ts
import { CSSProperties, FC, ReactNode } from 'react';
import { SxProps } from '@material-ui/system';

export interface NoticeProps {
    className?: string;
    title?: ReactNode;
    description?: ReactNode;
    type?: "info" | "warning" | "success" | "error";
    size?: "small" | "normal";
    classes?: Partial<Record<"root" | "title" | "description" | "link" | "container", string>>;
    linkUrl?: string;
    linkText?: string;
    isFullWidth?: boolean;
    style?: CSSProperties;
    sx?: SxProps;
    onClose?:()=>void;
}

declare const Notice: FC<NoticeProps>;
export default Notice;