import React from "react";
import { useTranslation } from "react-i18next";
import type { Product } from "@/types/product";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PromotedProductProps {
  product: Product;
}

const PromotedProduct: React.FC<PromotedProductProps> = ({ product }) => {
  const { t } = useTranslation();

  if (!product.images?.[0]) return null;

  return (
    <div className="w-full mb-8">
      <a href={`/product/${product.id}`} className="block group">
        <Card className="relative w-full overflow-hidden border-4 border-yellow-400 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl">
          <CardContent className="p-0">
            <div className="relative w-full">
              <img
                src={product.images[0]}
                alt={product.translations[0]?.name || "Promoted Product"}
                className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Best Selling Badge */}
              <Badge className="absolute top-4 left-4 bg-yellow-400 text-black hover:bg-yellow-400 text-xs px-2 py-1 shadow-md rounded-md">
                {t("bestSelling", "Best Selling Product !")}
              </Badge>

              {/* Product Name Overlay */}
              <div className="absolute bottom-4 left-4 bg-black/60 text-white px-4 py-2 rounded-lg text-xl font-semibold backdrop-blur-sm">
                {product.translations[0]?.name}
              </div>
            </div>
          </CardContent>
        </Card>
      </a>
    </div>
  );
};

export default PromotedProduct;
