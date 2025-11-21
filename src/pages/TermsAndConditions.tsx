import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useI18n } from "@/i18n";

const TermsAndConditions = () => {
  const navigate = useNavigate();
  const { t, locale } = useI18n();

  const handleBack = () => {
    // Try to go back, if no history, go to home
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("back")}
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle className="text-3xl">{t("terms_and_conditions")}</CardTitle>
                  <CardDescription className="mt-2">
                    {t("last_updated")}: {new Date().toLocaleDateString()}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', direction: locale === 'ar' ? 'rtl' : 'ltr' }}>
              <section>
                <h2 className="text-2xl font-semibold mb-4">{t("terms_section_1_title")}</h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {t("terms_section_1_content")}
                </p>
              </section>

              <Separator />

              <section>
                <h2 className="text-2xl font-semibold mb-4">{t("terms_section_2_title")}</h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {t("terms_section_2_content")}
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 leading-relaxed">
                  <li>{t("terms_item_1")}</li>
                  <li>{t("terms_item_2")}</li>
                  <li>{t("terms_item_3")}</li>
                  <li>{t("terms_item_4")}</li>
                  <li>{t("terms_item_5")}</li>
                </ul>
              </section>

              <Separator />

              <section>
                <h2 className="text-2xl font-semibold mb-4">{t("terms_section_3_title")}</h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {t("terms_section_3_content")}
                </p>
              </section>

              <Separator />

              <section>
                <h2 className="text-2xl font-semibold mb-4">{t("terms_section_4_title")}</h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {t("terms_section_4_content")}
                </p>
              </section>

              <Separator />

              <section>
                <h2 className="text-2xl font-semibold mb-4">{t("privacy_policy_title")}</h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {t("privacy_policy_content")}
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 leading-relaxed">
                  <li>{t("privacy_item_1")}</li>
                  <li>{t("privacy_item_2")}</li>
                  <li>{t("privacy_item_3")}</li>
                  <li>{t("privacy_item_4")}</li>
                </ul>
              </section>

              <Separator />

              <section>
                <h2 className="text-2xl font-semibold mb-4">{t("contact_us_title")}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t("contact_us_content")}
                </p>
              </section>
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-center">
            <Button onClick={handleBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t("back")}
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsAndConditions;

