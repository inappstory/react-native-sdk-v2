export type ProductCartOffer = {
  offerId: string;
  groupId?: string;
  name?: string;
  description?: string;
  url?: string;
  coverUrl?: string;
  imageUrls?: string[];
  currency?: string;
  price?: string;
  oldPrice?: string;
  adult?: boolean;
  availability?: number;
  size?: string;
  color?: string;
  quantity?: number;
};

export type ProductCart = {
  offers: ProductCartOffer[];
  price?: string;
  oldPrice?: string;
  priceCurrency?: string;
};

export type ProductCartHandlers = {
  onUpdate: (
    offer: ProductCartOffer
  ) => ProductCart | null | Promise<ProductCart | null>;
  getState: () => ProductCart | null | Promise<ProductCart | null>;
};
