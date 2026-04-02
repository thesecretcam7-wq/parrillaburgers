import { createClient } from "./client";

export type ProductRating = {
  average: number;
  count: number;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    customer_name: string;
    created_at: string;
  }>;
};

/**
 * Get average rating and reviews for a specific menu item
 * Note: This is calculated client-side because reviews are per-order,
 * and items are stored as JSONB in orders. A more optimal solution would
 * be to add product_id to the reviews table directly.
 */
export async function getProductRating(menuItemId: string): Promise<ProductRating> {
  const client = createClient();

  try {
    // Fetch all reviews with their associated orders
    const { data: reviews, error: reviewsError } = await client
      .from("reviews")
      .select(
        `
        id,
        rating,
        comment,
        customer_name,
        created_at,
        order:orders (
          id,
          items
        )
        `
      );

    if (reviewsError) {
      console.error("Error fetching reviews:", reviewsError);
      return { average: 0, count: 0, reviews: [] };
    }

    if (!reviews || reviews.length === 0) {
      return { average: 0, count: 0, reviews: [] };
    }

    // Filter reviews for this specific product
    const productReviews = (reviews as any[]).filter((review) => {
      const order = review.order;
      if (!order || !order.items) return false;

      // Check if this order contains the menu_item_id
      const items = Array.isArray(order.items) ? order.items : [];
      return items.some(
        (item: any) => item.menu_item_id === menuItemId
      );
    });

    if (productReviews.length === 0) {
      return { average: 0, count: 0, reviews: [] };
    }

    // Calculate average rating
    const sum = productReviews.reduce(
      (acc, review) => acc + (review.rating || 0),
      0
    );
    const average = sum / productReviews.length;

    // Sort by newest first and format for display
    const formattedReviews = productReviews
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 10) // Show only latest 10 reviews
      .map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        customer_name: review.customer_name,
        created_at: review.created_at,
      }));

    return {
      average: Math.round(average * 10) / 10, // Round to 1 decimal place
      count: productReviews.length,
      reviews: formattedReviews,
    };
  } catch (error) {
    console.error("Error in getProductRating:", error);
    return { average: 0, count: 0, reviews: [] };
  }
}
