import React from "react";
import { motion } from "framer-motion";

const loadingContainer: React.CSSProperties = {
  width: "2rem",
  height: "1.6rem",
  display: "flex",
  justifyContent: "space-around"
};

const loadingCircle: React.CSSProperties = {
  display: "block",
  width: "0.5rem",
  height: "0.5rem",
  backgroundColor: "black",
  borderRadius: "0.25rem"
};

const loadingContainerVariants: {
  start: { transition: { staggerChildren: number } };
  end: { transition: { staggerChildren: number } };
} = {
  start: {
    transition: {
      staggerChildren: 0.2
    }
  },
  end: {
    transition: {
      staggerChildren: 0.2
    }
  }
};

const loadingCircleVariants: {
  start: { y: string };
  end: { y: string };
} = {
  start: {
    y: "20%"
  },
  end: {
    y: "200%"
  }
};

const loadingCircleTransition: {
  duration: number;
  repeat: number;
  ease: string;
} = {
  duration: 0.8,
  repeat: Infinity,
  ease: "easeInOut"
};

const ThreeDotsWave: React.FC = () => {
  return (
    <motion.div
      style={loadingContainer}
      variants={loadingContainerVariants}
      initial="start"
      animate="end"
    >
      <motion.span
        style={loadingCircle}
        variants={loadingCircleVariants}
        transition={loadingCircleTransition}
      />
      <motion.span
        style={loadingCircle}
        variants={loadingCircleVariants}
        transition={loadingCircleTransition}
      />
      <motion.span
        style={loadingCircle}
        variants={loadingCircleVariants}
        transition={loadingCircleTransition}
      />
    </motion.div>
  );
};

export default ThreeDotsWave;
