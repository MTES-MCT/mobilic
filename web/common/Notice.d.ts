// toto.d.ts
import { FC, ReactNode } from 'react';

export interface NoticeProps {
    className?: string;
    title?: ReactNode;
    description?: ReactNode;
    type?: "info" | "warning" | "success";
    size?: "small" | "normal";
    classes?: Partial<Record<"root" | "title" | "description" | "link", string>>;
    linkUrl?: string;
    linkText?: string;
    style?: CSSProperties;
}

declare const Notice: FC<NoticeProps>;
export default Notice;