import svgPaths from "./svg-put9otlln5";
import { imgContainer } from "./svg-ophtg";

function Container() {
  return (
    <div className="absolute h-[72px] left-[5px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-5px_-6px] mask-size-[258px_84px] top-[6px] w-[248px]" data-name="Container" style={{ maskImage: `url('${imgContainer}')` }}>
      <div className="absolute inset-[-8.33%_-2.42%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 260 84">
          <g id="Container">
            <mask height="72" id="mask0_11_1264" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="248" x="6" y="6">
              <rect fill="var(--fill-0, #D9D9D9)" height="72" id="Rounded Background" rx="36" width="248" x="6" y="6" />
            </mask>
            <g mask="url(#mask0_11_1264)">
              <foreignObject height="154" width="374.62" x="-39.25" y="-35">
                <div style={{ backdropFilter: "blur(4px)", clipPath: "url(#bgblur_0_11_1264_clip_path)", height: "100%", width: "100%" }} xmlns="http://www.w3.org/1999/xhtml" />
              </foreignObject>
              <g data-figma-bg-blur-radius="8" id="Ellipse 7">
                <path d={svgPaths.p213f71f0} fill="var(--fill-0, black)" fillOpacity="0.1" style={{ mixBlendMode: "overlay" }} />
              </g>
            </g>
          </g>
          <defs>
            <clipPath id="bgblur_0_11_1264_clip_path" transform="translate(39.25 35)">
              <path d={svgPaths.p213f71f0} />
            </clipPath>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute contents left-0 top-0" data-name="Container">
      <div className="absolute backdrop-blur-[45px] backdrop-filter bg-[rgba(84,84,84,0.1)] h-[84px] left-0 mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px] mask-size-[258px_84px] rounded-[42px] top-0 w-[258px]" data-name="Rounded Background" style={{ maskImage: `url('${imgContainer}')` }} />
      <Container />
      <div className="absolute blur-sm filter h-[84px] left-0 mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px] mask-size-[258px_84px] mix-blend-multiply rounded-[42px] top-0 w-[258px]" data-name="Rounded Background" style={{ maskImage: `url('${imgContainer}')` }}>
        <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.8)] border-solid inset-0 pointer-events-none rounded-[42px]" />
      </div>
      <div className="absolute blur-[1.5px] filter h-[84px] left-0 mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px] mask-size-[258px_84px] rounded-[42px] top-0 w-[258px]" data-name="Rounded Background" style={{ maskImage: `url('${imgContainer}')` }}>
        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.8)] border-solid inset-[-0.5px] pointer-events-none rounded-[42.5px]" />
      </div>
      <div className="absolute blur-[1.5px] filter h-[84px] left-0 mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px] mask-size-[258px_84px] rounded-[42px] top-0 w-[258px]" data-name="Rounded Background" style={{ maskImage: `url('${imgContainer}')` }}>
        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.2)] border-solid inset-[-0.5px] pointer-events-none rounded-[42.5px]" />
      </div>
    </div>
  );
}

function Command() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="Command">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="Command">
          <path d={svgPaths.pfb8b200} id="Icon" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
        </g>
      </svg>
    </div>
  );
}

function IconAndLabel() {
  return (
    <div className="content-stretch flex flex-col gap-[3px] items-center relative shrink-0 w-[48px]" data-name="Icon and Label">
      <Command />
      <div className="flex flex-col font-['SF_Pro:Medium',sans-serif] font-[510] justify-center leading-[0] relative shrink-0 text-[14px] text-center text-nowrap text-white" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[22px] whitespace-pre">Command</p>
      </div>
    </div>
  );
}

function IconAndLabel1() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0.1)] box-border content-stretch flex gap-[10px] h-[72px] items-center left-[6px] pb-[6px] pt-[8px] px-[36px] rounded-[46px] top-[6px] w-[120px]" data-name="Icon and Label">
      <IconAndLabel />
    </div>
  );
}

function Inbox() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="Inbox">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="Inbox">
          <path d={svgPaths.peebd700} id="Icon" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
        </g>
      </svg>
    </div>
  );
}

function IconAndLabel2() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[3px] items-center left-[145px] top-[16px] w-[76px]" data-name="Icon and Label">
      <Inbox />
      <div className="flex flex-col font-['SF_Pro:Medium',sans-serif] font-[510] justify-center leading-[0] min-w-full relative shrink-0 text-[14px] text-center text-white w-[min-content]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[22px]">Inbox</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute contents left-0 top-0" data-name="Container">
      <Container1 />
      <IconAndLabel1 />
      <IconAndLabel2 />
    </div>
  );
}

export default function Container3() {
  return (
    <div className="bg-[rgba(255,255,255,0.01)] relative rounded-[174px] size-full" data-name="Container">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <div className="absolute backdrop-blur-[2px] backdrop-filter bg-[rgba(255,255,255,0.01)] h-[132px] left-[calc(50%+0.5px)] top-1/2 translate-x-[-50%] translate-y-[-50%] w-[325px]" data-name="Rounded Background" />
        <Container2 />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.4)] border-solid inset-0 pointer-events-none rounded-[174px]" />
    </div>
  );
}