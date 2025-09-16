import Image from "next/image";

export function TravelSearchSection() {
  return (
    <section className="relative isolate min-h-[70svh] w-full">
      <Image
        src="/images/rock_cliff_background.avif"
        alt="Rock cliff background"
        fill
        sizes="100vw"
        priority={false}
        className="object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30" />

      <div className="relative mx-auto w-full max-w-[1100px] px-6 py-10 md:px-8 md:py-12">
        <div className="rounded-md bg-[#f2f2f2]/95 p-6 shadow-[0_2px_0_0_rgba(0,0,0,0.04),0_10px_30px_rgba(0,0,0,0.18)] md:p-8">
          <h3 className="mb-6 text-[clamp(1.5rem,3vw,2.25rem)] font-black tracking-[-0.01em] text-black">
            Find the best flights or hotels
          </h3>

          <form className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Reiseziel">
              <input
                aria-label="Reiseziel"
                placeholder="Ort/Region/Land/Hotel"
                className={inputClassName}
              />
            </Field>

            <Field label="Abflughafen">
              <div className="relative">
                <select
                  aria-label="Abflughafen"
                  className={`${inputClassName} appearance-none pr-10`}
                >
                  <option>Bitte wählen</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black">
                  ▾
                </span>
              </div>
            </Field>

            <Field label="Früheste Hinreise">
              <input
                aria-label="Früheste Hinreise"
                placeholder="tt.mm.jjjj"
                className={inputClassName}
              />
            </Field>

            <Field label="Späteste Rückreise">
              <input
                aria-label="Späteste Rückreise"
                placeholder="tt.mm.jjjj"
                className={inputClassName}
              />
            </Field>

            <Field label="Reisedauer">
              <div className="relative">
                <select
                  aria-label="Reisedauer"
                  className={`${inputClassName} appearance-none pr-10`}
                >
                  <option>Bitte wählen</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black">
                  ▾
                </span>
              </div>
            </Field>

            <div className="flex items-end">
              <button
                type="button"
                className="w-full rounded-md bg-black px-6 py-4 text-base font-extrabold text-white hover:bg-black/90 active:bg-black/80 md:w-auto"
              >
                Reise finden »
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[1.05rem] font-extrabold text-black">{label}</span>
      {children}
    </label>
  );
}

const inputClassName = [
  "w-full",
  "rounded-md",
  "bg-[#e7e7e7]",
  "text-black",
  "placeholder:text-[#6b6b6b]",
  "border",
  "border-[#d6d6d6]",
  "px-4",
  "py-3",
  "shadow-[inset_0_2px_0_rgba(255,255,255,0.6),_0_1px_0_rgba(0,0,0,0.06)]",
].join(" ");

export interface TravelSearchSectionProps {}
