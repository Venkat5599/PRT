// Generated from the landing markup by landing-port/gen.py (views.json). Do not edit by hand.
import type { Bind, Kids } from "@/components/landing/bind";

export default function AutoUpgradeView({ b, k }: { b: Bind; k: Kids }) {
  return (
    <div className={"w-full left-0 absolute select-none top-0 h-full"}>
      <div className={"overlay !top-16 md:!top-40"}>
        <div data-version={"5"} className={"features-auto-app rounded-14 md:rounded-20 overflow-hidden inset-x-16 md:inset-x-40 absolute top-0 transition-all"} {...b("app", 0, "features-auto-app rounded-14 md:rounded-20 overflow-hidden inset-x-16 md:inset-x-40 absolute top-0 transition-all")}>
          <div className={"py-10 px-15 flex items-center border-b overflow-hidden features-auto-app-header"}>
            <div className={"flex gap-10 mr-16"}>
              <div className={"w-10 h-10 rounded-full features-auto-app-header-icon"}></div>
              <div className={"w-10 h-10 rounded-full features-auto-app-header-icon"}></div>
              <div className={"w-10 h-10 rounded-full features-auto-app-header-icon"}></div>
            </div>
            <div className={"flex items-center text-12/20 font-[500] mr-8 -tracking-[0.06px]"}>
              <svg fill={"none"} height={"20"} viewBox={"0 0 20 20"} width={"20"} className={"features-auto-app-header-icon-text"} xmlns={"http://www.w3.org/2000/svg"}>
                <path d={"M7.00098 12.708H5.00098M7.00098 9.99967H5.00098M7.00098 7.29134H5.00098M10.0013 3.95801H3.95964C3.03916 3.95801 2.29297 4.7042 2.29297 5.62467V14.3747C2.29297 15.2951 3.03916 16.0413 3.95964 16.0413H10.0013M10.0013 3.95801H16.043C16.9634 3.95801 17.7096 4.7042 17.7096 5.62467V14.3747C17.7096 15.2951 16.9634 16.0413 16.043 16.0413H10.0013M10.0013 3.95801V16.0413"} stroke={"currentColor"} strokeLinecap={"round"} strokeLinejoin={"round"} strokeWidth={"1.25"}></path>
              </svg>
              <span className={"block ml-12 mr-4 features-auto-app-header-text"}>
                {"Portaldot"}
              </span>
              <span className={"features-auto-app-header-version"}>
                {k("ver", 0) ?? (<>
                {"5"}
                </>)}
              </span>
            </div>
            <button aria-label={"New runtime"} className={"text-[9px]/16 uppercase font-600 text-white py-1 px-8 rounded-full relative overflow-hidden bg-[#272727] opacity-0"} {...b("note", 0, "text-[9px]/16 uppercase font-600 text-white py-1 px-8 rounded-full relative overflow-hidden bg-[#272727] opacity-0")}>
              {"\ud83c\udf89 "}
              <span className={"md-max:hidden"}>
                {"New runtime"}
              </span>
            </button>
          </div>
          <div className={"pt-60 pb-34 pointer-events-none"}>
            <div className={"w-30 h-30 relative mx-auto"}>
              <img alt={"Portal Canary surface"} decoding={"async"} height={"200"} loading={"lazy"} src={"/assets/images/features/auto/app-logo-light.png"} style={{} as React.CSSProperties} width={"200"} className={"lazy-image opacity-0 center"} {...b("logo", 0, "lazy-image opacity-0 center")} />
            </div>
          </div>
          <div className={"flex overflow-hidden transition-all p-20 features-auto-app-action-wrapper"} {...b("actions", 0, "flex overflow-hidden transition-all p-20 features-auto-app-action-wrapper")}>
            <div className={"features-auto-app-action w-0"}>
              <svg fill={"none"} height={"44"} viewBox={"0 0 48 44"} width={"48"} className={"float-right"} xmlns={"http://www.w3.org/2000/svg"}>
                <path d={"M11.6665 13.6667C9.36532 13.6667 7.49984 15.5322 7.49984 17.8334V24.3959C7.49984 25.7191 8.57249 26.7917 9.89567 26.7917C11.2189 26.7917 12.2915 25.7191 12.2915 24.3959V18.4584C12.2915 18.1132 12.0117 17.8334 11.6665 17.8334C11.3213 17.8334 11.0415 18.1132 11.0415 18.4584V24.3959C11.0415 25.0287 10.5285 25.5417 9.89567 25.5417C9.26284 25.5417 8.74984 25.0287 8.74984 24.3959V17.8334C8.74984 16.2226 10.0557 14.9167 11.6665 14.9167C13.2773 14.9167 14.5832 16.2226 14.5832 17.8334V24.7084C14.5832 27.1247 12.6244 29.0834 10.2082 29.0834H9.7915C7.37526 29.0834 5.4165 27.1247 5.4165 24.7084V20.9584C5.4165 20.6132 5.13668 20.3334 4.7915 20.3334C4.44633 20.3334 4.1665 20.6132 4.1665 20.9584V24.7084C4.1665 27.815 6.6849 30.3334 9.7915 30.3334H10.2082C13.3148 30.3334 15.8332 27.815 15.8332 24.7084V17.8334C15.8332 15.5322 13.9677 13.6667 11.6665 13.6667Z"} fill={"currentColor"}></path>
              </svg>
            </div>
            <div className={"pl-16 p-12 border min-w-0 rounded-13 flex gap-4 flex-1 features-auto-app-input"}>
              <div className={"text-13/20 flex-1 features-auto-app-input-text truncate"}>
                {"Submit an extrinsic..."}
              </div>
              <svg fill={"none"} height={"20"} viewBox={"0 0 20 20"} width={"20"} xmlns={"http://www.w3.org/2000/svg"}>
                <path d={"M5.83354 5.83329C5.83354 3.53211 7.69902 1.66663 10.0002 1.66663C12.3014 1.66663 14.1669 3.53211 14.1669 5.83329V9.58329C14.1669 11.8845 12.3014 13.75 10.0002 13.75C7.69902 13.75 5.83354 11.8845 5.83354 9.58329V5.83329Z"} fill={"currentColor"}></path>
                <path d={"M4.8429 11.833C4.7047 11.5167 4.33625 11.3723 4.01995 11.5105C3.70364 11.6487 3.55926 12.0172 3.69746 12.3335C4.67856 14.579 6.82565 16.2005 9.37512 16.4302V17.7082C9.37512 18.0534 9.65494 18.3332 10.0001 18.3332C10.3453 18.3332 10.6251 18.0534 10.6251 17.7082V16.4302C13.1746 16.2005 15.3217 14.579 16.3028 12.3335C16.441 12.0172 16.2966 11.6487 15.9803 11.5105C15.664 11.3723 15.2955 11.5167 15.1573 11.833C14.2888 13.821 12.3058 15.2082 10.0001 15.2082C7.69449 15.2082 5.71147 13.821 4.8429 11.833Z"} fill={"currentColor"}></path>
              </svg>
            </div>
            <div className={"features-auto-app-action w-0"}>
              <svg fill={"none"} height={"44"} viewBox={"0 0 48 44"} width={"48"} xmlns={"http://www.w3.org/2000/svg"}>
                <path d={"M31.75 22C31.75 18.5482 34.5482 15.75 38 15.75C41.4518 15.75 44.25 18.5482 44.25 22V22.8333H43.2083C41.9427 22.8333 40.9167 23.8593 40.9167 25.125V27.2083C40.9167 28.474 41.9427 29.5 43.2083 29.5C44.474 29.5 45.5 28.474 45.5 27.2083V22C45.5 18.0683 42.4747 14.8433 38.625 14.5257V14.5H38C33.8579 14.5 30.5 17.8579 30.5 22V27.2083C30.5 28.474 31.526 29.5 32.7917 29.5C34.0573 29.5 35.0833 28.474 35.0833 27.2083V25.125C35.0833 23.8593 34.0573 22.8333 32.7917 22.8333H31.75V22Z"} fill={"currentColor"}></path>
              </svg>
            </div>
          </div>
        </div>
        <div className={"absolute top-292 h-52 center-x features-auto-dock rounded-16 before:inside-border before:border-white/6 w-300 features-auto-dock"} {...b("dock", 0, "absolute top-292 h-52 center-x features-auto-dock rounded-16 before:inside-border before:border-white/6 w-300 features-auto-dock")}>
          <img alt={"App 1"} decoding={"async"} height={"40"} loading={"lazy"} src={"/assets/images/features/auto/apps/1.png"} style={{} as React.CSSProperties} width={"40"} className={"lazy-image opacity-0 absolute bottom-6 left-6"} />
          <img alt={"App 2"} decoding={"async"} height={"60"} loading={"lazy"} src={"/assets/images/features/auto/apps/2.png"} style={{} as React.CSSProperties} width={"60"} className={"lazy-image opacity-0 absolute bottom-6 left-51"} />
          <img alt={"App 3"} decoding={"async"} height={"68"} loading={"lazy"} src={"/assets/images/features/auto/apps/3.png"} style={{} as React.CSSProperties} width={"68"} className={"lazy-image opacity-0 absolute bottom-6 left-116"} />
          <img alt={"App 4"} decoding={"async"} height={"60"} loading={"lazy"} src={"/assets/images/features/auto/apps/4.png"} style={{} as React.CSSProperties} width={"60"} className={"lazy-image opacity-0 absolute bottom-6 right-51"} />
          <img alt={"App 5"} decoding={"async"} height={"40"} loading={"lazy"} src={"/assets/images/features/auto/apps/5.png"} style={{} as React.CSSProperties} width={"40"} className={"lazy-image opacity-0 absolute bottom-6 right-6"} />
        </div>
      </div>
    </div>
  );
}
