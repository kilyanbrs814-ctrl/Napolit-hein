import { useEffect } from "react";
import { LINKS } from "../data/content.js";

const ADDRESS = "16 Avenue Colonel Teyssier, 81000 Albi";
const PHONE = "06 04 65 94 06";

export default function MenuOrderEnhancer() {
  useEffect(() => {
    const removeContact = () => {
      document.querySelectorAll(".nh-menu__chooser-contact").forEach((node) => node.remove());
    };

    const showContact = () => {
      window.setTimeout(() => {
        const modes = document.querySelector(".nh-menu__chooser-modes");
        if (!modes) return;

        removeContact();

        const panel = document.createElement("div");
        panel.className = "nh-menu__chooser-contact";
        panel.innerHTML = `
          <a class="nh-menu__chooser-contact-row" href="${LINKS.tel}">
            <span class="nh-menu__chooser-contact-icon" aria-hidden="true">☎</span>
            <span>
              <strong>Téléphone</strong>
              <small>${PHONE}</small>
            </span>
          </a>
          <a class="nh-menu__chooser-contact-row" href="${LINKS.maps}" target="_blank" rel="noopener noreferrer">
            <span class="nh-menu__chooser-contact-icon" aria-hidden="true">⌖</span>
            <span>
              <strong>Adresse</strong>
              <small>${ADDRESS}</small>
            </span>
          </a>
        `;
        modes.appendChild(panel);
      }, 0);
    };

    const onClick = (event) => {
      const modeButton = event.target.closest?.(".nh-menu__chooser-mode");
      if (modeButton) {
        const label = modeButton.textContent.trim().toLowerCase();
        if (label === "sur place" || label === "à emporter" || label === "a emporter") {
          showContact();
        } else if (label === "livraison") {
          removeContact();
        }
        return;
      }

      if (
        event.target.closest?.(".nh-menu__chooser-close") ||
        event.target.closest?.(".nh-menu__chooser-back") ||
        event.target.classList?.contains("nh-menu__chooser-backdrop")
      ) {
        removeContact();
      }
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <style>{`
      @media (max-width: 860px) {
        .nh-menu__chooser-contact {
          display: grid;
          gap: 8px;
          margin-top: 4px;
          padding-top: 4px;
        }

        .nh-menu__chooser-contact-row {
          display: flex;
          align-items: center;
          gap: 12px;
          min-height: 58px;
          padding: 10px 13px;
          border: 1px solid rgba(255,255,255,.11);
          border-radius: 13px;
          background: rgba(255,255,255,.04);
          color: #fff;
          text-decoration: none;
          font-family: var(--body);
        }

        .nh-menu__chooser-contact-icon {
          width: 34px;
          height: 34px;
          flex: 0 0 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: rgba(255,90,31,.14);
          color: var(--orange);
          font-size: 17px;
        }

        .nh-menu__chooser-contact-row span:last-child {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .nh-menu__chooser-contact-row strong {
          font-size: 13px;
          line-height: 1.2;
          font-weight: 850;
        }

        .nh-menu__chooser-contact-row small {
          color: rgba(224,230,240,.72);
          font-size: 12.5px;
          line-height: 1.35;
        }

        .nh-menu__chooser-delivery {
          gap: 9px !important;
          justify-content: center;
        }

        .nh-menu__chooser-logo-link {
          min-height: 58px !important;
          padding: 9px 12px !important;
          border-radius: 12px !important;
        }

        .nh-menu__chooser-logo {
          max-height: 30px !important;
          max-width: 118px !important;
        }

        @media (max-width: 480px) {
          .nh-menu__chooser-delivery {
            grid-template-columns: 1fr 1fr !important;
          }

          .nh-menu__chooser-logo-link {
            min-height: 56px !important;
            padding: 8px 10px !important;
          }

          .nh-menu__chooser-logo {
            max-height: 27px !important;
            max-width: 105px !important;
          }
        }
      }
    `}</style>
  );
}
