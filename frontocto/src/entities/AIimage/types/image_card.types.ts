import { ReactNode } from "react";
import { GalleryImage } from "./image.types";

export interface ImgCardProps {
    image: GalleryImage;
    actionSlot?: ReactNode;
    statusBadge?: ReactNode;
    index?: number;
}