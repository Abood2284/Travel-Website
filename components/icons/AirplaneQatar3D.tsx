import * as React from "react";

export function AirplaneQatar3D({
  title = "Airplane — Qatar (curvy 3D, long wings)",
  size = 16,
  shadow = true,
  wingReach = 21.2, // increase to push the tips farther out (e.g., 21.8)
  burgundy = "#5C0631",
  showWindows = true,
  ...props
}: React.SVGProps<SVGSVGElement> & {
  title?: string;
  size?: number;
  shadow?: boolean;
  wingReach?: number;
  burgundy?: string;
  showWindows?: boolean;
}) {
  const uid = React.useId();
  const fuseId = `fuse3d-${uid}`;
  const wingId = `wing3d-${uid}`;
  const edgeId = `wingEdge-${uid}`;
  const engineId = `engine-${uid}`;
  const intakeId = `intake-${uid}`;
  const softShadowId = `softShadow-${uid}`;
  const cheatlineId = `cheatline-${uid}`;

  // --- Geometry (24×24 viewBox, light perspective baked in) ---
  // Fuselage: smoother, longer tailcone, fuller nose
  const fuselagePath =
    "M12 2.1 C12.8 2.25 13.35 3.05 13.3 3.95 V8.7 C13.3 9.1 16.95 11.0 18.0 11.8 Q18.55 12.2 18.0 12.6 C16.95 13.4 13.3 15.3 13.3 15.7 V17.0 C14.5 18.3 15.2 19.9 15.1 21.0 Q13.55 20.55 12 20.1 Q10.45 20.55 8.9 21.0 C8.8 19.9 9.5 18.3 10.7 17.0 V15.7 C10.7 15.3 7.05 13.4 6.0 12.6 Q5.45 12.2 6.0 11.8 C7.05 11.0 10.7 9.1 10.7 8.7 V3.95 C10.65 3.05 11.2 2.25 12 2.1 Z";

  // Wings: longer, raked tips (Boeing vibe), subtle taper; mirrored with 24−x symmetry
  const rightWing = `M12.85 10.4 C14.95 10.9 16.9 11.35 18.55 11.7 C${
    wingReach - 0.9
  } 12.0 ${wingReach + 0.25} 12.15 ${wingReach + 0.25} 12.55 C${
    wingReach + 0.25
  } 12.95 ${
    wingReach - 0.9
  } 13.1 18.55 13.4 C16.9 13.75 14.95 14.1 12.85 14.55 C12.95 13.75 13.25 12.95 13.25 12.5 C13.25 12.05 12.95 11.25 12.85 10.4 Z`;
  const rightEdge = `M18.55 13.4 C${wingReach - 0.9} 13.1 ${
    wingReach + 0.25
  } 12.95 ${wingReach + 0.25} 12.55 C${wingReach + 0.25} 12.15 ${
    wingReach - 0.9
  } 12.0 18.55 11.7 L18.85 11.66 C${wingReach - 0.6} 11.9 ${
    wingReach + 0.85
  } 12.2 ${wingReach + 0.85} 12.55 C${wingReach + 0.85} 12.9 ${
    wingReach - 0.6
  } 13.2 18.85 13.44 Z`;

  const leftWing = `M11.15 10.4 C9.05 10.9 7.1 11.35 5.45 11.7 C${
    24 - wingReach + 0.9
  } 12.0 ${24 - (wingReach + 0.25)} 12.15 ${24 - (wingReach + 0.25)} 12.55 C${
    24 - (wingReach + 0.25)
  } 12.95 ${
    24 - wingReach + 0.9
  } 13.1 5.45 13.4 C7.1 13.75 9.05 14.1 11.15 14.55 C11.05 13.75 10.75 12.95 10.75 12.5 C10.75 12.05 11.05 11.25 11.15 10.4 Z`;
  const leftEdge = `M5.45 13.4 C${24 - wingReach + 0.9} 13.1 ${
    24 - (wingReach + 0.25)
  } 12.95 ${24 - (wingReach + 0.25)} 12.55 C${24 - (wingReach + 0.25)} 12.15 ${
    24 - wingReach + 0.9
  } 12.0 5.45 11.7 L5.15 11.66 C${24 - wingReach + 0.6} 11.9 ${
    24 - (wingReach + 0.85)
  } 12.2 ${24 - (wingReach + 0.85)} 12.55 C${24 - (wingReach + 0.85)} 12.9 ${
    24 - wingReach + 0.6
  } 13.2 5.15 13.44 Z`;

  // Horizontal stabilizers (tailplanes)
  const rightHStab =
    "M13.4 16.2 C14.9 16.55 16.2 16.85 17.1 17.1 Q17.45 17.2 17.1 17.4 C16.2 17.75 14.9 18.05 13.4 18.4 C13.45 17.75 13.6 17.15 13.6 16.8 C13.6 16.55 13.5 16.35 13.4 16.2 Z";
  const leftHStab =
    "M10.6 16.2 C9.1 16.55 7.8 16.85 6.9 17.1 Q6.55 17.2 6.9 17.4 C7.8 17.75 9.1 18.05 10.6 18.4 C10.55 17.75 10.4 17.15 10.4 16.8 C10.4 16.55 10.5 16.35 10.6 16.2 Z";

  // Vertical stabilizer (tall swept fin)
  const tailFin =
    "M10.75 17.1 Q12 15.95 13.25 17.1 V20.9 Q12.45 20.5 11.3 20.8 Q10.75 19.35 10.75 17.1 Z";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-label={title}
      shapeRendering="geometricPrecision"
      {...props}
    >
      <title>{title}</title>
      <defs>
        {/* Fuselage metal gradient (no glossy hotspot) */}
        <linearGradient
          id={fuseId}
          x1="0"
          y1="3"
          x2="0"
          y2="21"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#C9CCD0" />
          <stop offset="100%" stopColor="#B8BDBF" />
        </linearGradient>

        {/* Wing top gradient (slight darker trailing edge) */}
        <linearGradient
          id={wingId}
          x1="0"
          y1="11.1"
          x2="0"
          y2="14.6"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#D3D6DA" />
          <stop offset="100%" stopColor="#AEB4B9" />
        </linearGradient>

        {/* Subtle edge darkening for wing leading/trailing feathering */}
        <linearGradient
          id={edgeId}
          x1="0"
          y1="12"
          x2="0"
          y2="14"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#00000000" />
          <stop offset="100%" stopColor="#00000020" />
        </linearGradient>

        {/* Engine body gradient */}
        <linearGradient
          id={engineId}
          x1="0"
          y1="12.0"
          x2="0"
          y2="13.2"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#C2C7CB" />
          <stop offset="100%" stopColor="#A9B0B6" />
        </linearGradient>

        {/* Engine intake (dark interior) */}
        <radialGradient
          id={intakeId}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(0 0) scale(1 1)"
        >
          <stop offset="0%" stopColor="#121417" />
          <stop offset="100%" stopColor="#1E2328" />
        </radialGradient>

        {/* Cheatline gradient so it feels painted, not glowing */}
        <linearGradient
          id={cheatlineId}
          x1="0"
          y1="8"
          x2="0"
          y2="16"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={burgundy} />
          <stop offset="100%" stopColor={burgundy} />
        </linearGradient>

        {shadow && (
          <filter
            id={softShadowId}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feDropShadow
              dx="0"
              dy="0.6"
              stdDeviation="0.6"
              floodOpacity="0.22"
            />
          </filter>
        )}
      </defs>

      {/* Subtle nose-down, right-bank attitude for dynamism */}
      <g
        filter={shadow ? `url(#${softShadowId})` : undefined}
        transform="translate(12 12) rotate(-14) translate(-12 -12)"
      >
        {/* Main wings */}
        <path d={rightWing} fill={`url(#${wingId})`} />
        <path d={rightEdge} fill={`url(#${edgeId})`} />
        <path d={leftWing} fill={`url(#${wingId})`} />
        <path d={leftEdge} fill={`url(#${edgeId})`} />

        {/* Horizontal stabilizers */}
        <path d={rightHStab} fill={`url(#${wingId})`} opacity={0.95} />
        <path d={leftHStab} fill={`url(#${wingId})`} opacity={0.95} />

        {/* Fuselage */}
        <path d={fuselagePath} fill={`url(#${fuseId})`} />

        {/* Belly shading (very subtle, not glossy) */}
        <path
          d="M12 9.2 C14.85 10.45 17.1 11.35 17.8 11.95 Q18.15 12.25 17.8 12.55 C17.0 13.15 14.7 13.7 13.3 14.05 V16.85 C14.15 17.7 14.8 18.85 14.95 19.8 Q13.55 19.45 12 19.1 Z"
          fill="#8f969c"
          opacity=".16"
        />

        {/* Cheatline / livery stripe (no logo) */}
        <path
          d="M10.2 7.9 Q12 8.2 13.8 9.0 Q14.5 9.3 15.9 10.2 Q16.2 10.4 15.9 10.6 Q14.5 11.5 13.8 11.8 Q12 12.6 10.2 12.9 L10.2 11.9 Q11.9 11.55 13.2 10.85 Q11.95 10.3 10.2 9.95 Z"
          fill={`url(#${cheatlineId})`}
          opacity=".95"
        />

        {/* Vertical stabilizer (tail) with Qatar burgundy paint */}
        <path d={tailFin} fill={burgundy} />

        {/* Engines with intake and hint of fans */}
        <g>
          {/* Right engine */}
          <g transform="translate(15.2 12.55)">
            <ellipse
              cx="0"
              cy="0"
              rx="0.95"
              ry="0.78"
              fill={`url(#${engineId})`}
            />
            <ellipse
              cx="0.05"
              cy="0"
              rx="0.65"
              ry="0.55"
              fill={`url(#${intakeId})`}
            />
            <path
              d="M-0.05 -0.45 L0.0 -0.05 L-0.45 0.2"
              fill="#1b1f24"
              opacity=".6"
            />
            <path
              d="M0.55 -0.25 L0.05 -0.05 L0.4 0.35"
              fill="#1b1f24"
              opacity=".6"
            />
          </g>
          {/* Left engine */}
          <g transform="translate(8.8 12.55)">
            <ellipse
              cx="0"
              cy="0"
              rx="0.95"
              ry="0.78"
              fill={`url(#${engineId})`}
            />
            <ellipse
              cx="0.0"
              cy="0"
              rx="0.65"
              ry="0.55"
              fill={`url(#${intakeId})`}
            />
            <path
              d="M-0.05 -0.45 L0.0 -0.05 L-0.45 0.2"
              fill="#1b1f24"
              opacity=".6"
            />
            <path
              d="M0.55 -0.25 L0.05 -0.05 L0.4 0.35"
              fill="#1b1f24"
              opacity=".6"
            />
          </g>
        </g>

        {/* Cockpit (slight angle) */}
        <rect
          x="11.35"
          y="3.85"
          width="1.4"
          height="0.9"
          rx="0.3"
          fill="#0f172a"
          opacity=".95"
          transform="rotate(-6 12.05 4.3)"
        />

        {/* Windows (optional, slightly staggered to imply perspective) */}
        {showWindows && (
          <g fill="#0f172a">
            <circle cx="12" cy="7.55" r="0.33" />
            <circle cx="12" cy="8.85" r="0.33" />
            <circle cx="12.02" cy="10.15" r="0.33" />
            <circle cx="12.04" cy="11.45" r="0.33" />
            <circle cx="12.06" cy="12.75" r="0.33" />
            <circle cx="12.08" cy="14.05" r="0.33" />
          </g>
        )}
      </g>
    </svg>
  );
}
