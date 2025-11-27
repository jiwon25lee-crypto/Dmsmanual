import imgRectangle1 from "figma:asset/97353ba0a979955e5192a157fea0a9ed99def43b.png";
import imgRectangle2 from "figma:asset/3365021da70d4555ce147b5cabc4c900f7308661.png";

export default function Card() {
  return (
    <div className="relative size-full" data-name="Card">
      <div className="absolute h-[461px] left-0 mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[12.035px] mask-size-[828.77px_601.859px] pointer-events-none rounded-[59px] top-0 w-[767px]" style={{ maskImage: `url('${imgRectangle1}')` }}>
        <div aria-hidden="true" className="absolute inset-0 rounded-[59px]">
          <div className="absolute inset-0 rounded-[59px]" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\\'0 0 767 461\\\' xmlns=\\\'http://www.w3.org/2000/svg\\\' preserveAspectRatio=\\\'none\\\'><rect x=\\\'0\\\' y=\\\'0\\\' height=\\\'100%\\\' width=\\\'100%\\\' fill=\\\'url(%23grad)\\\' opacity=\\\'0.20000000298023224\\\'/><defs><radialGradient id=\\\'grad\\\' gradientUnits=\\\'userSpaceOnUse\\\' cx=\\\'0\\\' cy=\\\'0\\\' r=\\\'10\\\' gradientTransform=\\\'matrix(69.15 41.25 -39.327 65.927 117.5 97)\\\'><stop stop-color=\\\'rgba(165,239,255,1)\\\' offset=\\\'0\\\'/><stop stop-color=\\\'rgba(110,191,244,0.22396)\\\' offset=\\\'0.77083\\\'/><stop stop-color=\\\'rgba(70,144,212,0)\\\' offset=\\\'1\\\'/></radialGradient></defs></svg>')" }} />
          <div className="absolute backdrop-blur-2xl backdrop-filter bg-repeat bg-size-[925.352px_462.676px] bg-top-left inset-0 mix-blend-overlay opacity-[0.08] rounded-[59px]" style={{ backgroundImage: `url('${imgRectangle2}')` }} />
        </div>
        <div aria-hidden="true" className="absolute border-2 border-[#eabfff] border-solid inset-0 rounded-[59px]" />
      </div>
    </div>
  );
}