import styles from './FeatureCard.module.css';
import { Image } from '../../atoms/Image/Image';
import { CardButton } from '../../atoms/CardButton/CardButton';

type FeatureCardProps = {
    imageSrc: string;
    imageAlt?: string;
    title: string;
    description: string;
    buttonLabel: string;
    onButtonClick: () => void;
};

export function FeatureCard({
    imageSrc,
    imageAlt = '',
    title,
    description,
    buttonLabel,
    onButtonClick,
}: FeatureCardProps) {
    return (
        <div className={styles.card}>
            <div className={styles.content}>
                <h3 className={styles.title}>{title}</h3>
                <p className={styles.description}>{description}</p>
            </div>
            <div className={styles.imageWrapper}>
                <Image src={imageSrc} alt={imageAlt} variant="card" />
            </div>
            <CardButton label={buttonLabel} onClick={onButtonClick} />
        </div>
    );
}
