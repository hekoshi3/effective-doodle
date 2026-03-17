import { ReactNode } from "react";
import { Model } from "./AImodel.types";

export interface CardProps {
    model: Model;
    actionSlot?: ReactNode;
    statusBadge?: ReactNode;
    index?: number;
}