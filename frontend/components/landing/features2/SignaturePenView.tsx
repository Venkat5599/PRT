// Generated from the landing markup by landing-port/gen.py (views.json). Do not edit by hand.
import type { Bind, Kids } from "@/components/landing/bind";

export default function SignaturePenView({ b, k }: { b: Bind; k: Kids }) {
  return (
    <div className={"w-160 h-96 center-x top-68 rounded-14 bg-white features-signature-app"}>
      <div className={"p-10 flex gap-8 border-b border-black/4"}>
        <div className={"w-8 h-8 rounded-full bg-black/12"}></div>
        <div className={"w-8 h-8 rounded-full bg-black/12"}></div>
        <div className={"w-8 h-8 rounded-full bg-black/12"}></div>
      </div>
      <svg fill={"none"} height={"16"} viewBox={"0 0 16 16"} width={"16"} className={"absolute top-54 left-54"} xmlns={"http://www.w3.org/2000/svg"}>
        <rect fill={"#E0E0E0"} height={"2"} rx={"1"} style={{"fill": "color(display-p3 0.8800 0.8800 0.8800)", "fillOpacity": "1"} as React.CSSProperties} transform={"rotate(45 5.17188 3.75781)"} width={"10"} x={"5.17188"} y={"3.75781"}></rect>
        <rect fill={"#E0E0E0"} height={"2"} rx={"1"} style={{"fill": "color(display-p3 0.8800 0.8800 0.8800)", "fillOpacity": "1"} as React.CSSProperties} transform={"rotate(135 12.2422 5.17188)"} width={"10"} x={"12.2422"} y={"5.17188"}></rect>
      </svg>
      <div className={"absolute top-70 left-56 h-2 w-48 rounded-full bg-[#E0E0E0]"}></div>
      <img alt={""} decoding={"async"} height={"103.5"} loading={"lazy"} src={"/assets/images/features/signature/badge.png"} style={{} as React.CSSProperties} width={"89"} className={"lazy-image opacity-0 top-56 -left-28 absolute"} />
      <div className={"top-45 left-68 absolute z-10"}>
        <svg fill={"none"} height={"33"} viewBox={"0 0 36 33"} width={"36"} xmlns={"http://www.w3.org/2000/svg"} {...b("svg", 0, "")}>
          <path d={"M11 21.4987C7.66667 19.832 1 14.9987 1 8.99871C1 1.49871 8 -1.00129 12.5 4.49871C17 9.99871 17.6443 25.5598 12 30.4985C8 33.9985 -4.5 30.9985 13.5 16.9985C33.7865 1.22014 12.5 26.9989 22 21.4987C31.5 15.9985 32 16.9985 31.5 19.4985C31.1 21.4985 33.6667 20.6652 35 19.9985"} stroke={"#888888"} strokeDasharray={"128"} strokeDashoffset={"128"} strokeLinecap={"round"} strokeLinejoin={"round"} strokeWidth={"2"} style={{"stroke": "color(display-p3 0.5335 0.5335 0.5335)", "strokeOpacity": "1"} as React.CSSProperties}></path>
        </svg>
        <div style={{"opacity": "0"} as React.CSSProperties} className={"w-0 h-0 absolute top-0 left-0"} {...b("pen", 0, "w-0 h-0 absolute top-0 left-0")}>
          <img alt={"signature pen"} decoding={"async"} height={"131.5"} loading={"lazy"} src={"/assets/images/features/signature/pen.png"} style={{} as React.CSSProperties} width={"24"} className={"lazy-image opacity-0 -bottom-1 center-x z-10"} />
        </div>
      </div>
      <div className={"overlay features-signature-pen-shadow"}>
        <div className={"top-45 left-68 absolute"}>
          <div style={{"opacity": "0"} as React.CSSProperties} className={"w-0 h-0 absolute top-0 left-0"} {...b("shadow", 0, "w-0 h-0 absolute top-0 left-0")}>
            <div style={{"--background-image-desktop": "url('/assets/images/features/signature/pen-shadow.png')", "--background-image-mobile": "url('/assets/images/features/signature/pen-shadow.png')"} as React.CSSProperties} className={"lazy-background-image lazy-background-image-maskImage opacity-0 -bottom-1 center-x bg-[hsla(0,0%,5%,0.12)] w-24 h-[131.5px]"}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
