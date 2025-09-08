import React, { useMemo, useState } from "react";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
import Modal from "../../../common/Modal";
import { fr } from "@codegouvfr/react-dsfr";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useCompanyCertification } from "../../../common/hooks/useCompanyCertification";

function getEmbeddedCodes(companyBadgeUrl) {
  if (!companyBadgeUrl) return { iframe: "", image: "", script: "" };

  const altText = "Certificat Mobilic de l'entreprise";

  return {
    iframe: `<iframe src="${companyBadgeUrl}" width="150" height="150" frameborder="0" style="border: none;" title="${altText}"></iframe>`,

    image: `<img src="${companyBadgeUrl}" alt="${altText}" width="150" height="150" />`,

    html: `<a href="https://mobilic.beta.gouv.fr" target="_blank" rel="noopener">
  <img src="${companyBadgeUrl}" alt="${altText}" width="150" height="150" />
</a>`
  };
}

export default function CertificateBadgeEmbedModal({
  open,
  onClose,
  companyWithInfo
}) {
  const [copiedCode, setCopiedCode] = useState("");

  const { companyBadgeUrl } = useCompanyCertification(
    companyWithInfo.currentCompanyCertification
  );

  const embedCodes = getEmbeddedCodes(companyBadgeUrl);

  const copyToClipboard = async code => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(""), 2000);
    } catch (err) {
      console.error("Erreur lors de la copie :", err);
    }
  };

  const createCodeBlock = (code, language) => (
    <div>
      <SyntaxHighlighter
        language={language}
        style={oneLight}
        customStyle={{
          margin: 0,
          borderRadius: "0.25rem",
          fontSize: "13px",
          border: "1px solid #e3e3e3"
        }}
        showLineNumbers={false}
        wrapLines={true}
      >
        {code}
      </SyntaxHighlighter>
      <Button
        priority="secondary"
        size="small"
        className={cx(fr.cx("fr-mt-2w"))}
        onClick={() => copyToClipboard(code)}
      >
        {copiedCode === code ? "Copié !" : "Copier le code"}
      </Button>
    </div>
  );

  const tabsData = useMemo(
    () => [
      {
        tabId: "iframe",
        label: "IFrame",
        content: createCodeBlock(embedCodes.iframe, "html")
      },
      {
        tabId: "script",
        label: "Html",
        content: createCodeBlock(embedCodes.html, "html")
      },
      {
        tabId: "image",
        label: "Image",
        content: createCodeBlock(embedCodes.image, "html")
      }
    ],
    [embedCodes, createCodeBlock]
  );

  return (
    <Modal
      open={open}
      handleClose={onClose}
      title="Valorisez votre certificat Mobilic sur votre site internet"
      centerTitle={true}
      content={
        <div className={cx(fr.cx("fr-p-4w"))}>
          <div className={cx(fr.cx("fr-mb-4w"))}>
            <p className={cx(fr.cx("fr-mb-3w"))}>
              Intégrez ce certificat sur votre site internet et mettez en
              évident votre engagement pour le respect de la réglementation
              sociale auprès de vos salariés, vos clients ou vos donneurs
              d'ordre.
            </p>

            <Alert
              severity="info"
              title="Documentation complète disponible"
              description={
                <span>
                  Consultez notre{" "}
                  <a
                    href="https://faq.mobilic.beta.gouv.fr/usages-et-fonctionnement-de-mobilic-gestionnaire/comment-afficher-le-certificat-sur-mon-site-internet"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cx(fr.cx("fr-link"))}
                  >
                    guide d'intégration détaillé
                  </a>{" "}
                  pour plus d'options de personnalisation et de bonnes
                  pratiques.
                </span>
              }
            />
          </div>

          <div className={cx(fr.cx("fr-mb-4w"))}>
            <h3 className={cx(fr.cx("fr-h6", "fr-mb-2w"))}>
              Choisissez votre mode d'intégration
            </h3>
            <Tabs tabs={tabsData} />
          </div>

          <div className={cx(fr.cx("fr-mb-4w"))}>
            <h3 className={cx(fr.cx("fr-h6", "fr-mb-2w"))}>Aperçu du badge</h3>
            <div
              style={{
                border: "1px solid #ddd",
                padding: "24px",
                borderRadius: "4px",
                backgroundColor: "#f9f9f9",
                textAlign: "center"
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {companyBadgeUrl ? (
                  <img
                    src={companyBadgeUrl}
                    alt={"Certificat Mobilic de l'entreprise"}
                    style={{
                      width: "250px",
                      height: "200px",
                      maxWidth: "100%",
                      objectFit: "contain"
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "250px",
                      height: "200px",
                      backgroundColor: "#fff",
                      border: "1px solid #ccc",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "4px",
                      fontSize: "16px",
                      maxWidth: "100%"
                    }}
                  >
                    Badge Mobilic
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={cx(fr.cx("fr-btns-group", "fr-btns-group--right"))}>
            <Button priority="secondary" onClick={onClose}>
              Fermer
            </Button>
          </div>
        </div>
      }
    />
  );
}
