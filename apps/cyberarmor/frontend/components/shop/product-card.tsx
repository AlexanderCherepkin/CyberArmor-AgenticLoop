'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useCart } from '@/components/shop/cart-context';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    currency: string;
    image: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  return (
    <div className="group rounded border border-platinum/10 bg-graphite/30 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan/40 hover:bg-cyan/5 hover:shadow-[0_0_30px_-12px_rgba(102,252,241,0.15)]">
      <div className="relative aspect-square overflow-hidden rounded bg-obsidian">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>

      <h3 className="mt-4 font-heading text-lg font-semibold text-platinum transition-colors group-hover:text-cyan">
        {product.name}
      </h3>
      <p className="mt-1 text-sm text-platinum/60">{product.description}</p>

      <div className="mt-4 flex items-center justify-between">
        <span className="font-mono text-cyan">
          {product.currency} {product.price.toFixed(2)}
        </span>
        <Button
          size="sm"
          onClick={() =>
            addItem({
              id: product.id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              currency: product.currency,
            })
          }
        >
          Add
        </Button>
      </div>
    </div>
  );
}
