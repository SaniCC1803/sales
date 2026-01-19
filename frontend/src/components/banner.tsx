import type { Application } from '../types/application';
import { useLanguage } from '@/context/LanguageContext';

type BannerProps = {
  application: Application;
};

export default function Banner({ application }: BannerProps) {
  const { language } = useLanguage();

  return (
    <section className="relative w-full h-64 md:h-96 bg-neutral-200 flex items-center justify-center">
      <img
        src="https://t4.ftcdn.net/jpg/04/66/25/33/360_F_466253361_c4fAjCqVZD4L2boH8vfqjUbUYk0wLcP7.jpg"
        alt="Banner"
        className="absolute w-full h-full object-cover"
      />
      <div className="relative z-10 text-white text-center">
        <h2 className="text-4xl md:text-6xl font-bold drop-shadow-lg">
          {application.translations.find((t) => t.language === language)?.name}
        </h2>
        <p className="mt-2 text-lg md:text-2xl drop-shadow-md">
          {application.translations.find((t) => t.language === language)?.description}
        </p>
      </div>
    </section>
  );
}
