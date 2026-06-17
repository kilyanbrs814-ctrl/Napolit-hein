import { motion } from "framer-motion";

/**
 * Apparition douce au scroll (remplace le [data-reveal] du design source).
 * Utilise l'IntersectionObserver de Framer Motion -> stable, ne bloque jamais le scroll.
 */
export default function Reveal({ children, className, delay = 0, y = 28, as = "div" }) {
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2, margin: "0px 0px -7% 0px" }}
      transition={{ duration: 0.75, ease: [0.2, 0.7, 0.2, 1], delay }}
    >
      {children}
    </MotionTag>
  );
}
