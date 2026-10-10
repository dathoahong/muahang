import React from 'react';

interface QVNLogoProps {
  className?: string;
  size?: number | string;
}

export const QVNLogo: React.FC<QVNLogoProps> = ({ className = 'w-9 h-9', size }) => {
  return (
    <svg
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-label="Logo QVN"
    >
      <defs>
        {/* Linear gradient matching the blue-to-red corporate identity of QVN */}
        <linearGradient
          id="qvn-logo-gradient"
          x1="55"
          y1="60"
          x2="450"
          y2="460"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#294ba6" />
          <stop offset="28%" stopColor="#3d4fa4" />
          <stop offset="55%" stopColor="#763a7f" />
          <stop offset="78%" stopColor="#c32d56" />
          <stop offset="100%" stopColor="#e7263c" />
        </linearGradient>

        <linearGradient
          id="qvn-swoosh-gradient"
          x1="30"
          y1="220"
          x2="250"
          y2="130"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#2546a1" />
          <stop offset="100%" stopColor="#3d51ab" />
        </linearGradient>
      </defs>

      {/* Main Stylized Letter 'Q' Body */}
      <path
        d="M 230 65 
           C 345 62 445 130 465 240 
           C 480 325 435 410 355 450
           C 310 472 230 460 160 430
           C 105 407 65 365 48 310
           C 43 295 48 285 62 278
           C 74 272 87 278 94 295
           C 112 340 148 382 205 408
           C 275 440 365 425 405 355
           C 438 296 428 200 375 145
           C 325 95 245 85 175 105
           C 152 112 138 102 142 90
           C 146 76 182 66 230 65 Z"
        fill="url(#qvn-logo-gradient)"
      />

      {/* Aerodynamic upper-left dynamic blade/swoosh */}
      <path
        d="M 32 235 
           C 75 180 145 130 250 115 
           C 268 112 272 122 258 128
           C 160 150 95 198 52 252 
           C 44 262 26 248 32 235 Z"
        fill="url(#qvn-swoosh-gradient)"
      />

      {/* Bold bottom-right geometric tail of the Q */}
      <path
        d="M 252 282 
           C 285 272 325 315 360 365
           L 448 418
           L 412 468
           L 326 412
           C 275 380 215 352 252 282 Z"
        fill="url(#qvn-logo-gradient)"
      />

      {/* Inner sharp facet highlight inside the tail fold */}
      <path
        d="M 254 284
           L 302 338
           C 270 354 240 338 254 284 Z"
        fill="#b3294c"
        opacity="0.35"
      />
    </svg>
  );
};
