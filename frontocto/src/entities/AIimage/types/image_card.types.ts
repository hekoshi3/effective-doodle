import { ReactNode } from "react";
import { GalleryImage } from "./image.types";

export interface ImgCardProps {
    image: GalleryImage;
    statusBadge?: ReactNode;
    index?: number;
}