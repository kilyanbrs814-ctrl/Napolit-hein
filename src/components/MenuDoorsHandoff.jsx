/**
 * MenuDoorsHandoff — scène de transition entre la section 05 (Menu) et la section 06 (Commander).
 *
 * Principe identique au Hero → Build :
 *   - Ce composant joue le rôle de .nh-hero : conteneur grand avec stage sticky.
 *   - DoorsSection joue le rôle de .nh-hero-handoff : sibling qui monte par-dessus.
 *
 * Structure de scroll :
 *   MenuSection       ← section normale, scroll libre
 *   MenuDoorsHandoff  ← zone de scroll dédiée (2× --mdhf-size)
 *     └─ .nh-mdhf__stage  ← position:sticky; top:0; height:--mdhf-size (fond pincé)
 *   DoorsSection      ← margin-top: calc(-1 * --mdhf-size); z-index:21
 *                        → entre dans le viewport depuis le bas pendant que le stage est pincé
 */
import "../styles/menuDoorsHandoff.css";

export default function MenuDoorsHandoff() {
  return (
    <div className="nh-mdhf" aria-hidden="true">
      <div className="nh-mdhf__stage" />
    </div>
  );
}
