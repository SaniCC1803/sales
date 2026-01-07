import type { ReactNode } from "react";
import { Separator } from "./ui/separator";

interface CardGridProps {
    title: string;
    children: ReactNode;
}

const CardGrid = ({ title, children }: CardGridProps) => {
    return (
        <section className="container flex flex-col gap-5">
            <h2 className="text-2xl font-bold text-center sm:text-left">
                {title}
            </h2>
            <Separator orientation="horizontal" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {children}
            </div>
        </section>
    );
};

export default CardGrid;
