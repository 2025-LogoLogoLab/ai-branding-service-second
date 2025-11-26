// src/atoms/Image.tsx
import styles from './ImageBase64.module.css'

type ImageBase64Props = {
    imageData: string;
    alt?: string;
    variant?: 'thumbnail' | 'profile' | 'banner' | 'card' | 'logoImage';
    fetchPriority?: "high" | "low" | "auto";    
};

export function ImageBase64({ imageData, alt = '', variant = 'thumbnail', fetchPriority='high' }: ImageBase64Props) {
    const className = styles[variant];
    return <img src={imageData} alt={alt} className={className} fetchPriority={fetchPriority}/>;
}
