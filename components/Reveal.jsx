'use client';
import { motion } from 'framer-motion';

const TAGS = { div: motion.div, section: motion.section, article: motion.article };

export default function Reveal({ as = 'div', delay = 0, className = '', style, children, ...rest }) {
  const MotionTag = TAGS[as] || motion.div;
  return (
    <MotionTag
      className={className}
      style={style}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15, margin: '0px 0px -60px 0px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 0.61, 0.36, 1] }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
