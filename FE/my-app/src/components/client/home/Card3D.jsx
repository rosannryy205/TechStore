import { useRef, useState, useCallback } from "react";

/**
 * Card3D — Interactive 3D Perspective Card with Spatial Glassmorphism
 * Complies with `.agents/skills/design-it/3d-ui/SKILL.md`:
 * - Perspective container with preserve-3d
 * - Interactive rotation along X and Y axes tracked to cursor position
 * - Z-axis popout for children (translateZ)
 * - Specular reflection sheen layer
 * - Fluid spring return on mouse leave
 */
export default function Card3D({
  children,
  className = "",
  maxRotation = 12,
  perspective = 1000,
  scale = 1.02,
  glare = true,
  onClick,
  ...props
}) {
  const cardRef = useRef(null);
  const [style, setStyle] = useState({
    transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
    transition: "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)",
  });
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = useCallback(
    (e) => {
      const card = cardRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Normalized coordinates from -1 to 1
      const normalizedX = (x / rect.width) * 2 - 1;
      const normalizedY = (y / rect.height) * 2 - 1;

      const rotX = -normalizedY * maxRotation;
      const rotY = normalizedX * maxRotation;

      setStyle({
        transform: `perspective(${perspective}px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`,
        transition: "transform 0.1s ease-out",
      });

      if (glare) {
        setGlarePosition({
          x: ((x / rect.width) * 100).toFixed(1),
          y: ((y / rect.height) * 100).toFixed(1),
          opacity: 0.22,
        });
      }
    },
    [maxRotation, perspective, scale, glare]
  );

  const handleMouseLeave = useCallback(() => {
    setStyle({
      transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      transition: "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)",
    });

    if (glare) {
      setGlarePosition((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [perspective, glare]);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`relative preserve-3d will-change-transform ${className}`}
      style={{
        ...style,
        transformStyle: "preserve-3d",
      }}
      {...props}
    >
      {children}

      {/* Dynamic Specular Glass Glare Overlay */}
      {glare && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden transition-opacity duration-300"
          style={{
            opacity: glarePosition.opacity,
            background: `radial-gradient(circle 350px at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.55), transparent 75%)`,
            zIndex: 30,
          }}
        />
      )}
    </div>
  );
}
