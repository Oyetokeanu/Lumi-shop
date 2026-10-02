import { supabase } from "@/lib/supabase";
import AddToCart from "@/components/AddToCart";
export const dynamic = "force-dynamic";
const naira = (k: number) => "₦" + (k / 100).toLocaleString("en-NG");
export default async function Home() {
  const { data: products, error } = await supabase.from("products").select("*").order("category");
  return (
    <main className="mx-auto max-w-5xl px-6 py-14">
      <h1 className="max-w-2xl text-6xl leading-[1.05]">Skin that looks like it has somewhere to be.</h1>
      <p className="mt-4 max-w-md text-lg">Creams, perfumes and body lotions, made for everyday glow.</p>
      {error && <p className="mt-6 text-red-700">Error: {error.message}</p>}
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products?.map((p) => (
          <article key={p.id} className="flex flex-col rounded-2xl bg-sand p-6">
            <p className="text-sm text-gold">{p.category}</p>
            <h2 className="mt-1 text-2xl">{p.name}</h2>
            <p className="mt-2 flex-1 text-sm">{p.description}</p>
            <div className="mt-5 flex items-center justify-between">
              <span className="font-medium">{naira(p.price_kobo)}</span>
              <AddToCart id={p.id} name={p.name} price_kobo={p.price_kobo} />
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}