type CardsWrapperProps = {
  children: React.ReactNode;
};

export function CardsWrapper({ children }: CardsWrapperProps) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">{children}</div>;
}
