import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { ArrowRight, ArrowLeft, Shield, FileText, AlertCircle, CreditCard } from 'lucide-react';

const Terms = () => {
  const { t, language, dir } = useLanguage();
  const ArrowIcon = language === 'ar' ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary">
            {language === 'ar' ? 'صفحتي' : 'Safhati'}
          </Link>
          <Button variant="outline" asChild>
            <Link to="/auth" className="flex items-center gap-2">
              <ArrowIcon className="w-4 h-4" />
              {t('common.back')}
            </Link>
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {t('terms.title')}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('terms.readCarefully')}
          </p>
        </div>

        <div className="space-y-8">
          {/* Section 1 */}
          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">{t('terms.serviceNature')}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground leading-relaxed">
              <p>{t('terms.serviceNatureDesc')}</p>
            </CardContent>
          </Card>

          {/* Section 2 */}
          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">{t('terms.subscription')}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground leading-relaxed">
              <p>{t('terms.subscriptionDesc')}</p>
            </CardContent>
          </Card>

          {/* Section 3 */}
          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">{t('terms.privacy')}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground leading-relaxed">
              <p>{t('terms.privacyDesc')}</p>
            </CardContent>
          </Card>

          {/* Section 4 */}
          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <AlertCircle className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">{t('terms.disclaimer')}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground leading-relaxed">
              <p>{t('terms.disclaimerDesc')}</p>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="bg-muted/50 border-2 border-primary/30">
            <CardHeader>
              <CardTitle className="text-xl text-center">{t('terms.summary')}</CardTitle>
            </CardHeader>
            <CardContent className="text-foreground leading-relaxed">
              <p className="text-center font-medium">{t('terms.summaryDesc')}</p>
            </CardContent>
          </Card>

          {/* Back Button */}
          <div className="text-center pt-8">
            <Button size="lg" asChild>
              <Link to="/auth">{t('terms.backToRegister')}</Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 {language === 'ar' ? 'صفحتي' : 'Safhati'} - {t('terms.allRights')}</p>
        </div>
      </footer>
    </div>
  );
};

export default Terms;