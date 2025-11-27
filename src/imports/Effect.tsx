export default function Effect() {
  return (
    <div className="relative size-full" data-name="effect">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 460 137">
        <g clipPath="url(#clip0_28_130)" id="effect">
          <rect fill="white" height="137" width="460" />
          <g filter="url(#filter0_d_28_130)" id="Ellipse 7">
            <circle cx="73" cy="69" fill="var(--fill-0, white)" r="12" />
          </g>
          <g filter="url(#filter1_dd_28_130)" id="Ellipse 9">
            <circle cx="31" cy="69" fill="var(--fill-0, white)" r="12" />
          </g>
          <circle cx="31" cy="69" fill="var(--fill-0, white)" id="Ellipse 8" r="12" />
        </g>
        <defs>
          <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="56" id="filter0_d_28_130" width="56" x="45" y="49">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
            <feOffset dy="8" />
            <feGaussianBlur stdDeviation="8" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
            <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_28_130" />
            <feBlend in="SourceGraphic" in2="effect1_dropShadow_28_130" mode="normal" result="shape" />
          </filter>
          <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="120" id="filter1_dd_28_130" width="120" x="-29" y="33">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
            <feOffset dy="24" />
            <feGaussianBlur stdDeviation="24" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.568627 0 0 0 0 0.619608 0 0 0 0 0.670588 0 0 0 0.24 0" />
            <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_28_130" />
            <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
            <feOffset />
            <feGaussianBlur stdDeviation="2" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.568627 0 0 0 0 0.619608 0 0 0 0 0.670588 0 0 0 0.24 0" />
            <feBlend in2="effect1_dropShadow_28_130" mode="normal" result="effect2_dropShadow_28_130" />
            <feBlend in="SourceGraphic" in2="effect2_dropShadow_28_130" mode="normal" result="shape" />
          </filter>
          <clipPath id="clip0_28_130">
            <rect fill="white" height="137" width="460" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}