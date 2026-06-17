import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-gold/20 bg-noir mt-20">
      <div className="container py-12 grid md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-display text-xl text-gold-gradient mb-3">ZIYORAT UZ</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{t('tagline')}</p>
        </div>
        <div>
          <h4 className="font-display text-sm text-gold mb-3 uppercase tracking-wider">Sahifalar</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/plan" className="hover:text-gold transition-smooth">{t('nav.plan')}</Link></li>
            <li><Link to="/ziyoratgohlar" className="hover:text-gold transition-smooth">{t('nav.shrines')}</Link></li>
            <li><Link to="/gidlar" className="hover:text-gold transition-smooth">{t('nav.guides')}</Link></li>
            <li><Link to="/about" className="hover:text-gold transition-smooth">{t('nav.about')}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-sm text-gold mb-3 uppercase tracking-wider">Aloqa</h4>
          <p className="text-sm text-muted-foreground">Navoiy, Oʻzbekiston</p>
          <a
            href="https://t.me/ASLONBEK_MUXTOROV"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground mt-1 hover:text-gold transition-smooth block"
          >
            Telegram: @ASLONBEK_MUXTOROV
          </a>
          <a
            href="https://t.me/ziyorat_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground mt-1 hover:text-gold transition-smooth block"
          >
            Telegram bot: @ziyorat_bot
          </a>
        </div>
      </div>
      <div className="border-t border-gold/10 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ZIYORAT UZ. Barcha huquqlar himoyalangan.
      </div>
    </footer>
  );
};
