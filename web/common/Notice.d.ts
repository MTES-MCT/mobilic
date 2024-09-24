// toto.d.ts
import { CSSProperties, FC, ReactNode } from 'react';
import { SxProps } from '@material-ui/system';

export interface NoticeProps {
    className?: string;
    title?: ReactNode;
    description?: ReactNode;
    type?: "info" | "warning" | "success";
    size?: "small" | "normal";
    classes?: Partial<Record<"root" | "title" | "description" | "link" | "container", string>>;
    linkUrl?: string;
    linkText?: string;
    style?: CSSProperties;
    sx?: SxProps;
}

declare const Notice: FC<NoticeProps>;
export default Notice;