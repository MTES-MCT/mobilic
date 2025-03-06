import { FC, ReactNode } from 'react';

export interface NoticeProps {
    className?: string;
    icon?: ReactNode
    src: string;
    alt?: string;
    width?: string;
    height?: string;
    classes?: Partial<Record<"root" | "img">>;
}

declare const Picture: FC<NoticeProps>;
export default Picture;